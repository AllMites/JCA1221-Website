const ADMIN_CODE = process.env.ADMIN_CODE ?? ""

import { createHash } from 'node:crypto'
import { supabase } from './supabase'

type AttemptRec = { count: number; windowStart: number }
const attempts = new Map<string, AttemptRec>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MINUTES = 15

function cleanAttempts(nowMs: number) {
  const cutoff = nowMs - LOCKOUT_MINUTES * 60 * 1000
  for (const [key, rec] of attempts) {
    if (rec.windowStart < cutoff) attempts.delete(key)
  }
}

function hashIPAuth(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 16)
}

/**
 * Verify a Supabase JWT and check the user has editor or admin role.
 * Returns true if valid, false otherwise.
 */
async function verifySupabaseToken(token: string): Promise<boolean> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return false

    // Check profiles table for role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    return profile?.role === 'editor' || profile?.role === 'admin'
  } catch {
    return false
  }
}

export async function isAdminAuthorized(authHeader: string | null, clientIP?: string): Promise<boolean> {
  if (!authHeader) return false
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader

  // Try Supabase JWT verification first
  if (token.length > 20) {
    const supabaseValid = await verifySupabaseToken(token)
    if (supabaseValid) return true
  }

  // Fall back to ADMIN_CODE for direct API / script access
  if (!ADMIN_CODE) return false

  if (clientIP) {
    const n = Date.now()
    cleanAttempts(n)
    const key = hashIPAuth(clientIP)
    const rec = attempts.get(key)
    if (rec && rec.count >= MAX_ATTEMPTS) {
      if (n - rec.windowStart < LOCKOUT_MINUTES * 60 * 1000) {
        return false
      }
      attempts.delete(key)
    }
  }

  const valid = token === ADMIN_CODE
  if (!valid && clientIP) {
    const key = hashIPAuth(clientIP)
    const rec = attempts.get(key) ?? { count: 0, windowStart: Date.now() }
    rec.count++
    attempts.set(key, rec)
  }
  if (valid && clientIP) {
    attempts.delete(hashIPAuth(clientIP))
  }
  return valid
}
