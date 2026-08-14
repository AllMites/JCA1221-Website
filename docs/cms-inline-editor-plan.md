# In-page interactive CMS — design & implementation plan

Input: `docs/cms-json-audit.md` (t_9a760c54, uncommitted in `.worktrees/t_9a760c54` at
time of writing — summary reproduced inline below since it hasn't landed on this
branch yet). No production code changed by this plan.

## 0. Starting facts (from the audit)

- Content already lives in Supabase Postgres, not flat JSON files. The "JSON"
  problem today is that 4 admin forms expose `jsonb` columns as raw hand-typed
  JSON textareas with **silent parse-failure on save** (`ProjectForm.tsx:130-132`,
  `CsrForm.tsx:107-108`, `TeamForm.tsx:87`), plus a real bug: `PageContentForm.tsx`
  never collects `section`, so admin-created `page_content` rows silently fail
  to render (`content-types.ts:147-155` vs `PageContentForm.tsx:14-16,80-93`).
- Two divergent admin UIs (`/admin`, `/editor`) independently implement
  fetch/save/delete against the same tables — behavior can drift.
- No reorder UI (raw `order` number input), no image picker, no live preview,
  no structural validation of jsonb shape, and `project_awards` / `tech_widgets`
  have **zero** admin UI — SQL-only today.
- Pages already separate data-fetching (`src/pages/*.tsx`, via
  `src/hooks/use-content.ts`) from pure, props-only rendering
  (`src/sections/*/components/*View.tsx`). This is the load-bearing fact for
  everything below: the render layer has no idea where its data came from, so
  it's a clean seam to attach editing to.
- Auth already exists and is role-gated: `src/hooks/use-auth.tsx` exposes
  `isAdmin` / `isEditor` off `profiles.role`, backed by Supabase RLS.
  Nothing new to build for authentication — only new RLS policies for new
  tables/columns.

## 1. UX pattern

**Edit-mode toggle**, not always-on inline editing. A small floating toggle
(visible only when `isEditor`) switches the live page into edit mode. This
avoids two known bad patterns: accidental edits from stray clicks, and
`contentEditable` fighting with structured data (a `stats` array isn't
sensibly edited as flowing text).

While edit mode is on:

- Every editable region (a project card, a team member, a CSR entry, a page
  text block, an award, a tech widget) gets a **hover outline** and a small
  floating control cluster anchored to it: **edit** (pencil), **delete**
  (trash), **reorder** (drag handle), and, between/after list items, an
  **add** (+) control.
- **Edit** opens a right-side **drawer** with a form scoped to that one
  record — not a modal blocking the whole page, so the admin can still see
  the live section they're editing next to the form.
- Drawer actions: **Save draft** (writes without publishing), **Publish**
  (writes and makes it live), **Cancel** (discards unsaved changes, no DB
  write). No raw JSON anywhere — every `jsonb`/array field gets a purpose
  -built structured editor (see §3).
- **Delete** shows an inline confirm popover (not `window.confirm`, matching
  `ContentTable`'s existing pattern) and defaults to unpublish
  (`published = false`) rather than a hard row delete; a second explicit
  action is required to hard-delete.
- **Reorder** is drag-and-drop within a list section, writing back `order` on
  drop (no more hand-edited order numbers).
- **Add** inserts a new record in create mode, same drawer, positioned where
  the `+` was clicked.

Non-technical-admin usability is enforced by construction here, not by
documentation: there is no path in this design where an admin sees a JSON
textarea or has to know a column name. (`docs/content-editor-guide.md`'s
"JSON Crash Course" section becomes obsolete and should be deleted once the
structured editors ship — the failure mode it was working around no longer
exists.)

## 2. Data model & storage: real drafts

Today "draft" == `published = false` on the live row itself. That's fine for
"item exists but isn't public yet," but it doesn't support "I'm mid-edit on a
row that's already live" without the live site flickering through
half-finished states, and there's nowhere to put an edit that shouldn't go
live yet.

Add one generic table instead of bolting draft columns onto eight tables:

```sql
create table content_drafts (
  id            uuid primary key default gen_random_uuid(),
  table_name    text not null,        -- 'projects' | 'team_members' | ... | 'page_content'
  record_id     uuid,                 -- null = new/unsaved record
  draft_data    jsonb not null,       -- full proposed row shape for table_name
  edited_by     uuid references profiles(id) not null,
  updated_at    timestamptz not null default now(),
  unique (table_name, record_id)
);
```

- **Save draft**: upsert into `content_drafts`. Live row untouched.
- **Publish**: apply `draft_data` onto the real row (update if `record_id` is
  set, insert if null), then delete the draft row. One client-side helper
  function per table (or a single Postgres RPC `publish_draft(draft_id)` that
  does it server-side in a transaction — preferred, since it removes the
  "two round trips, one fails" race from the client version).
- **Cancel**: delete the draft row (or just don't save it, if never
  persisted — see autosave note below).
- **Discard published edit / revert**: out of scope for v1; `audit_log`
  already records prior values (`AuditLog.tsx`), so a manual revert via
  audit history is a reasonable phase-2 add, not a blocker.

RLS on `content_drafts`: readable/writable by `role in ('admin','editor')`
only, same predicate already used elsewhere — no new auth concept.

Autosave: debounce-save the drawer form into `content_drafts` on blur/change
(a few seconds after the last keystroke), so "Cancel" is genuinely safe
(nothing was ever live) and a dropped connection doesn't lose an in-progress
edit. This is additive convenience, not required for v1 acceptance.

## 3. Structured field editors (kills the raw-JSON problem)

One small library of typed editors, built once, reused everywhere a `jsonb`
or array column shows up:

| Editor | Backs | Shape |
|---|---|---|
| `RepeatableRowEditor` | `projects.stats`, `impact_metrics`, `csr_projects.stats`, `timeline` | array of `{label,value}` / `{label,value,improvement}` / `{date,title,description,photo}` rows, add/remove/reorder |
| `TagPillInput` | `expertise`, `sdg_tags`, `tags` (news) | comma-string → chip input, replaces the current comma-separated text fields |
| `KeyValueEditor` | `projects.technology` (`{description, tags[]}`) | one text field + one `TagPillInput` |
| `LinksEditor` | `team_members.links` | repeatable `{type: email|linkedin, label, url}` rows with a type dropdown |
| `ImagePicker` | every `*_image` / `photo` / `logo` field, `gallery_images`, `gallery` | thumbnail preview + "choose from library" (opens `MediaLibrary` in a picker mode) + upload, replacing bare URL text inputs; gallery arrays get add/remove/drag-reorder |
| `PageContentValueEditor` | `page_content.value` | switches shape based on the selected `page`+`section`+`key` — e.g. `home`/`hero`/`content` renders the known `HeroContent` field set (`siteName`, `tagline`, `description`, `backgroundImage`, `ctaLabel`, `ctaHref`); unrecognized keys fall back to a labeled plain-text field (still not raw JSON) |

These are the same components used by (a) the new in-page drawer and (b) the
existing `AdminPage` forms — see migration phase 0 below. Building them once
and sharing them is what prevents a third divergent editing implementation
from appearing alongside `AdminPage`/`EditorPage`.

## 4. Auth / permissions

No new mechanism — reuse `useAuth()` / RLS:

- Edit-mode toggle renders only if `isEditor`.
- Publish action: confirm today's RLS actually lets `editor` (not just
  `admin`) write to `published`/live columns before assuming parity; if the
  current policy already treats editor==admin for writes (it appears to,
  per `use-auth.tsx:91` conflating editor into admin-equivalent write access),
  keep that. If a future requirement wants editor-drafts-require-admin-review,
  that's a `content_drafts.status` enum (`draft | pending_review | published`)
  added later — not needed for v1 acceptance criteria.
- Delete (hard) restricted to `isAdmin` only, matching the heavier
  confirmation UX in §1.

## 5. Propagation to the live page

Public read hooks (`use-content.ts`) already filter `published = true`, so a
successful **Publish** is enough — no new read path needed for the public
site. For the editor's own in-session feedback:

- After Save/Publish in the drawer, update the already-loaded in-memory list
  on the page directly (the page already holds `projects`/`members`/etc. in
  state) so the edit reflects instantly without a refetch.
- **Preview**: while a draft is open in the drawer, render the *actual*
  `*View.tsx` component for that section with the draft's in-progress data
  merged over the live props, in a collapsed panel or toggle inside the
  drawer ("Preview" tab next to "Edit" tab). Because `HomeView`/`AboutView`/etc.
  are already pure and props-only, this is a data-substitution problem, not a
  new rendering path — no second preview renderer to build or maintain.

## 6. Migration path (current admin forms → in-page CMS)

Sequenced so each phase ships independent value and de-risks the next one,
rather than one big-bang rewrite.

**Phase 0 — fix the bugs, in place, in the existing `AdminPage` forms.**
No new UI paradigm yet.
- Add the missing `section` field to `PageContentForm.tsx` (real bug, ships
  alone, today).
- Replace the 4 raw-JSON textareas with the §3 structured editors, inside
  the existing forms.
- Acceptance: no `JSON.parse`/`try{}catch{}` left in `src/components/admin/`;
  `page_content` rows created via the admin UI actually render on the public
  page (regression test: create a `page_content` row through the form, load
  the corresponding public page, assert the value shows up).

**Phase 1 — extract the §3 editors as standalone components** under
`src/components/content-editors/`, imported by the Phase-0 forms. Establishes
the shared library the in-page drawer will reuse in Phase 3, and is itself
a no-behavior-change refactor (safe to review/merge independently).
- Acceptance: `ProjectForm`/`CsrForm`/`TeamForm`/`PageContentForm` all import
  from `content-editors/`, zero duplicated field-editor logic between them.

**Phase 2 — `content_drafts` table + publish RPC.**
- Migration `000NN_content_drafts.sql` + RLS policy + `publish_draft(uuid)`
  Postgres function.
- Acceptance: a draft can be created, published (row updated/inserted,
  draft row removed), and canceled (draft row removed, live row untouched),
  verified via a script against a scratch Supabase project or local
  `supabase db` instance — not against production data.

**Phase 3 — `EditModeProvider` + `EditableRegion` + drawer**, rolled out
section by section, simplest data shape first:
1. `team_members` — flat fields + one `LinksEditor`, good first target.
2. `partners` — flat + one image field, no jsonb at all.
3. `projects` / `csr_projects` — the richer jsonb shapes.
4. `page_content` — needs the page/section/key-aware value editor.
5. `project_awards`, `tech_widgets` — **net-new** CRUD surfaces; these
   currently have no UI at all, so this is where the in-page pattern adds
   capability rather than just replacing an existing form.
- Acceptance per section: hover/click reveals controls; add, edit, delete,
  and reorder all work from the live page; publish reflects on reload with
  no dev-console errors; no entity from the audit's schema table is left
  without an editing surface once this phase completes for that entity.

**Phase 4 — drag-and-drop reorder + inline `ImagePicker`** wired to real
`MediaLibrary` storage buckets, and the drawer's "Preview" tab (§5).
- Acceptance: dragging a list item persists its new `order` on drop for
  `projects`, `team_members`, `csr_projects`, `page_content`; every image
  field shows a thumbnail and can be set without leaving the drawer.

**Phase 5 — consolidate.** Once Phase 3 covers every content-bearing table,
retire `EditorPage.tsx` (or repoint it at the same drafts/publish helpers so
it can't drift from `AdminPage` behavior — pick one based on whether `/editor`
is still needed as a distinct lighter-weight route). Keep `/admin` as the
back-office surface for things with no natural on-page home: `UserManagement`,
`AuditLog`, `MediaLibrary` (as a library browser, still used by `ImagePicker`
as a picker), and `submissions`. Delete the now-obsolete "JSON Crash Course"
section of `docs/content-editor-guide.md`.
- Acceptance: one save/delete/publish code path per table, used by both any
  remaining `/admin` list views and the in-page drawer; `EditorPage` either
  removed or reduced to a thin wrapper with no independent data logic.

## 7. Explicitly out of scope for v1

- Multi-user conflict resolution (two editors on the same draft
  simultaneously) — `content_drafts`' `unique(table_name, record_id)` means
  a second editor overwrites the first's draft; acceptable for this team's
  scale, revisit if it becomes a real collision.
- Versioned revert UI beyond what `audit_log` already captures.
- Editor-submits-for-admin-approval workflow (noted as a future
  `content_drafts.status` extension in §4, not built now).

## 8. Coverage check against the audit

Every row in the audit's §2 schema→entity table gets an editing surface by
end of Phase 3: `projects`, `project_awards` (new), `news_articles`,
`team_members`, `csr_projects`, `partners`, `tech_widgets` (new),
`page_content` (bug fixed). `profiles`/Storage/`submissions` intentionally
stay on `/admin` (§6 Phase 5) since they aren't page-rendered content.
