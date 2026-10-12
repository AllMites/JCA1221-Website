// NFC card slug rules — must match the team_members_slug_format CHECK in
// supabase/migrations/00009_team_card_slug_phone.sql. No `@/` imports so
// tests/card-slug.test.ts can run this file directly under Node.

export function normalizeCardSlug(value: string): string {
  return value.trim().toLowerCase()
}

export function isValidCardSlug(slug: string): boolean {
  return /^[a-z0-9]+$/.test(slug)
}
