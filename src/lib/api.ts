/**
 * API client for Netlify functions.
 */
const BASE = '/.netlify/functions'

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { error?: string }).error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}

function authedRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const code = sessionStorage.getItem('jca_admin_code')
  return request<T>(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(code ? { Authorization: `Bearer ${code}` } : {}),
      ...(options?.headers ?? {}),
    },
  })
}

// ── Submit contact form ────────────────────────────────────────────────

export interface ContactPayload {
  fullName: string
  email: string
  organization: string
  message: string
  phone?: string
  role?: string
  projectType?: string
  estimatedTimeline?: string
}

export async function submitContact(data: ContactPayload): Promise<void> {
  await request('/submit-contact', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// ── Admin API ──────────────────────────────────────────────────────────

export interface Submission {
  id: string
  full_name: string
  email: string
  organization: string
  message: string
  phone: string | null
  role: string | null
  project_type: string | null
  estimated_timeline: string | null
  acknowledged: boolean
  created_at: string
  deleted_at: string | null
}

export interface ListResponse {
  submissions: Submission[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export async function listSubmissions(
  page = 1,
  status: 'active' | 'all' | 'deleted' = 'active',
): Promise<ListResponse> {
  return authedRequest(`/list-submissions?page=${page}&status=${status}`)
}

export async function acknowledgeSubmission(
  id: string,
  acknowledged = true,
): Promise<void> {
  await authedRequest('/acknowledge-submission', {
    method: 'POST',
    body: JSON.stringify({ id, acknowledged }),
  })
}

export async function softDeleteSubmission(
  id: string,
  action: 'soft' | 'restore' = 'soft',
): Promise<void> {
  await authedRequest('/delete-submission', {
    method: 'POST',
    body: JSON.stringify({ id, action }),
  })
}

// ── Data deletion (public) ─────────────────────────────────────────────

export async function requestDataDeletion(email: string): Promise<void> {
  await request('/delete-my-data', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}
