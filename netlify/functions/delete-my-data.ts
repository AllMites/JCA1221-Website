import { createHash } from "node:crypto"
import type { Handler, HandlerEvent } from '@netlify/functions'
import { supabase } from '../lib/supabase'
import { sendMail } from '../lib/send-email'
import { json } from '../lib/cors'
import { esc } from '../lib/email-templates'

/**
 * Public endpoint for users to request data deletion.
 * Takes email address, soft-deletes matching submissions,
 * sends confirmation to the requester.
 */
const RATE_WINDOW_SEC = 60
const RATE_MAX_HR = 5

function hashIP(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

// ponytail: in-memory per instance — resets on cold start and isn't shared
// across instances. Move to a Supabase table if abuse shows up.
// (Can't count `submissions` rows: deletion requests never insert any.)
const hits = new Map<string, number[]>()

function checkRateLimit(ipHash: string): 'ok' | 'too-fast' | 'too-many' {
  const n = Date.now()
  const recent = (hits.get(ipHash) ?? []).filter((t) => n - t < 3600 * 1000)
  if (recent.some((t) => n - t < RATE_WINDOW_SEC * 1000)) return 'too-fast'
  if (recent.length >= RATE_MAX_HR) return 'too-many'
  recent.push(n)
  hits.set(ipHash, recent)
  return 'ok'
}

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') return json({ error: 'Method not allowed' }, 405)

  // Body size limit (50KB)
  const MAX_BODY = 50_000
  if (event.body && Buffer.byteLength(event.body, "utf-8") > MAX_BODY) {
    return json({ error: "Payload too large" }, 413)
  }

  let body: { email?: string }
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  // IP hash for rate limit
  const ipHash = hashIP(event.headers["client-ip"]
    ?? event.headers["x-forwarded-for"]?.split(",")[0]?.trim()
    ?? "0.0.0.0")
  const rateStatus = checkRateLimit(ipHash)
  if (rateStatus === "too-fast") {
    return json({ error: "Please wait before submitting again" }, 429)
  }
  if (rateStatus === "too-many") {
    return json({ error: "Too many requests. Please try again later." }, 429)
  }

  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return json({ error: 'Valid email required' }, 422)
  }

  const email = body.email.trim().toLowerCase()
  const now = new Date().toISOString()

  // Soft-delete all active submissions from this email
  const { data: matched, error: fetchError } = await supabase
    .from('submissions')
    .select('id, full_name')
    .eq('email', email)
    .is('deleted_at', null)

  if (fetchError) {
    console.error('[delete-my-data] DB fetch error:', fetchError)
    return json({ error: 'Internal server error' }, 500)
  }

  if (!matched || matched.length === 0) {
    // No data found — still return success (don't reveal whether email exists)
    return json({ ok: true, deleted: 0 })
  }

  const ids = matched.map((r) => r.id)
  const { error: updateError } = await supabase
    .from('submissions')
    .update({ deleted_at: now })
    .in('id', ids)

  if (updateError) {
    console.error('[delete-my-data] DB update error:', updateError)
    return json({ error: 'Internal server error' }, 500)
  }

  // Send confirmation email
  await sendMail({
    to: email,
    subject: 'Data Deletion Confirmation — JCA 1221 Holdings',
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#1e293b;margin:0 0 12px">Data Deletion Request</h2>
        <p style="color:#475569;line-height:1.6">
          We've processed your request to delete personal data associated with your email address.
        </p>
        <p style="color:#475569;line-height:1.6">
          ${matched.length} submission(s) have been removed from our active systems.
          A backup may persist in our secured archives for up to 30 days before permanent erasure.
        </p>
        <p style="color:#64748b;font-size:13px;margin-top:20px">
          Questions? Contact us at privacy@jca1221.com
        </p>
      </div>`,
    text: `Your data deletion request has been processed. ${matched.length} submission(s) removed from active systems.`,
  })

  const name = matched[0]?.full_name ?? 'Valued Partner'
  // Also notify admin
  const adminEmail = process.env.NOTIFICATION_EMAIL ?? ''
  if (adminEmail) {
    await sendMail({
      to: adminEmail,
      subject: `Data deletion request: ${email}`,
      html: `<p>${esc(name)} (${esc(email)}) has requested data deletion. ${matched.length} submissions soft-deleted.</p>`,
      text: `${name} (${email}) — ${matched.length} submissions soft-deleted.`,
    })
  }

  return json({ ok: true, deleted: matched.length })
}
