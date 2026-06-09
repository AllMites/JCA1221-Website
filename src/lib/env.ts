export const env = {
  get sentryDsn(): string | undefined {
    return import.meta.env.VITE_SENTRY_DSN
  },

  get analyticsId(): string | undefined {
    return import.meta.env.VITE_ANALYTICS_ID
  },

  get isProduction(): boolean {
    return import.meta.env.PROD
  },

  get isDevelopment(): boolean {
    return import.meta.env.DEV
  },

  get supabaseUrl(): string {
    return import.meta.env.VITE_SUPABASE_URL ?? ''
  },

  get supabaseAnonKey(): string {
    return import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''
  },
} as const
