import { createClient } from '@supabase/supabase-js'
import { env } from './env'

/**
 * Hard timeout on every Supabase request. Without this, a stalled first-load
 * request (cold TLS handshake, flaky mobile network) hangs forever and the page
 * stays stuck on its skeleton until the user manually refreshes.
 * One automatic retry for idempotent (GET-like) requests.
 */
const FETCH_TIMEOUT_MS = 6_000

async function timeoutFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const method = init?.method ?? 'GET'
  const maxAttempts = method === 'GET' || method === 'HEAD' ? 2 : 1
  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fetch(input, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) })
    } catch (err) {
      lastError = err
    }
  }
  // Rethrow as AbortError: postgrest-js treats AbortError as non-retryable
  // (a plain TimeoutError would trigger its own 3x exponential-backoff retry
  // cycle, keeping the page stuck on the skeleton far past our timeout).
  throw lastError instanceof DOMException && lastError.name === 'TimeoutError'
    ? new DOMException(`Supabase request timed out after ${FETCH_TIMEOUT_MS}ms`, 'AbortError')
    : lastError
}

/** True when VITE_SUPABASE_URL contains an actual project URL (not placeholder). */
export const hasSupabaseCredentials =
  env.supabaseUrl.startsWith('https://') &&
  env.supabaseUrl !== 'https://placeholder-project.supabase.co' &&
  env.supabaseAnonKey.length > 10

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  global: { fetch: timeoutFetch },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'jca_admin_session',
  },
})
