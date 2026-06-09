import { createClient } from '@supabase/supabase-js'
import { env } from './env'

/** True when VITE_SUPABASE_URL contains an actual project URL (not placeholder). */
export const hasSupabaseCredentials =
  env.supabaseUrl.startsWith('https://') &&
  env.supabaseUrl !== 'https://placeholder-project.supabase.co' &&
  env.supabaseAnonKey.length > 10

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'jca_admin_session',
  },
})
