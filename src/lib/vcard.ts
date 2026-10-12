// vCard 3.0 builder for the NFC team card page ("Save contact").
// No `@/` imports — tests/vcard.test.ts runs this file directly under Node.

export interface VCardInput {
  name: string
  role: string
  credentials: string | null
  phone: string | null
  email: string | null
  url: string
  org?: string
}

function esc(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\r?\n/g, '\\n')
}

export function buildVCard({ name, role, credentials, phone, email, url, org = 'JCA 1221 Holdings' }: VCardInput): string {
  const parts = name.trim().split(/\s+/)
  const family = parts.length > 1 ? parts.pop()! : ''
  const given = parts.join(' ')

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${esc(name)}`,
    `N:${esc(family)};${esc(given)};;;`,
    `ORG:${esc(org)}`,
    `TITLE:${esc(role)}`,
  ]
  if (phone) lines.push(`TEL;TYPE=CELL:${phone}`)
  if (email) lines.push(`EMAIL;TYPE=WORK:${email}`)
  lines.push(`URL:${url}`)
  if (credentials) lines.push(`NOTE:${esc(credentials)}`)
  lines.push('END:VCARD')
  return lines.join('\r\n') + '\r\n'
}

export function vcardFilename(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return `${slug || 'contact'}.vcf`
}
