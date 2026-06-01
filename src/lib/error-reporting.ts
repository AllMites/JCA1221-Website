export function reportError(error: Error, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.error('[ErrorReport]', error.message, context ?? {})
  }
  // Production monitoring: when VITE_SENTRY_DSN is configured, call Sentry.captureException here
  // import * as Sentry from '@sentry/react'
  // Sentry.captureException(error, { extra: context })
}
