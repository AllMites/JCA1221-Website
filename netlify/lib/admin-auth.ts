const ADMIN_CODE = process.env.ADMIN_CODE ?? ""

import { createHash } from 'node:crypto'

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

export function isAdminAuthorized(authHeader: string | null, clientIP?: string): boolean {
  if (!ADMIN_CODE || !authHeader) return false
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader
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
