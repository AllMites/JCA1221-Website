# Content audit DB update — run report (task t_e3bbb5ac)

**Project:** JCA1221 Holdings — Supabase `urtdzvtdekyycdnszlyp`
**Date:** 2026-08-12
**Change source:** `docs/content-audit-change-list.json` (task t_4d32a77a), status=`apply` items only
**Access:** service-role key from repo `.env.local` (RLS bypass; the parent-card "secret" JWT is identical to the public anon key and cannot write — upstream finding t_e301d363)

## Applied changes (3/3 status=apply, each exactly once)

Executed via `scripts/apply_content_changes.py` — one atomic PostgREST PATCH per change,
keyed by primary key, with a natural-key guard asserted first and `Prefer: return=representation`
echoing the affected row.

| ID | Table | PK | Field | Before | After | Rows affected |
|----|-------|----|-------|--------|-------|---------------|
| CL-01 | team_members | 08dd2da4-cb21-4983-a8d4-772d0294606f | credentials | `*** UP Diliman (Magna Cum Laude)` | `UP Diliman (Magna Cum Laude)` | 1 |
| CL-06 | tech_widgets | e003ce08-d3d3-44b0-b2cc-b0259617df3f | published | `true` | `false` | 1 |
| CL-07 | tech_widgets | 54a56e94-df51-490e-aba7-f6fe1eb13fb0 | published | `true` | `false` | 1 |

Equivalent reproducible SQL (for a Postgres shell; REST PATCHes were used here):

```sql
-- CL-01: strip literal '***' redaction artifact from Jehremiah's credentials
UPDATE team_members SET credentials = 'UP Diliman (Magna Cum Laude)'
WHERE id = '08dd2da4-cb21-4983-a8d4-772d0294606f';

-- CL-06: unpublish VBRP (visitor_portfolio) widget for Puerto Princesa
UPDATE tech_widgets SET published = false
WHERE id = 'e003ce08-d3d3-44b0-b2cc-b0259617df3f';

-- CL-07: unpublish process_flow widget for Puerto Princesa
UPDATE tech_widgets SET published = false
WHERE id = '54a56e94-df51-490e-aba7-f6fe1eb13fb0';
```

## Post-apply verification (fresh read, 2026-08-12)

- `team_members` where name=`Jehremiah C. Asis`: credentials = `UP Diliman (Magna Cum Laude)` ✓
- `tech_widgets` id e003ce08… (visitor_portfolio): published = `false` ✓
- `tech_widgets` id 54a56e94… (process_flow): published = `false` ✓
- Unintended-change guard: `monitoring` widget (61b10fab…) still published=`true`;
  all 5 team_members rows otherwise unchanged (Constantine, Odysseus, Katherine, Zara untouched) ✓

## NOT applied — by design (status != apply)

The change list marks 7 CONFIRM + 6 NEEDS-INPUT items as gated on the requester
(dad/Daniel). These require a human decision, so they were intentionally NOT applied:

- **CL-02** Odysseus credentials — needs dad confirm (researched value available)
- **CL-04 / CL-05** founder title `Founder & Chairman/CEO` → `Founder & President` consistency
- **CL-08 / CL-09** CSR project description drafts — confirm wording
- **CL-10 / CL-11 / CL-12** value-pillar placement realignment — decide realign vs keep
- **NI-01…NI-06** — no concrete target value in the audit

## Failures

None. All three PATCHes returned HTTP 200 with exactly 1 affected row.
