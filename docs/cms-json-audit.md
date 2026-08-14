# CMS / JSON-field audit — architecture and admin pain points

Scope: audit the current content-management system for the live JCA 1221 Holdings
site (`src/pages`, `src/components/admin`, `src/components/editor`, `supabase/`),
in preparation for designing a replacement/upgrade. No production code changed.

## 0. Correcting the premise

The task brief assumes a "JSON-based CMS" — i.e. content hand-edited in flat
JSON files. That was true early in this repo's history but is **no longer the
case**. Content moved to Supabase Postgres in commit `22cc4da` /
`656b38d` (2026-06-09), well before this audit. `product/sections/*/data.json`
and `product-plan/**/sample-data.json` are leftover **Design OS planning
artifacts** (see `agents.md`) — sample data for the design tool itself, never
read by the live site. `src/lib/section-loader.ts` only loads those for the
Design OS preview UI, not for `HomePage`/`AboutPage`/etc.

The real system is a Postgres-backed CMS with two custom React admin UIs.
The "JSON" pain point survives in a different form: **several DB columns are
`jsonb`, and the admin forms expose them as raw hand-typed JSON textareas**.
`docs/content-editor-guide.md` even ships a "JSON Crash Course" (lines 34–70)
telling non-technical admins to paste their JSON into jsonlint.com to check it
before saving — direct evidence this is the actual pain point to solve.

## 1. Architecture

```
Supabase Postgres (schema: supabase/migrations/00001_schema.sql)
  ├─ profiles, projects, project_awards, news_articles, team_members,
  │  csr_projects, partners, tech_widgets, page_content, audit_log
  ├─ RLS: supabase/migrations/00002_rls_policies.sql
  └─ Storage buckets: team / projects / partners / csr / general
        │
        ▼
src/lib/supabase.ts (client singleton)
        │
        ├─▶ src/hooks/use-content.ts        (PUBLIC read path — published-only)
        │     useNews / useProjects / useProject / useTeam / useCsrProjects /
        │     usePartners / usePageContent(page) + getPageValue(content, section, key)
        │         │
        │         ▼
        │     src/pages/HomePage.tsx, AboutPage.tsx, TeamPage.tsx,
        │     ProjectsPage.tsx, ProjectDetailPage.tsx, NewsPage.tsx,
        │     ContactPage.tsx → src/sections/*/components/*View.tsx
        │
        └─▶ direct `supabase.from(table)...` calls        (ADMIN write path)
              src/pages/AdminPage.tsx   — full CRUD + publish toggle, per entity
              src/pages/EditorPage.tsx  — lighter parallel CRUD UI, same tables
                    │
                    ▼
              src/components/admin/{News,Project,Team,Partner,Csr,PageContent}Form.tsx
              src/components/admin/ContentTable.tsx   (list/edit/delete/publish grid)
              src/components/admin/MediaLibrary.tsx   (Storage upload, copy-URL only)
              src/components/admin/{UserManagement,AuditLog,GuideView}.tsx
```

Two independent admin surfaces exist and both mutate the same tables directly
via the Supabase JS client (no server-side validation layer, no shared
save/delete logic):

- **`/admin`** (`AdminPage.tsx`) — full editor: `ContentTable` list view +
  publish toggle + delete-confirm, tabs for Submissions, News, Projects,
  Team, Partners, CSR, Page Text, Users, Media, Audit, Guide.
- **`/editor`** (`EditorPage.tsx`) — simpler sidebar-list + form editor for
  Projects/News/Team/Partners/CSR/Guide only. No publish toggle, `window.confirm`
  for delete instead of `ContentTable`'s inline confirm, its own separate
  fetch/save/delete implementation (duplicated, can drift from `AdminPage`'s).

Auth: `src/hooks/use-auth.ts`, gated by `profiles.role` (`admin` | `editor`).
Contact-form submissions go through Netlify functions (`src/lib/api.ts`),
everything else goes straight through the Supabase client from the browser.

## 2. Schema → editable entity map

| Table | Admin tab(s) | Form | jsonb / array fields edited as raw text | Reorder support |
|---|---|---|---|---|
| `projects` | Admin, Editor | `ProjectForm.tsx` | `stats`, `technology`, `impact_metrics` (raw JSON textareas); `gallery_images` (comma-separated URL string) | manual `order` number only |
| `project_awards` | **none** | **none** | — | — |
| `news_articles` | Admin, Editor | `NewsForm.tsx` | `tags` (comma string) | sorted by date, no manual order |
| `team_members` | Admin, Editor | `TeamForm.tsx` | `links` (raw JSON textarea), `expertise` (comma string) | manual `order` number only |
| `csr_projects` | Admin, Editor | `CsrForm.tsx` | `stats`, `timeline` (raw JSON textareas), `sdg_tags`/`gallery` (comma strings) | manual `order` number only |
| `partners` | Admin, Editor | `PartnerForm.tsx` | `project_ids` (uuid array) | none (alpha sort) |
| `tech_widgets` | **none** | **none** | `config` jsonb, `widget_type` enum | — |
| `page_content` | Admin only | `PageContentForm.tsx` | `value` (raw JSON *or* plain string in one textarea, untyped) | manual `order` number only |
| `profiles` (users) | Admin (`UserManagement.tsx`) | — | — | — |
| Storage (images) | Admin (`MediaLibrary.tsx`) | — | — | — |
| `submissions` (Netlify fn, not a CMS table) | Admin | inline | — | — |

`project_awards` and `tech_widgets` have **no admin UI at all** — an admin
must edit these directly in the Supabase dashboard/SQL. Every project's
"awards" list and every project's technology widgets (`process_flow`,
`comparison_table`, `video_carousel`, `monitoring` — the actual technical
detail sections on `ProjectDetailPage`) are currently unmanageable outside
raw SQL.

## 3. Concrete pain points (file:line evidence)

1. **Raw hand-typed JSON in 4 forms, with silent parse failure on save.**
   `ProjectForm.tsx:130-132`, `CsrForm.tsx:107-108`, `TeamForm.tsx:87` all do
   `try { x = JSON.parse(xJson) } catch { /* invalid JSON, keep default */ }`
   — if the admin's JSON is malformed, the field **silently reverts to an
   empty default and saves that**, with no visible error. The only guardrail
   is `docs/content-editor-guide.md`'s manual instruction to paste into
   jsonlint.com first.

2. **`page_content.value` is doubly untyped.** `PageContentForm.tsx:16` treats
   `value` as a single plain-text string for *everything* stored in that
   column — including structured objects like the home hero
   (`{siteName, tagline, description, backgroundImage, ctaLabel, ctaHref}`,
   consumed via `getPageValue()` in `HomePage.tsx:41-42`). There's no
   type-aware editor per key — admin must know whether a given `key` expects
   plain text or a JSON blob, with zero UI hinting.

3. **`page_content` form is missing the `section` field entirely.**
   `content-types.ts:147-155` defines `PageContent` as
   `{ id, page, section, key, value, order, published }`, and the read path
   `getPageValue(content, section, key)` (`use-content.ts:221-223`) filters
   on both `section` and `key`. But `PageContentForm.tsx` only collects
   `page` and `key` (lines 14-16, 80-93) — there is no input for `section` at
   all. Any row created through the admin UI has `section` unset/empty and
   will silently fail to match `getPageValue()` lookups on the live pages.
   This is a functional bug, not just a UX gap.

4. **No reorder UI anywhere.** Every orderable entity (`projects`,
   `team_members`, `csr_projects`, `page_content`) exposes only a raw number
   input for `order` (`ProjectForm.tsx:266`, similar in the others). To move
   one item, the admin must know and hand-edit the numeric order value of
   every affected sibling row — no drag-and-drop, no "move up/down".

5. **No image picker / preview integration.** `MediaLibrary.tsx` uploads to
   Supabase Storage and offers "copy URL" (`MediaLibrary.tsx:120-131`), but
   every image field elsewhere (`ProjectForm.tsx:217` hero image,
   `:272` gallery images as a comma-separated string, team photo, partner
   logo) is a bare text input — admin must tab to Media, upload, copy the
   URL, tab back, and paste. No thumbnail preview of the currently-set image,
   no inline picker, no drag-reorder for gallery arrays.

6. **No live/staged preview.** Forms are pure data-entry; there is no way to
   see how a change will render on the actual page before publishing. The
   only feedback loop is save → navigate to the live/public route → check.

7. **Two divergent admin UIs for the same tables.** `AdminPage.tsx` and
   `EditorPage.tsx` each independently implement fetch/save/delete for
   projects/news/team/partners/csr against the same tables
   (`AdminPage.tsx:174-284` vs `EditorPage.tsx:52-87`). `EditorPage` lacks the
   publish/unpublish toggle and audit-friendly delete-confirm that
   `AdminPage`'s shared `ContentTable` provides, and uses `window.confirm`
   (`EditorPage.tsx:83`) instead. Behavior can drift between the two paths.

8. **No client-side JSONB schema validation.** Beyond "is it valid JSON",
   nothing checks that e.g. a `stats` array item actually has the `label`/
   `value` shape the front-end components expect (`ProjectCard`,
   `HeroContent` etc. in `src/types` / `content-types.ts`) — a
   syntactically-valid but structurally-wrong JSON blob saves successfully
   and only breaks rendering on the live page.

9. **`tech_widgets` and `project_awards` are fully unmanaged** (see §2) —
   there is no CMS surface for them whatsoever; changes require direct SQL
   against Supabase.

## 4. Where an interactive CMS needs new controls

Concrete, per-entity punch list (edit/add/reorder/delete) for whatever
replaces/extends the current admin:

- **All `jsonb`/array fields** listed in §2's table — replace raw-JSON
  textareas with structured sub-forms (repeatable row editors for
  `stats`/`impact_metrics`/`timeline`/`links`, tag-pill inputs for
  `expertise`/`sdg_tags`/`tags`, a dedicated key/value editor for
  `technology`).
- **`page_content`** — add the missing `section` selector (§3.3), and make
  `value`'s editor shape itself to the selected `page`+`section`+`key`
  (known keys like `hero` on `home` should render the `HeroContent` fields,
  not a blob).
- **`project_awards`** — net-new CRUD surface, scoped per-project (add/edit/
  delete an award row: title, organization, year, description).
- **`tech_widgets`** — net-new CRUD surface, scoped per-project: pick
  `widget_type` (`process_flow` | `comparison_table` | `video_carousel` |
  `monitoring`), edit its `config` jsonb with a type-specific form, order,
  publish toggle.
- **Reordering** — drag-and-drop (or up/down buttons) writing back `order`,
  for `projects`, `team_members`, `csr_projects`, `page_content`, in both the
  list view (`ContentTable.tsx`) and wherever `EditorPage.tsx`'s list panel
  is kept.
- **Image fields** — every URL text input (hero images, gallery arrays, team
  photos, partner logos) needs an inline picker into `MediaLibrary`'s
  Storage buckets plus a thumbnail preview, and gallery arrays need
  add/remove/reorder controls instead of a comma-separated string.
- **Preview** — a "preview this change" affordance before publish, ideally
  reusing the actual `src/sections/*/components/*View.tsx` components with
  the in-progress form data.
- **Consolidate `AdminPage`/`EditorPage`** — either retire `EditorPage` or
  make both consume one shared data-layer/save-path so publish state and
  delete-confirm behavior can't diverge.

## 5. Reference: real data shapes in use today

From `docs/content-editor-guide.md` (already-documented for admins) and
`supabase/migrations/00001_schema.sql`:

```json
// projects.stats
[
  { "label": "Population Served", "value": "300,000+" },
  { "label": "Treatment Capacity", "value": "50 MLD" }
]

// projects.technology
{
  "description": "Sequencing Batch Reactor (SBR) technology for biological treatment",
  "tags": ["SBR", "Biological Treatment", "Phosphorus Removal"]
}

// page_content row (home hero, consumed via getPageValue(content, 'hero', 'content'))
{ "page": "home", "section": "hero", "key": "content", "value": { "siteName": "...", "tagline": "...", "description": "...", "backgroundImage": "...", "ctaLabel": "...", "ctaHref": "..." } }
```

## 6. Files most relevant to a redesign

- Schema: `supabase/migrations/00001_schema.sql`, `00002_rls_policies.sql`
- Types: `src/lib/content-types.ts`
- Public read hooks: `src/hooks/use-content.ts`
- Admin surfaces: `src/pages/AdminPage.tsx`, `src/pages/EditorPage.tsx`
- Forms: `src/components/admin/{Project,News,Team,Partner,Csr,PageContent}Form.tsx`
- Shared admin widgets: `src/components/admin/ContentTable.tsx`,
  `MediaLibrary.tsx`, `UserManagement.tsx`, `AuditLog.tsx`
- Existing admin-facing doc (to update or retire once forms improve):
  `docs/content-editor-guide.md`
