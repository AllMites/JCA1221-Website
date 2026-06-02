/** Headers applied to every function response. */
export const CORS_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
}

/** Helper to build a JSON response. */
export function json(
  body: unknown,
  statusCode = 200,
  extraHeaders?: Record<string, string>,
) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, ...extraHeaders },
    body: JSON.stringify(body),
  }
}
