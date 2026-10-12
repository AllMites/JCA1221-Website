# NFC Team Card Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Each team member gets a mobile digital business card at `jca1221.com/team/<slug>`, reached by tapping their NFC calling card. It isn't linked from anywhere on the site and is kept out of search engines.

**Architecture:** Add two nullable columns, `slug` and `phone`, to `team_members`. Public data is fine, per Zara. A new lazy route `/team/:slug` renders `CardPage`, which loads one published member by slug and shows a tap-to-call / email / LinkedIn / "Save contact" card. "Save contact" downloads a vCard built by a pure function. Search engines are kept out by a `noindex` meta tag through `PageSEO` and an `X-Robots-Tag` header in Netlify, and the page is left out of the sitemap. Editors set slug and phone in the existing admin `TeamForm`.

**Tech Stack:** React + react-router-dom (`createBrowserRouter`), Supabase (Postgres + RLS), react-helmet-async, Netlify, Node 22 built-in test runner (`node --test`), Playwright (already a dependency).

**Spec:** Slack thread with Zara See, 2026-10-12 (screenshots in session). Summary: NFC card → `jca1221.com/team/jehremiahasis`. The page shows contact info (cellphone, email, credentials). It isn't clickable or linked from the website and is only reachable through that URL. Not a private link, but `noindex`.

## Global Constraints

- URL format: `/team/<firstname><lastname>`, all lowercase, no separators. Slugs: `jehremiahasis`, `katherineasis`, `odysseusalfon`, `constantinedoncila`, `zarasee`.
- No link to `/team/:slug` anywhere in the site UI, the nav or `public/sitemap.xml`.
- The existing `/team` page and `TeamMemberCard` stay unchanged.
- Emails come from `00008_team_emails.sql` (the `type: 'email'` entry in `links`). Don't add a separate email column.
- `phone` is stored in E.164 format (`+639XXXXXXXXX`). Real numbers come from Zara. The migration leaves them `NULL`, and editors fill them in through admin.
- The repo gate must pass: `sh gates/run.sh` (typecheck + diff-scoped lint, `--max-warnings=0`).

## Review Focus

1. **Member with no phone yet** (the state at launch): the call button is hidden and the vCard has no `TEL` line. Test in Task 2 and Task 3.
2. **Unknown or unpublished slug** (`/team/nobody`): renders `NotFoundPage`, not an endless skeleton or a blank page. Test in Task 3.
3. **Mixed case / trailing slash** (`/team/JehremiahAsis/`): the slug is lowercased before lookup and the card still loads. Test in Task 3.
4. **Commas, semicolons or accents in names, roles or credentials** (e.g. `Chem. Engr.`, `CFO & COO`): the vCard escapes `,` `;` `\` and newlines, so phones import it intact. Test in Task 2.
5. **No Supabase credentials** (local dev without `.env`): the hook returns `null`, so the page shows not-found instead of crashing. Covered by the Task 3 hook contract.

---

### Task 1: Schema — slug + phone on team_members

**Files:**
- Create: `supabase/migrations/00009_team_card_slug_phone.sql`
- Modify: `src/lib/content-types.ts:82-94` (`TeamMember`)
- Modify: `src/components/admin/TeamForm.tsx` (two new inputs + save payload)

**Interfaces:**
- Produces: `team_members.slug text UNIQUE NULL` and `team_members.phone text NULL`. `TeamMember` gains `slug: string | null` and `phone: string | null`.

- [ ] **Step 1: Write the migration**
  - `ALTER TABLE team_members ADD COLUMN IF NOT EXISTS slug text UNIQUE, ADD COLUMN IF NOT EXISTS phone text;`
  - `ADD CONSTRAINT team_members_slug_format CHECK (slug ~ '^[a-z0-9]+$')`
  - `UPDATE … SET slug = … WHERE name = …` for the 5 names exactly as in `00005` (`Jehremiah C. Asis`, `Katherine F. Asis`, `Odysseus C. Alfon`, `Constantine A. Doncila`, `Zara C. See`).
  - The existing RLS policy "Public can read published team" already covers the new columns, so no policy change is needed.

- [ ] **Step 2: Verify the migration on a throwaway Postgres 16** (same method as 00008)

Run: create a minimal `team_members(name, published, links)` table with the 5 rows, apply 00009, then `select name, slug from team_members order by slug;`
Expected: 5 rows with the slugs above. A second apply is a no-op except the constraint, so wrap it in `DO $$ … IF NOT EXISTS … $$`. `update team_members set slug='Bad-Slug'` fails with a check violation.

- [ ] **Step 3: Add the fields to `TeamMember` and `TeamForm`**
  - Two text inputs: "Card URL slug", with helper text `jca1221.com/team/<slug>` and a lowercase/no-spaces hint, and "Mobile number (+63…)".
  - Save sends `slug: slug.trim().toLowerCase() || null` and `phone: phone.replace(/[^\d+]/g, '') || null`.
  - Follow the existing `credentials` state/input pattern in that file.

- [ ] **Step 4: Gate**

Run: `sh gates/run.sh`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/00009_team_card_slug_phone.sql src/lib/content-types.ts src/components/admin/TeamForm.tsx
git commit -m "feat: add slug and phone to team members for NFC card pages"
```

---

### Task 2: vCard builder

**Files:**
- Create: `src/lib/vcard.ts` (no `@/` imports, so Node can run it directly)
- Test: `tests/vcard.test.ts` (outside `tsconfig` include; run with `node --test`)

**Interfaces:**
- Produces:
  ```ts
  export interface VCardInput {
    name: string; role: string; credentials: string | null
    phone: string | null; email: string | null; url: string
    org?: string // default 'JCA 1221 Holdings'
  }
  export function buildVCard(input: VCardInput): string // vCard 3.0, CRLF line endings
  export function vcardFilename(name: string): string    // 'Jehremiah C. Asis' -> 'jehremiah-c-asis.vcf'
  ```

- [ ] **Step 1: Write the failing tests**

```ts
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildVCard, vcardFilename } from '../src/lib/vcard.ts'

const base = { name: 'Zara C. See', role: 'CFO & COO', credentials: null,
  phone: '+639171234567', email: 'zara.see@jca1221-group.com', url: 'https://jca1221.com/team/zarasee' }

test('wraps with BEGIN/END and uses CRLF', () => {
  const v = buildVCard(base)
  assert.ok(v.startsWith('BEGIN:VCARD\r\nVERSION:3.0\r\n'))
  assert.ok(v.endsWith('END:VCARD\r\n'))
})
test('includes FN, ORG, TITLE, TEL, EMAIL, URL', () => {
  const v = buildVCard(base)
  for (const line of ['FN:Zara C. See', 'ORG:JCA 1221 Holdings', 'TITLE:CFO & COO',
    'TEL;TYPE=CELL:+639171234567', 'EMAIL;TYPE=WORK:zara.see@jca1221-group.com',
    'URL:https://jca1221.com/team/zarasee']) assert.ok(v.includes(line + '\r\n'), line)
})
test('omits TEL and EMAIL when null', () => {
  const v = buildVCard({ ...base, phone: null, email: null })
  assert.ok(!v.includes('TEL')); assert.ok(!v.includes('EMAIL'))
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
```

- [ ] **Step 2: Run, expect FAIL**

Run: `node --test tests/vcard.test.ts`
Expected: FAIL, cannot find module `src/lib/vcard.ts`.

- [ ] **Step 3: Implement `buildVCard` / `vcardFilename` in `src/lib/vcard.ts`**
  - Escape order: `\` first, then `,` `;` `\n`.
  - Also emit `N:` as `lastWord;restOfName;;;`, e.g. `N:See;Zara C.;;;`.

- [ ] **Step 4: Run, expect PASS**

Run: `node --test tests/vcard.test.ts`
Expected: 6 passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/vcard.ts tests/vcard.test.ts
git commit -m "feat: vCard builder for team card pages"
```

---

### Task 3: `/team/:slug` card page + noindex

**Files:**
- Modify: `src/hooks/use-content.ts` (add `useTeamMemberBySlug` after `useTeam`, ~line 150)
- Create: `src/pages/CardPage.tsx`
- Modify: `src/pages/index.ts` (export, if the barrel lists pages)
- Modify: `src/lib/router.tsx` (lazy import near line 87; route after `/team` at line 186)
- Modify: `netlify.toml` (add `[[headers]]` for `/team/*`)
- Test: `tests/card-page.e2e.mjs` (Playwright script run against `vite preview`)

**Interfaces:**
- Consumes: `TeamMember` with `slug`/`phone` (Task 1), `buildVCard`, `vcardFilename` (Task 2), and `PageSEO({ title, description, noIndex })` from `src/components/PageSEO.tsx`.
- Produces:
  ```ts
  export function useTeamMemberBySlug(slug: string): { member: TeamMember | null; loading: boolean }
  // supabase.from('team_members').select('*').eq('slug', slug.toLowerCase()).eq('published', true).maybeSingle()
  // returns { member: null, loading: false } when !hasSupabaseCredentials or no row
  export function CardPage(): JSX.Element
  ```

- [ ] **Step 1: Write the e2e script** (fails until the page exists)

`tests/card-page.e2e.mjs` uses `chromium` from `playwright` against `http://localhost:4173` with a 390×844 viewport. It loads Supabase creds from `netlify.toml`, which are already baked into the build. Assertions:
  - `/team/jehremiahasis` → heading text `Jehremiah C. Asis`; `a[href="mailto:jehremiah.asis@jca1221-group.com"]` visible; `meta[name="robots"][content="noindex, nofollow"]` present.
  - `/team/JehremiahAsis/` → same heading (Review Focus 3).
  - With no phone in the DB yet: `a[href^="tel:"]` count is 0 (Review Focus 1).
  - `/team/nobody` → the NotFoundPage text is visible (Review Focus 2).
  - Clicking "Save contact" fires a `download` event, its suggested filename ends with `.vcf`, and the file content contains `FN:Jehremiah C. Asis`.
  - `/team` has no `a[href^="/team/"]` (not linked from the site).

- [ ] **Step 2: Run, expect FAIL**

Run: `npm run build && (npx vite preview --port 4173 &) && node tests/card-page.e2e.mjs`
Expected: FAIL on the first assertion (the route hits NotFound).
Note: this needs migrations 00008 and 00009 applied to Supabase. If they aren't applied yet, run against a page stubbed with `?mock=1`, or mark it blocked and report it.

- [ ] **Step 3: Implement `useTeamMemberBySlug`**, following the `useProject`/`fetchBySlug` pattern in the same file.

- [ ] **Step 4: Implement `CardPage`**
  - Reads `useParams().slug` and strips a trailing slash. While loading it shows `<PageSkeleton />`, and `<NotFoundPage />` when `!member`.
  - Layout: mobile-first single column, max-w ~420px, centered. It doesn't use the full `AppShell` nav (the card is a standalone landing). A slim header shows the logo, linking to `/`.
  - Content, top to bottom: photo (`member.photo`, initials fallback), name, credentials, role, then action buttons:
    - **Call** `tel:` (only if `phone`)
    - **Email** `mailto:` (from the `links` entry with `type==='email'`)
    - **LinkedIn** (if present)
    - **Save contact**: builds a Blob with type `text/vcard;charset=utf-8`, sets `a.download = vcardFilename(name)` and clicks it.
  - Footer: "JCA 1221 Holdings · jca1221.com" link to `/`.
  - Reuse existing Tailwind tokens and button styles from `TeamMemberCard.tsx`, plus lucide icons `Phone`, `Mail`, `Linkedin`, `Download`.
  - `<PageSEO title={member.name} description={member.role} noIndex />`

- [ ] **Step 5: Wire the route and header**
  - `router.tsx`: `const CardPage = lazyRetry(() => import('@/pages/CardPage').then((m) => ({ default: m.CardPage })))` and `{ path: '/team/:slug', element: <CardPage /> }`.
  - `netlify.toml`:
    ```toml
    [[headers]]
      for = "/team/*"
      [headers.values]
        X-Robots-Tag = "noindex, nofollow"
    ```
  - Don't add a `robots.txt` Disallow. Blocking the crawl would stop Google from seeing the noindex.

- [ ] **Step 6: Run e2e + gate, expect PASS**

Run: `node tests/card-page.e2e.mjs && sh gates/run.sh`
Expected: all assertions pass; gate exit 0.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/use-content.ts src/pages/CardPage.tsx src/pages/index.ts src/lib/router.tsx netlify.toml tests/card-page.e2e.mjs
git commit -m "feat: /team/:slug NFC card page (noindex, unlinked)"
```

---

### Task 4: Hand-off (no code)

- [ ] Apply 00008 + 00009 to Supabase (`supabase db push` or SQL editor).
- [ ] Get the 5 mobile numbers from Zara and enter them in admin → Team.
- [ ] After deploy, check the header: `curl -sI https://jca1221.com/team/zarasee | grep -i x-robots-tag` → `noindex, nofollow`.
- [ ] Send Zara the 5 URLs to write onto the NFC tags. Use a phone app (e.g. NFC Tools), record type URL/URI, and lock the tag after testing.
