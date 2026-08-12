# Content DB verification report — task t_2b9bd140

**Project:** JCA1221 Holdings — Supabase `urtdzvtdekyycdnszlyp`
**Date:** 2026-08-12 (run 3 — post green light)
**Scope:** Verify the database state matches the audit change list after BOTH update rounds
**Access:** service-role key from repo `.env.local` (reads all rows incl. unpublished)
**Method:** `scripts/verify_content_changes.py` — independent fresh reads, compared against the
pre-update baseline snapshot (attachment `targets.json`, task t_e301d363) and the change list
targets (`docs/content-audit-change-list.json` @ commit b9a02b1, task t_4d32a77a).

## Result: PASS — 36/36 checks

All 11 applied content items match their exact target values, and no unintended rows
were changed.

## 1. Target rows — expected vs actual (fresh service-role read)

Round 1 (task t_e3bbb5ac) + round 2 (this run, applied per dashboard green light
2026-08-12 via `scripts/apply_confirm_changes.py`):

| ID | Table | PK | Field | Expected (change list) | Actual (fresh read) | |
|----|-------|----|-------|------------------------|---------------------|---|
| CL-01 | team_members | `08dd2da4…` | credentials | `UP Diliman (Magna Cum Laude)` | `UP Diliman (Magna Cum Laude)` | ✅ |
| CL-02 | team_members | `cb5ae9a2…` | credentials | `Chem. Engr., BS Chemical Engineering, University of San Agustin` | same | ✅ |
| CL-04 | page_content | `ba5f631e…` | value (founder title) | `Founder & President` | same | ✅ |
| CL-05 | page_content | `5854d7a0…` | value.role (founder profile) | `Founder & President, JCA 1221 Holdings Inc.` | same | ✅ |
| CL-06 | tech_widgets | `e003ce08…` | published (visitor_portfolio) | `false` | `false` | ✅ |
| CL-07 | tech_widgets | `54a56e94…` | published (process_flow) | `false` | `false` | ✅ |
| CL-08 | csr_projects | `e2a23c2f…` | description (siargao-community-waste) | aquaculture + farms + research-education copy | same | ✅ |
| CL-09 | csr_projects | `828e8279…` | description (puerto-princesa-learning-center) | research education + aquaculture copy | same | ✅ |
| CL-10 | page_content | `446222d9…` | value[0].subPoints (integrity pillar) | card1 `Solutions First Mentality`, card3 `Long Term Stability` | same | ✅ |
| CL-11 | page_content | `446222d9…` | value[2].subPoints[2] (service-over-profit) | `Knowledge transfer, not dependency` restored | same | ✅ |
| CL-12 | page_content | `446222d9…` | value[1].description (circular-economy) | mimic-nature text; subPoints = 2 result cards | same | ✅ |

Each target check also asserted its natural-key guard (name / slug / key / widget_type),
proving the write landed on the intended row.

Notes on interpretation:
- CL-08/CL-09: the change list's `DRAFT:` prefix is an author annotation, not content —
  stripped before writing; final copy verified against the audit intent (Homepage #10).
- CL-12: mimic-nature text moved to the pillar's card description; the duplicate
  sub-point card ("Our systems mimic nature's cleaning processes") was removed so the
  results are the two remaining cards (recycled water, pyrolysis) — matching the audit's
  "the results are: cards 2 and 3".

## 2. No unintended rows changed

Diffed every row of the pre-update baseline (58 published rows across 8 content tables:
projects 3, project_awards 3, news_articles 12, team_members 5, csr_projects 2, partners 8,
tech_widgets 3, page_content 22) field-for-field against the fresh service-role read.

- **0 field mismatches** on non-target rows. Target rows differ only in their intended
  fields (CL-01/02 credentials, CL-04/05 founder titles, CL-06/07 published, CL-08/09
  descriptions, CL-10/11/12 pillars jsonb).
- Guard rows:
  - `monitoring` widget (`61b10fab…`) still `published = true` — explicitly NOT in the
    change list, untouched. ✓
  - Zara's credentials still empty — CL-03 (needs_input, education value unknown) NOT
    applied. ✓
  - Constantine's credentials `Atty., UP Diliman (cum laude)` untouched. ✓
- Rows visible only to the service key (unpublished, invisible to the anon baseline read):
  `page_content` `scheduling` + `capability_statement`, `projects` `Test Project`
  (updated_at 2026-06-17 — predates both apply windows) — all pre-existing. ✓
- Apply-window scan (tables that have `updated_at`): no row outside the 11 target PKs was
  written during either apply window. Best-effort only — most content tables have no
  `updated_at` column. ✓

## 3. Consistency notes

- NI-01…NI-06 (needs_input, no concrete target value) remain intentionally unapplied —
  gated on Dad/Zara/Ody supplying the actual values (project text, bios, widget data,
  SCADA metrics, cross-project monitoring feature).
- `audit_log` table is empty (0 rows even for the service role), so no DB-level write
  trail exists; the baseline diff + window scan above are the evidence.
- **Homepage #9 (Certifications & Compliance tag):** the change list marked it
  code-verified, but the tag still existed in `src/sections/home/components/TrustWall.tsx`
  (hardcoded `CERTIFICATIONS` array + "Certifications & Compliance" heading). Per the
  dashboard instruction (2026-08-12), the block was removed: the section now renders only
  the partner logo grid ("Serving") when logos exist and collapses otherwise. Build passes;
  TrustWall eslint clean.

## Reproduce

```bash
python scripts/apply_confirm_changes.py        # applies CL-02/04/05/08/09/10/11/12 (idempotent)
python scripts/verify_content_changes.py --baseline .verify-baseline.json
# expects SUPABASE_URL + SUPABASE_SERVICE_KEY in repo .env.local
# exit code 0 = all checks pass
```

## Artifacts

- `scripts/apply_confirm_changes.py` — round-2 apply script (8 CONFIRM items, this commit)
- `scripts/verify_content_changes.py` — reproducible verifier, extended to 11 targets
- Baseline: `targets.json` (attachment id 24, task t_e301d363) — committed as
  `.verify-baseline.json`
- Change list: `docs/content-audit-change-list.json` @ commit b9a02b1 (task t_4d32a77a)
- Apply report round 1: `docs/content-update-run-report.md` @ commit bca8ce4 (task t_e3bbb5ac)
