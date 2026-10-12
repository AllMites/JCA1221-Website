// E2E for the NFC card page (/team/:slug). Supabase REST is stubbed so the
// test runs before migrations are applied and never depends on live data.
//
//   VITE_SUPABASE_URL=https://stub.supabase.co VITE_SUPABASE_ANON_KEY=stub-anon-key-for-e2e npm run build
//   npx vite preview --port 4173 &
//   node tests/card-page.e2e.mjs
import { chromium } from 'playwright'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const BASE = process.env.CARD_E2E_BASE ?? 'http://localhost:4173'

const JEHREMIAH = {
  id: '1', name: 'Jehremiah C. Asis', role: 'Founder & President', credentials: 'Atty.',
  photo: null, bio: 'Bio text for the test.', quote: null, expertise: [],
  links: [
    { type: 'email', label: 'jehremiah.asis@jca1221-group.com', url: 'mailto:jehremiah.asis@jca1221-group.com' },
    { type: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/jehremiah-asis' },
  ],
  slug: 'jehremiahasis', phone: null, order: 1, published: true,
}
const MEMBERS = [JEHREMIAH, { ...JEHREMIAH, id: '2', name: 'Zara C. See', role: 'CFO & COO', slug: 'zarasee', phone: '+639171234567' }]

async function stubSupabase(page) {
  // Registered first so the team_members route below takes precedence.
  await page.route('**/rest/v1/**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
  await page.route('**/rest/v1/team_members*', (route) => {
    const url = new URL(route.request().url())
    const slugFilter = url.searchParams.get('slug')
    const rows = slugFilter ? MEMBERS.filter((m) => `eq.${m.slug}` === slugFilter) : MEMBERS
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(rows) })
  })
}

async function launch() {
  try { return await chromium.launch() }
  catch { return chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }) }
}

const browser = await launch()
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true })
const page = await context.newPage()
await stubSupabase(page)
let failures = 0

async function check(name, fn) {
  try { await fn(); console.log(`ok - ${name}`) }
  catch (e) { failures++; console.log(`not ok - ${name}\n  ${e.message.split('\n')[0]}`) }
}

await check('card renders name, email link and noindex', async () => {
  await page.goto(`${BASE}/team/jehremiahasis`)
  await page.getByRole('heading', { name: 'Jehremiah C. Asis' }).waitFor({ timeout: 10000 })
  assert.ok(await page.locator('a[href="mailto:jehremiah.asis@jca1221-group.com"]').isVisible())
  assert.equal(await page.locator('meta[name="robots"][content="noindex, nofollow"]').count(), 1)
})

await check('no phone -> no tel: link', async () => {
  assert.equal(await page.locator('a[href^="tel:"]').count(), 0)
})

await check('Save contact downloads a .vcf with FN', async () => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /save contact/i }).click(),
  ])
  assert.match(download.suggestedFilename(), /\.vcf$/)
  const text = await readFile(await download.path(), 'utf8')
  assert.ok(text.includes('FN:Jehremiah C. Asis'))
  assert.ok(!text.includes('TEL'))
})

await check('phone present -> tel: link', async () => {
  await page.goto(`${BASE}/team/zarasee`)
  await page.getByRole('heading', { name: 'Zara C. See' }).waitFor({ timeout: 10000 })
  assert.equal(await page.locator('a[href="tel:+639171234567"]').count(), 1)
})

await check('mixed case + trailing slash still loads', async () => {
  await page.goto(`${BASE}/team/JehremiahAsis/`)
  await page.getByRole('heading', { name: 'Jehremiah C. Asis' }).waitFor({ timeout: 10000 })
})

await check('unknown slug -> 404 page', async () => {
  await page.goto(`${BASE}/team/nobody`)
  await page.getByText('Page not found').waitFor({ timeout: 10000 })
})

await check('/team does not link to card pages', async () => {
  await page.goto(`${BASE}/team`)
  await page.getByText('Meet Our Team').first().waitFor({ timeout: 10000 })
  assert.equal(await page.locator('a[href^="/team/"]').count(), 0)
})

await browser.close()
console.log(failures ? `# fail ${failures}` : '# pass')
process.exit(failures ? 1 : 0)
