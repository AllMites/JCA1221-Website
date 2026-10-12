import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildVCard, vcardFilename } from '../src/lib/vcard.ts'

const base = {
  name: 'Zara C. See', role: 'CFO & COO', credentials: null,
  phone: '+639171234567', email: 'zara.see@jca1221-group.com', url: 'https://jca1221.com/team/zarasee',
}

test('wraps with BEGIN/END and uses CRLF', () => {
  const v = buildVCard(base)
  assert.ok(v.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n'))
  assert.ok(v.endsWith('END:VCARD\r\n'))
})

test('includes FN, N, ORG, TITLE, TEL, EMAIL, URL', () => {
  const v = buildVCard(base)
  for (const line of ['FN:Zara C. See', 'N:See;Zara C.;;;', 'ORG:JCA 1221 Holdings', 'TITLE:CFO & COO',
    'TEL;TYPE=CELL:+639171234567', 'EMAIL;TYPE=WORK:zara.see@jca1221-group.com',
    'URL:https://jca1221.com/team/zarasee']) assert.ok(v.includes(line + '\r\n'), line)
})

test('omits TEL and EMAIL when null', () => {
  const v = buildVCard({ ...base, phone: null, email: null })
  assert.ok(!v.includes('TEL'))
  assert.ok(!v.includes('EMAIL'))
})

test('escapes comma, semicolon, backslash, newline', () => {
  const v = buildVCard({ ...base, role: 'A, B; C\\D\nE' })
  assert.ok(v.includes('TITLE:A\\, B\\; C\\\\D\\nE\r\n'))
})

test('credentials go in NOTE', () => {
  assert.ok(buildVCard({ ...base, credentials: 'Chem. Engr.' }).includes('NOTE:Chem. Engr.\r\n'))
})

test('filename slugifies', () => {
  assert.equal(vcardFilename('Jehremiah C. Asis'), 'jehremiah-c-asis.vcf')
})
