import { test } from 'node:test'
import assert from 'node:assert/strict'
import { normalizeCardSlug, isValidCardSlug } from '../src/lib/card-slug.ts'

test('normalizes case and whitespace', () => {
  assert.equal(normalizeCardSlug('  ZaraSee '), 'zarasee')
})

test('accepts lowercase letters and digits', () => {
  assert.ok(isValidCardSlug('zarasee'))
  assert.ok(isValidCardSlug('jca1221'))
})

test('rejects hyphens, spaces, dots and empty', () => {
  for (const bad of ['zara-see', 'zara see', 'zara.see', '']) assert.ok(!isValidCardSlug(bad), bad)
})
