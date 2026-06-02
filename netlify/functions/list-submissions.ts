import type { Handler, HandlerEvent } from '@netlify/functions'
import { supabase } from '../lib/supabase'
import { isAdminAuthorized } from '../lib/admin-auth'
import { json } from '../lib/cors'

export const handler: Handler = async (event: HandlerEvent) => {
  // Body size limit (50KB)
  const MAX_BODY = 50_000
  if (event.body && Buffer.byteLength(event.body, "utf-8") > MAX_BODY) {
    return json({ error: "Payload too large" }, 413)
  }

  if (event.httpMethod !== 'GET') return json({ error: 'Method not allowed' }, 405)
  if (!isAdminAuthorized(event.headers.authorization ?? null, event.headers["client-ip"] ?? event.headers["x-forwarded-for"]?.split(",")[0]?.trim())) {
    return json({ error: 'Unauthorized' }, 401)
  }

  const page = Math.max(1, parseInt(event.queryStringParameters?.page ?? '1', 10))
  const perPage = Math.min(50, Math.max(1, parseInt(event.queryStringParameters?.per_page ?? '20', 10)))
  const status = event.queryStringParameters?.status ?? 'active' // 'active' | 'all' | 'deleted'
  const offset = (page - 1) * perPage

  let query = supabase
    .from('submissions')
    .select('id, full_name, email, organization, message, phone, role, project_type, estimated_timeline, acknowledged, created_at, deleted_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1)

  if (status === 'active') {
    query = query.is('deleted_at', null)
  } else if (status === 'deleted') {
    query = query.not('deleted_at', 'is', null)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('[list-submissions] DB error:', error)
    return json({ error: 'Internal server error' }, 500)
  }

  return json({
    submissions: (data ?? []).map((r) => ({
      ...r,
      created_at: r.created_at,
      deleted_at: r.deleted_at,
    })),
    total: count ?? 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  })
}
