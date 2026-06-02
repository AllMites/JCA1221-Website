import type { Handler, HandlerEvent } from '@netlify/functions'
import { createHash } from 'node:crypto'
import { supabase } from '../lib/supabase'
import { sendMail } from '../lib/send-email'
import { json } from '../lib/cors'
import { notificationEmail, autoResponderEmail } from '../lib/email-templates'

interface ContactPayload {
  fullName: string
  email: string
  organization: string
  message: string
  phone?: string
  role?: string
  projectType?: string
  estimatedTimeline?: string
}

// ── Validation ─────────────────────────────────────────────────────────

function validate(payload: unknown): payload is ContactPayload {
  if (!payload || typeof payload !== 'object') return false
  const p = payload as Record<string, unknown>
  const required = ['fullName', 'email', 'organization', 'message'] as const
  for (const field of required) {
    if (typeof p[field] !== 'string' || !p[field]!.toString().trim()) {
      return false
    }
  }
  // Basic email check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email as string)) return false
  // Message minimum length
  if ((p.message as string).trim().length < 20) return false
  // Field length limits
  if ((p.fullName as string).trim().length > 200) return false
  if ((p.email as string).trim().length > 254) return false
  if ((p.organization as string).trim().length > 300) return false
  if ((p.message as string).trim().length > 10_000) return false
  if (p.phone && (p.phone as string).trim().length > 50) return false
  if (p.role && (p.role as string).trim().length > 100) return false
  if (p.projectType && (p.projectType as string).trim().length > 200) return false
  if (p.estimatedTimeline && (p.estimatedTimeline as string).trim().length > 100) return false
  return true
}

// ── Rate limit ─────────────────────────────────────────────────────────

const RATE_WINDOW_SECONDS = 30
const RATE_MAX_PER_HOUR = 10

/** Hash an IP for storage (one-way, not reversible). */
function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

async function checkRateLimit(ipHash: string): Promise<'ok' | 'too-fast' | 'too-many'> {
  const windowAgo = new Date(Date.now() - RATE_WINDOW_SECONDS * 1000)
  const hourAgo = new Date(Date.now() - 3600 * 1000)

  // Recent attempt (within 30s window)?
  const { data: recent } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('source_ip_hash', ipHash)
    .gte('created_at', windowAgo.toISOString())

  if (recent && recent.length > 0) return 'too-fast'

  // Hourly limit
  const { count: hourly } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('source_ip_hash', ipHash)
    .gte('created_at', hourAgo.toISOString())

  if (hourly && hourly >= RATE_MAX_PER_HOUR) return 'too-many'

  return 'ok'
}

// ── Handler ────────────────────────────────────────────────────────────

export const handler: Handler = async (event: HandlerEvent) => {
    // Body size limit (50KB)
    const MAX_BODY = 50_000
    if (event.body && Buffer.byteLength(event.body, "utf-8") > MAX_BODY) {
      return json({ error: "Payload too large" }, 413)
    }

  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return json({ error: 'Method not allowed' }, 405)
  }

  // Parse body
  let payload: unknown
  try {
    payload = JSON.parse(event.body ?? '{}')
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  // Validate
  if (!validate(payload)) {
    return json({ error: 'Validation failed — all required fields must be filled' }, 422)
  }

  // IP hash for rate limit
  const ipHash = hashIP(event.headers['client-ip']
    ?? event.headers['x-forwarded-for']?.split(',')[0]?.trim()
    ?? '0.0.0.0')

  // Rate limit check
  const rateStatus = await checkRateLimit(ipHash)
  if (rateStatus === 'too-fast') {
    return json({ error: 'Please wait before submitting again' }, 429)
  }
  if (rateStatus === 'too-many') {
    return json({ error: 'Too many submissions. Please try again later.' }, 429)
  }

  // ── Store in Supabase ──────────────────────────────────────────────
  const { error: dbError } = await supabase.from('submissions').insert({
    full_name: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    organization: payload.organization.trim(),
    message: payload.message.trim(),
    phone: payload.phone?.trim() || null,
    role: payload.role?.trim() || null,
    project_type: payload.projectType?.trim() || null,
    estimated_timeline: payload.estimatedTimeline?.trim() || null,
    source_ip_hash: ipHash,
    user_agent: (event.headers['user-agent'] ?? '').slice(0, 500),
  })

  if (dbError) {
    console.error('[submit-contact] DB insert error:', dbError)
    return json({ error: 'Internal server error' }, 500)
  }

  // ── Send emails (fire-and-forget — don't block response) ───────────
  const adminEmail = process.env.NOTIFICATION_EMAIL ?? ''
  const notify = notificationEmail(payload as ContactPayload)
  const autoReply = autoResponderEmail(payload.fullName)

  // Run both emails in parallel, don't fail if one errors
  await Promise.allSettled([
    adminEmail ? sendMail({ to: adminEmail, ...notify }) : Promise.resolve(),
    sendMail({ to: payload.email, ...autoReply }),
  ])

  return json({ ok: true }, 200)
}
