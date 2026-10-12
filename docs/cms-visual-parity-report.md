# Visual Parity Review — CMS content-editors & admin form changes

Task: t_5906d51c — verify visual style parity against parent baseline
Reviewed commit: `103acb3` (parent `06d0242`), branch wt/t_e831985c
Baseline files: `DESIGN.md`, `src/index.css` (`:root` / `@theme`) at `06d0242`
Date: 2026-08-14

## VERDICT: PASS (with 2 minor observations, no violations)

No design-token violations, no new colors/fonts/radii/shadows, no forbidden
patterns, no public-facing component touched. Two intentional deviations from
the parent baseline's pixels are documented below; both are moves toward
sibling-form parity, not regressions.

---

## Scope of diff (06d0242..103acb3)

- 4 admin forms: `src/components/admin/{CsrForm,PageContentForm,ProjectForm,TeamForm}.tsx`
- New library: `src/components/content-editors/` (7 files)
- SQL migration + 3 docs
- **Zero changes to `src/sections/`, `src/shell/`, or any public render component.**
  Public-facing layout is byte-identical to baseline. (`git diff --name-only` verified.)

---

## Constraint-by-constraint evidence

### 1. Color tokens — PASS
- **No new hex or oklch values anywhere in the diff.** Scanned all added lines:
  every color class traces to Tailwind palette classes already present in the
  baseline admin forms (`slate-*`, `red-*`, `blue-400/50` focus ring, `white`).
- Shared input styling (`content-editors/styles.ts:4-6`) is **byte-identical** to
  the baseline forms' `inputBase`/`inputNormal`/`inputError` strings
  (e.g. `ProjectForm.tsx:161-163` at 06d0242).
- Delete icon buttons use `text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10`
  (`RepeatableRowEditor.tsx:73`, `ImagePicker.tsx:142`) — the exact same red
  treatment as the baseline `ContentTable.tsx:109` Del button.
- Publish buttons: `bg-blue-500/80 … border-white/20` — identical to baseline
  `ContentTable.tsx:47`, `TeamForm.tsx:189`, `CsrForm.tsx:235`.
- **Earned-Green Rule: respected.** Zero occurrences of green/amber anywhere in
  the new chrome. No decorative status colors introduced.

### 2. Typography — PASS
- No new font families. No `font-mono` added to body/heading copy — new editor
  components contain **0** `font-mono` usages (Mono-Is-Data Rule respected; the
  removed JSON textareas were the only mono users).
- `text-[11px]` labels used in editors (`RepeatableRowEditor.tsx:45`, etc.) are a
  **pre-existing admin convention**, not a new size: baseline already uses
  `text-[11px]` in `AuditLog.tsx`, `UserManagement.tsx`, `TechWidgetsSection.tsx`
  (11+ baseline files).
- Labels/errors use the same `text-xs font-medium text-slate-500` /
  `text-xs text-red-500 dark:text-red-400` classes as baseline forms.

### 3. Radius, spacing, shadows — PASS
- Radii used: `rounded-field` (6px token), `rounded-full`, `rounded` (4px default
  — pre-existing, `ContentTable.tsx:96`). **No new radius values.**
- Sizing tokens reused verbatim via `styles.ts`: `h-field`, `px-field-x`,
  `py-field-y`, `text-sm`, `rounded-field`.
- **Zero `shadow-*` classes added in code.** The only `shadow-` lines in the diff
  are quoted constraint text inside `implementation-brief.md` (docs), not code.
  Flat treatment preserved; One-Tactile-Surface Rule intact — no neumorphic or
  glass vocabulary introduced (existing modal shadow at
  `PageContentForm.tsx:172` untouched).

### 4. Component structure / patterns — PASS
- Inputs: 1px slate-line border (`border-slate-200 dark:border-white/10`), 6px
  radius, 36px height, `4px 12px` padding, `focus:border-blue-400/50` — exact
  baseline input styling, shared through one `styles.ts` source.
- Badges: `TagPillInput` reuses the existing shadcn `Badge` component
  (`rounded-full px-2 py-0.5 text-xs`), matching the brief's badge spec —
  no bespoke badge created.
- Ghost icon buttons (`p-1 rounded text-slate-400 hover:bg-slate-100
  dark:hover:bg-white/5`) match the baseline Edit-button ghost pattern
  (`ContentTable.tsx:88`). No new button primitive.
- Grid layout preserved in forms: `grid grid-cols-2 gap-4` / `grid-cols-3 gap-4`
  and `max-w-2xl` form shells unchanged (`ProjectForm.tsx` diff).
- **Dark mode:** every new component carries `dark:` variants (inherited through
  `styles.ts` in the wrapper-only `KeyValueEditor`/`LinksEditor`).

### 5. Forbidden patterns — PASS
- **No card-in-card:** `RepeatableRowEditor` row boxes are `border … rounded-field`
  (6px field radius, no shadow) field-group containers, not `rounded-xl` cards,
  and they sit inside forms, not inside cards.
- **No colored left-stripe accent:** `PageContentValueEditor.tsx:146` uses a
  neutral `border-l border-slate-200` (the slate-line border token) purely as a
  nested-object indent guide — not a colored accent stripe.
- No neumorphic/glass, no new modal, no `window.confirm` introduced.

---

## Minor observations (documented deviations, non-blocking)

1. **ProjectForm Publish button color: `bg-lime-500/80` → `bg-blue-500/80`**
   (`ProjectForm.tsx` diff hunk ~line 213). This is a pixel change vs the parent
   baseline, but it is a *parity fix*, not a regression: lime is **not** in the
   JCA token set (DESIGN.md tokens are blue/slate/emerald/amber/rose), and
   `bg-blue-500/80` is what sibling forms already used at baseline
   (`TeamForm.tsx:189`, `CsrForm.tsx:235`, `ContentTable.tsx:47`). The diff
   removed the one off-token stray. Flagged for the record; recommend keeping.
2. **PageContentForm 5000-char counter removed** (the `text-[10px] font-mono`
   `{value.length}/5000` readout and `VALUE_MAX` slicing are gone, replaced by
   the structured `PageContentValueEditor`). No token/visual rule implicated, but
   the char limit is no longer enforced — behavior note for the implementer.

---

## Conclusion

PASS. The task-1 diff preserves design tokens, CSS variables, colors, spacing,
typography, layout, and component structure from the parent baseline. All new
chrome is built from the existing token set, matches established admin component
patterns, respects the Earned-Green / Mono-Is-Data / One-Tactile-Surface rules,
and touches no public-facing render code. The two observations above are
intentional and consistent with the design system.
