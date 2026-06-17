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

  if (event.httpMethod !== 'POST') return json({ error: 'Method not allowed' }, 405)
  if (!(await isAdminAuthorized(event.headers.authorization ?? null, event.headers["client-ip"] ?? event.headers["x-forwarded-for"]?.split(",")[0]?.trim()))) {
    return json({ error: 'Unauthorized' }, 401)
  }

  let body: { id?: string; action?: 'soft' | 'restore' }
  try {
    body = JSON.parse(event.body ?? '{}')
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  if (!body.id) {
    return json({ error: 'Missing submission id' }, 422)
  }

  const now = new Date().toISOString()
  const isDelete = body.action !== 'restore'

  const { error: updateError } = await supabase
    .from('submissions')
    .update({ deleted_at: isDelete ? now : null })
    .eq('id', body.id)

  if (updateError) {
    console.error('[delete-submission] DB error:', updateError)
    return json({ error: 'Internal server error' }, 500)
  }

  // Log audit trail
  await supabase.from('admin_actions').insert({
    submission_id: body.id,
    action: isDelete ? 'deleted' : 'undeleted',
  }).maybeSingle()

  return json({ ok: true })
}
