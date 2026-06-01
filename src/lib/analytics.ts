/**
 * Analytics module — consent-aware, provider-agnostic.
 *
 * Currently emits to `window.gtag` (Google Analytics 4 / Google Tag Manager).
 * To switch to Plausible, Fathom, or another provider, swap the `send()`
 * implementation — the rest of the codebase calls these helpers and doesn't
 * need to know which provider is wired.
 *
 * Events are suppressed until cookie consent is granted.  If the user hasn't
 * made a choice yet, events are queued and flushed on consent.
 */

// ── Consent state ──────────────────────────────────────────────────────────

const CONSENT_KEY = 'jca1221_cookie_consent'

export type ConsentCategory = 'analytics' | 'marketing'

export interface ConsentState {
  analytics: boolean
  marketing: boolean
}

let consentState: ConsentState = loadConsent()

function loadConsent(): ConsentState {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (raw) return JSON.parse(raw) as ConsentState
  } catch { /* corrupt — treat as no consent */ }
  return { analytics: false, marketing: false }
}

export function getConsent(): ConsentState {
  return { ...consentState }
}

export function hasConsent(category: ConsentCategory): boolean {
  return consentState[category] === true
}

export function setConsent(state: ConsentState): void {
  consentState = { ...state }
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consentState))
  } catch { /* quota exceeded — ignore */ }
  if (state.analytics) flushQueue()
}

export function hasChosenConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) !== null
  } catch {
    return false
  }
}

// ── Event queue ────────────────────────────────────────────────────────────

interface QueuedEvent {
  name: string
  params?: Record<string, string | number | boolean>
}

const queue: QueuedEvent[] = []

function flushQueue(): void {
  while (queue.length > 0) {
    const ev = queue.shift()
    if (ev) sendImmediate(ev.name, ev.params)
  }
}

// ── Provider implementation (swap here for non-GA providers) ───────────────

function sendImmediate(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    ;(window as any).gtag('event', eventName, params)
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Track a named event.  If analytics consent hasn't been granted yet the
 * event is silently queued and will be sent when the user opts in.
 *
 * Event naming convention: snake_case, verb_noun.
 * Examples: "page_view", "cta_click", "form_submit", "project_view"
 */
export function track(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!consentState.analytics) {
    queue.push({ name: eventName, params })
    return
  }
  sendImmediate(eventName, params)
}

/**
 * Track a page view.  Call once per route change.
 */
export function trackPageView(
  path: string,
  title?: string,
): void {
  track('page_view', {
    page_path: path,
    page_title: title ?? (typeof document !== 'undefined' ? document.title : ''),
  })
}

/**
 * Track a user click on a CTA / conversion element.
 */
export function trackClick(
  label: string,
  category?: string,
): void {
  track('cta_click', {
    label,
    category: category ?? 'general',
  })
}

/**
 * Track a form submission.
 */
export function trackFormSubmit(
  formName: string,
  hasDetailedFields?: boolean,
): void {
  track('form_submit', {
    form_name: formName,
    detailed: hasDetailedFields ?? false,
  })
}

/**
 * Track external link click.
 */
export function trackExternalLink(
  url: string,
  label?: string,
): void {
  track('external_link_click', {
    url,
    label: label ?? url,
  })
}

/**
 * Track file download.
 */
export function trackDownload(
  fileName: string,
): void {
  track('file_download', { file_name: fileName })
}
