const ADMIN_CODE = process.env.ADMIN_CODE ?? ''

/**
 * Simple password check for admin endpoints.
 * Client sends code in Authorization: Bearer <code> header.
 */
export function isAdminAuthorized(authHeader: string | null): boolean {
  if (!ADMIN_CODE || !authHeader) return false
  // Accept both "Bearer <code>" and bare "<code>"
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader
  return token === ADMIN_CODE
}
