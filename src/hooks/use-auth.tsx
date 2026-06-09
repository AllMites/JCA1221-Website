import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserProfile, UserRole } from '@/lib/content-types'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isEditor: boolean
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isEditor: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session ?? null)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session ?? null)
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId: string) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data as UserProfile | null)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const role = profile?.role

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAuthenticated: !!user && !!profile,
        isAdmin: role === 'admin',
        isEditor: role === 'editor' || role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

// ── Convenience hooks ──
export function useRequireAuth() {
  const auth = useAuth()
  return auth
}

export function useRequireAdmin() {
  const auth = useAuth()
  return auth
}

export function useRequireEditor() {
  const auth = useAuth()
  return auth
}
