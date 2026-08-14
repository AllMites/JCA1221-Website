# Implementation brief — In-page interactive CMS

Sources (read in full before implementing, do not re-derive):
- Audit: `docs/cms-json-audit.md` (task t_9a760c54, written in `.worktrees/t_9a760c54`,
  not yet merged to this branch — copy it in or read it from that worktree path).
- Plan: `docs/cms-inline-editor-plan.md` (task t_be30e2b4, written in
  `.worktrees/t_be30e2b4`, not yet merged to this branch — same caveat).
- Visual baseline: `DESIGN.md` and `src/index.css` (this repo, current branch) —
  authoritative for every token cited below.

No production code was changed by this brief. Both source worktrees above
have uncommitted files (`git status --short` shows the two docs as `??`) —
whoever implements should bring those two files onto their branch (copy, not
regenerate) so the reasoning trail stays intact.

---

## 1. Ordered list of code changes

Follow the plan's phase order (§6 of the plan). Each phase is independently
mergeable and gates the next.

### Phase 0 — fix existing bugs in place (no new UI paradigm)
1. `src/components/admin/PageContentForm.tsx` — add the missing `section`
   field (currently only collects `page`+`key`; schema requires `page`,
   `section`, `key` — see audit §3.3, `content-types.ts:147-155`).
2. `src/components/admin/ProjectForm.tsx` (lines ~130-132), `CsrForm.tsx`
   (~107-108), `TeamForm.tsx` (~87) — replace the raw `JSON.parse` /
   `try{}catch{}` textareas with structured editors (built in Phase 1, see
   below — sequence Phase 1's components first if easier, then wire them
   into these three forms as part of Phase 0's acceptance).
3. Acceptance: no `JSON.parse`/`try{}catch{}` left in `src/components/admin/`;
   a `page_content` row created via the admin UI actually renders on its
   public page (manual or scripted regression: create row through the form,
   load the corresponding public page, assert the value appears).

### Phase 1 — extract structured field editors as a shared library
New directory `src/components/content-editors/`, built once and imported by
both the Phase-0 forms and the future in-page drawer (Phase 3). No behavior
change to existing forms beyond removing raw-JSON textareas.

| Component | Backs | Shape |
|---|---|---|
| `RepeatableRowEditor` | `projects.stats`, `impact_metrics`, `csr_projects.stats`, `timeline` | array of `{label,value}` / `{label,value,improvement}` / `{date,title,description,photo}` rows; add/remove/reorder |
| `TagPillInput` | `expertise`, `sdg_tags`, `tags` (news) | comma-string → chip input, replaces comma-separated text fields |
| `KeyValueEditor` | `projects.technology` (`{description, tags[]}`) | one text field + one `TagPillInput` |
| `LinksEditor` | `team_members.links` | repeatable `{type: email\|linkedin, label, url}` rows with type dropdown |
| `ImagePicker` | every `*_image`/`photo`/`logo` field, `gallery_images`, `gallery` | thumbnail preview + "choose from library" (opens `MediaLibrary` in picker mode) + upload; gallery arrays get add/remove/drag-reorder |
| `PageContentValueEditor` | `page_content.value` | shape switches on selected `page`+`section`+`key` (e.g. `home`/`hero`/`content` → known `HeroContent` fields); unrecognized keys fall back to a labeled plain-text field, never raw JSON |

Acceptance: `ProjectForm`/`CsrForm`/`TeamForm`/`PageContentForm` all import
from `content-editors/`; zero duplicated field-editor logic between them.

### Phase 2 — drafts table + publish RPC
4. New migration `supabase/migrations/000NN_content_drafts.sql`:
   ```sql
   create table content_drafts (
     id            uuid primary key default gen_random_uuid(),
     table_name    text not null,
     record_id     uuid,
     draft_data    jsonb not null,
     edited_by     uuid references profiles(id) not null,
     updated_at    timestamptz not null default now(),
     unique (table_name, record_id)
   );
   ```
5. RLS policy on `content_drafts`: readable/writable by
   `role in ('admin','editor')` only (same predicate pattern already used
   elsewhere in `00002_rls_policies.sql`).
6. Postgres RPC `publish_draft(draft_id uuid)` — applies `draft_data` onto
   the real row (update if `record_id` set, insert if null) and deletes the
   draft row, in one server-side transaction.
7. Acceptance: a draft can be created, published (row updated/inserted,
   draft row removed), and canceled (draft row removed, live row untouched)
   — verified against a scratch/local Supabase instance, not production data.

### Phase 3 — `EditModeProvider` + `EditableRegion` + drawer
Rolled out section by section, simplest data shape first:
8. `team_members` — flat fields + one `LinksEditor` (first target).
9. `partners` — flat + one image field, no jsonb.
10. `projects` / `csr_projects` — richer jsonb shapes.
11. `page_content` — page/section/key-aware value editor.
12. `project_awards`, `tech_widgets` — **net-new** CRUD surfaces (currently
    zero admin UI — SQL-only today, per audit §2).

Core UX pattern to implement (plan §1): an edit-mode toggle (visible only
when `isEditor`, from `src/hooks/use-auth.tsx`) switches the live page into
edit mode. While on: hover outline + floating control cluster (edit/pencil,
delete/trash, reorder/drag-handle, add/+) per editable region; **edit**
opens a right-side drawer (not a modal) scoped to one record, with
Save-draft / Publish / Cancel actions; **delete** shows an inline confirm
popover (matching `ContentTable`'s existing pattern, not `window.confirm`)
and defaults to unpublish rather than hard delete.

Acceptance per section: hover/click reveals controls; add, edit, delete,
reorder all work from the live page; publish reflects on reload with no
console errors; no entity from the audit's §2 schema table is left without
an editing surface once Phase 3 completes for that entity.

### Phase 4 — drag-and-drop reorder + inline image picker + preview
13. Wire `ImagePicker` to real `MediaLibrary` storage buckets.
14. Drag-and-drop reorder persisting `order` on drop for `projects`,
    `team_members`, `csr_projects`, `page_content`.
15. Drawer "Preview" tab — render the actual `*View.tsx` component for the
    section with the draft's in-progress data merged over live props (the
    render layer is already pure/props-only per audit §1, so this is a
    data-substitution problem, not a new renderer).

Acceptance: dragging a list item persists new `order` for the four tables
above; every image field shows a thumbnail and can be set without leaving
the drawer.

### Phase 5 — consolidate
16. Retire `EditorPage.tsx`, or repoint it at the same drafts/publish
    helpers used by the in-page drawer so it can't drift from `AdminPage`.
17. Keep `/admin` only for what has no natural on-page home:
    `UserManagement`, `AuditLog`, `MediaLibrary` (as a library browser, still
    used by `ImagePicker`), `submissions`.
18. Delete the "JSON Crash Course" section of `docs/content-editor-guide.md`
    (lines 34-70) — the failure mode it documents no longer exists once
    Phase 1 ships.

Acceptance: one save/delete/publish code path per table, shared by any
remaining `/admin` list views and the in-page drawer; `EditorPage` either
removed or reduced to a thin wrapper with no independent data logic.

---

## 2. Explicit acceptance criteria (roll-up)

- [ ] No `JSON.parse`/raw-JSON textarea remains in `src/components/admin/`.
- [ ] `PageContentForm.tsx` collects `section`; admin-created `page_content`
      rows render correctly on their public page.
- [ ] `content-editors/` library exists and is the single source for
      repeatable-row, tag-pill, key-value, links, image-picker, and
      page-content-value editing across both old forms and the new drawer.
- [ ] `content_drafts` table + RLS + `publish_draft` RPC exist; draft
      create/publish/cancel all verified against a non-production database.
- [ ] Every entity in the audit's §2 schema table (`projects`,
      `project_awards`, `news_articles`, `team_members`, `csr_projects`,
      `partners`, `tech_widgets`, `page_content`) has an in-page editing
      surface (hover reveal, edit/add/delete/reorder) by end of Phase 3.
      `project_awards` and `tech_widgets` specifically must gain CRUD where
      today there is none.
- [ ] Reorder is drag-and-drop (or equivalent), not a raw number input, for
      `projects`, `team_members`, `csr_projects`, `page_content`.
- [ ] Every image field has a thumbnail + picker into `MediaLibrary`
      storage; gallery arrays support add/remove/reorder, not a
      comma-separated string.
- [ ] A "Preview" affordance exists in the drawer before publish, reusing
      the real `*View.tsx` render components.
- [ ] Delete uses an inline confirm popover (not `window.confirm`) and
      defaults to unpublish; hard delete is a separate, `isAdmin`-only
      action.
- [ ] Auth: edit-mode UI gated on `isEditor`/`isAdmin` via the existing
      `useAuth()`/RLS — no new auth mechanism introduced.
- [ ] `EditorPage.tsx` either shares the same save/delete/publish path as
      the new drawer, or is removed.
- [ ] Repo's gate suite (`npm run gate`) passes after each phase's changes
      are staged — this repo's one quality command (tsc -b, ESLint scoped
      to diff, `*-check.js` scripts).
- [ ] No phase leaves an entity half-migrated in a way that regresses the
      currently-working admin/editor flows for that entity.

## 3. Visual style constraints — must stay unchanged

Everything below is quoted or paraphrased from `DESIGN.md` (this repo,
current branch) and `src/index.css` (`:root` / `@theme` blocks). The new
edit-mode UI (toggle, hover outlines, control clusters, drawer, confirm
popovers) is new chrome, not new brand — it must be built entirely from the
existing token set below. No new colors, fonts, radii, or shadow values.

### Color tokens (do not introduce new hex/oklch values — reuse these)
Source: `DESIGN.md` frontmatter + `src/index.css:80-120`.

| Token | Value | CSS var | Use |
|---|---|---|---|
| Pacific Blue | `oklch(0.546 0.245 262.881)` | `--primary` | Primary actions, active states, the edit-mode toggle's "on" state |
| Tidal Blue (dark-mode primary) | `oklch(0.707 0.165 254.624)` | dark `--primary` | Same role in dark mode |
| Coastal Blue Wash | `oklch(0.97 0.014 254.604)` | `--accent` | Hover/ghost states — e.g. hover outline fill on an editable region |
| Slate Ink | `oklch(0.216 0.006 56.043)` | `--foreground` | Primary text |
| Slate Muted | `oklch(0.444 0.011 73.639)` | `--muted-foreground` | Secondary text/captions in the drawer |
| Slate Mist | `oklch(0.985 0.001 106.424)` | `--sidebar` / page bg | Page background |
| Surface White | `oklch(1 0 0)` | `--card` | Drawer panel background, card background |
| Slate Line | `oklch(0.923 0.003 48.717)` | `--border` / `--input` | Borders, dividers, hover-outline stroke |
| Mangrove Green | `oklch(0.527 0.154 150.069)` | `--chart-2` | **Proof-only** — e.g. "published"/"draft saved" status, never decorative |
| Sediment Amber | `oklch(0.769 0.188 70.08)` | `--chart-3` | **Proof-only** — e.g. "unsaved changes"/in-progress status |
| Destructive/rose | `oklch(0.586 0.253 17.585)` | `--destructive` | Delete action, delete-confirm popover |

**Earned-Green Rule applies to the CMS UI too**: green/amber may only mark a
real status (published, draft, in-progress) — never used as a decorative
fill, button color, or section background for the editor chrome itself.

### Typography (do not introduce new font families/sizes)
Source: `DESIGN.md` §3, `src/index.css:12-35`.
- Headings/UI labels in the drawer: DM Sans, `--font-display`/`--font-heading`.
- Drawer form body copy/help text: Inter, `--font-body`.
- Any data figures or technical labels (e.g. `order` value, timestamps) in
  the editor: IBM Plex Mono, `--font-mono` / `text-card-label` token —
  **never** for the drawer's own body copy or headings (Mono-Is-Data Rule).
- One Display-scale headline per page still applies; the drawer/edit-mode
  UI must not introduce a second competing giant headline.

### Radius, spacing, shadows (reuse tokens, no new values)
Source: `src/index.css:20-35`, `DESIGN.md` §4/§5.
- Drawer panel corners: `--radius-card` (12px / `rounded-xl`), matching
  existing card treatment.
- Buttons/inputs inside the drawer: `--radius-field` (6px / `rounded-md`).
- Drawer internal padding: `--spacing-card` (24px), same as existing cards.
- Field height: `--spacing-field` (36px / `h-9`), matching existing inputs.
- Card/panel elevation: flat by default — `shadow-sm` (`0 1px 2px
  rgba(0,0,0,0.05)`) plus 1px `slate-line` border. **The drawer is a content
  surface, not navigation — it must NOT use the neumorphic or glass shadow
  vocabulary** (One-Tactile-Surface Rule, DESIGN.md §4). Those are reserved
  for nav pills and the mobile menu only.
- Delete-confirm popover: same flat card treatment (`shadow-sm` + border),
  not a modal overlay — matches existing `ContentTable` inline-confirm
  pattern per the audit.

### Component patterns to match (do not invent new patterns)
- Buttons: primary = `pacific-blue` fill/white text/36px/`8px 16px` padding;
  outline = white bg + 1px border + `shadow-xs`; ghost fills
  `coastal-blue-wash` on hover. Reuse existing button variants — do not
  create a new button style for edit-mode controls (pencil/trash/drag/add
  icons should sit on existing ghost/outline button primitives, sized down
  if needed, not a bespoke icon-button system).
- Badges/status pills: `rounded-full`, `2px 8px`, semibold text-xs —
  reuse for draft/published status indicators in the drawer.
- Inputs: 1px `slate-line` border, 6px radius, 36px tall, `4px 12px`
  padding, focus ring = 3px `ring-ring/50` — every new structured editor
  field (`RepeatableRowEditor` rows, `TagPillInput` chips, etc.) must use
  this exact input styling, not a custom look.
- **Do not** touch the navigation neumorphic pills or the mobile glass
  panel — those are out of scope for this work and are the one place
  tactile/glass treatments are sanctioned; the new CMS chrome must not
  imitate or extend that vocabulary elsewhere.
- **Never nest a card inside a card**, **never** add a colored left-border
  accent stripe — both explicitly forbidden in DESIGN.md §5/§6 and apply
  equally to the new editable-region/drawer components.

### Verification for the implementer
Before calling any phase done, diff new component styling against
`DESIGN.md` §5 (Components) and `src/index.css` `:root`/`@theme` blocks —
every color/radius/spacing/shadow value used must trace back to a token
listed above. A visual-parity reviewer (task t_5906d51c in this board) will
check this against the same baseline files cited here.
