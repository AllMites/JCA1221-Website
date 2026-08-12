# Content DB verification report — task t_2b9bd140

**Project:** JCA1221 Holdings — Supabase `urtdzvtdekyycdnszlyp`
**Date:** 2026-08-12
**Scope:** Verify the database state matches the audit change list after update task t_e3bbb5ac
**Access:** service-role key from repo `.env.local` (reads all rows incl. unpublished)
**Method:** `scripts/verify_content_changes.py` — independent fresh reads, compared against the
pre-update baseline snapshot (attachment `targets.json`, task t_e301d363) and the change list
targets (`docs/content-audit-change-list.json` @ commit b9a02b1, task t_4d32a77a).

## Result: PASS — 12/12 checks

All audited content items match their expected target values, and no unintended rows
were changed.

## 1. Target rows (the 3 applied changes) — expected vs actual

| ID | Table | PK | Field | Expected (change list) | Actual (fresh read) | |
|----|-------|----|-------|------------------------|---------------------|---|
| CL-01 | team_members | `08dd2da4-cb21-4983-a8d4-772d0294606f` | credentials | `UP Diliman (Magna Cum Laude)` | `UP Diliman (Magna Cum Laude)` | ✅ |
| CL-06 | tech_widgets | `e003ce08-d3d3-44b0-b2cc-b0259617df3f` | published | `false` | `false` | ✅ |
| CL-07 | tech_widgets | `54a56e94-df51-490e-aba7-f6fe1eb13fb0` | published | `false` | `false` | ✅ |

Each target check also asserted its natural-key guard, proving the write landed on the
intended row (not a same-value collision elsewhere):

- CL-01 row `name = "Jehremiah C. Asis"` ✓
- CL-06 row `widget_type = "visitor_portfolio"` ✓
- CL-07 row `widget_type = "process_flow"` ✓

## 2. No unintended rows changed

Diffed every row of the pre-update baseline (58 published rows across 8 content tables:
projects 3, project_awards 3, news_articles 12, team_members 5, csr_projects 2, partners 8,
tech_widgets 3, page_content 22) field-for-field against the fresh service-role read.

- **0 field mismatches** on non-target rows. (Two `news_articles.url` baseline values were
  truncated by the survey's manifest generator — verified as prefix-only differences, not
  data drift.)
- Guard row: `monitoring` widget (`61b10fab-451a-4769-9c03-16eae9496300`) is still
  `published = true` — it was explicitly NOT in the change list and remains untouched. ✓
- Rows visible only to the service key (unpublished, invisible to the anon baseline read):
  `page_content` `scheduling` + `capability_statement`, `projects` `Test Project`
  (updated_at 2026-06-17 — predates this update) — all pre-existing, none are target PKs. ✓
- Apply-window scan (tables that have `updated_at`, e.g. `projects`): no row outside the
  3 target PKs was written during/after the apply window. Best-effort only — most content
  tables have no `updated_at` column. ✓

## 3. Consistency notes

- The 7 CONFIRM + 6 NEEDS-INPUT change-list items remain **intentionally unapplied**
  (gated on human decisions per the change list) — verified not written.
- `audit_log` table is empty (0 rows even for the service role), so no DB-level write
  trail exists; the baseline diff + window scan above are the evidence.

## Reproduce

```bash
python scripts/verify_content_changes.py \
  --baseline <targets.json from t_e301d363 attachment id 24>
# expects SUPABASE_URL + SUPABASE_SERVICE_KEY in repo .env.local
# exit code 0 = all checks pass
```

## Artifacts

- `scripts/verify_content_changes.py` — reproducible verifier (this commit)
- Baseline: `targets.json` (attachment id 24, task t_e301d363) — committed as-is upstream
- Change list: `docs/content-audit-change-list.json` @ commit b9a02b1 (task t_4d32a77a)
- Apply report: `docs/content-update-run-report.md` @ commit bca8ce4 (task t_e3bbb5ac)
