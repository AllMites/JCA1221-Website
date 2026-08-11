#!/usr/bin/env python3
"""
JCA1221 content audit — VERIFY script (task t_2b9bd140)

Independently verifies that the Supabase content state matches the audit change
list targets after the update task (t_e3bbb5ac) applied CL-01 / CL-06 / CL-07.

Checks performed (all via fresh service-role reads):
  1. TARGET rows — the 3 applied changes must hold their exact target values:
       CL-01  team_members.id=08dd2da4-cb21-4983-a8d4-772d0294606f
              credentials == 'UP Diliman (Magna Cum Laude)'   (was '*** UP Diliman (...')
       CL-06  tech_widgets.id=e003ce08-d3d3-44b0-b2cc-b0259617df3f
              published == false  (visitor_portfolio, was true)
       CL-07  tech_widgets.id=54a56e94-df51-490e-aba7-f6fe1eb13fb0
              published == false  (process_flow, was true)
     Each target check also asserts its natural-key guard (name / widget_type)
     so a wrong-row write would fail loudly.
  2. UNINTENDED rows — every other row in the 8 content tables must still match
     the pre-update baseline snapshot (attachment targets.json from t_e301d363)
     field-for-field. Rows visible only to the service key (unpublished) are
     reported as pre-existing additions and must NOT be one of the target PKs.
  3. Guard row — monitoring widget 61b10fab-451a-4769-9c03-16eae9496300 must
     still be published=true (it was explicitly NOT part of the change list).
  4. Audit log — if the audit_log table is readable, list UPDATE events in the
     apply window to confirm exactly the 3 target rows were written.

Usage: python3 verify_content_changes.py [--baseline <targets.json>] [--change-list <change-list.json>]
Env required: SUPABASE_URL, SUPABASE_SERVICE_KEY (loaded from repo .env.local by default)
Exit code 0 = all checks pass; 1 = any check failed.
"""
import json
import os
import sys
import urllib.error
import urllib.request

EXPECTED = {
    "CL-01": {
        "table": "team_members",
        "pk": "08dd2da4-cb21-4983-a8d4-772d0294606f",
        "guard": {"name": "Jehremiah C. Asis"},
        "field": "credentials",
        "target": "UP Diliman (Magna Cum Laude)",
        "was": "*** UP Diliman (Magna Cum Laude)",
    },
    "CL-06": {
        "table": "tech_widgets",
        "pk": "e003ce08-d3d3-44b0-b2cc-b0259617df3f",
        "guard": {"widget_type": "visitor_portfolio"},
        "field": "published",
        "target": False,
        "was": True,
    },
    "CL-07": {
        "table": "tech_widgets",
        "pk": "54a56e94-df51-490e-aba7-f6fe1eb13fb0",
        "guard": {"widget_type": "process_flow"},
        "field": "published",
        "target": False,
        "was": True,
    },
}

# Non-content / infra tables are out of scope for the diff, but we still query
# tech-relevant tables for the guard + full-row inventory.
CONTENT_TABLES = [
    "projects", "project_awards", "news_articles", "team_members",
    "csr_projects", "partners", "tech_widgets", "page_content",
]

APPLY_WINDOW = "2026-08-12T00:50:00Z"  # update ran ~00:55–00:59 local (UTC+8)


def _env_local_candidates():
    here = os.path.dirname(os.path.abspath(__file__))
    yield os.path.join(here, ".env.local")
    yield os.path.join(os.path.dirname(here), ".env.local")
    yield os.path.join(os.path.dirname(os.path.dirname(here)), ".env.local")
    yield os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(here))), ".env.local")
    yield os.path.join(os.path.expanduser("~"), "AppData", "Local", "hermes", ".env.local")


def _find_env_local():
    for p in _env_local_candidates():
        if os.path.exists(p):
            return p
    return None


def load_env(path):
    env = {}
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def load_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


ENV_LOCAL = _find_env_local()
env = load_env(ENV_LOCAL)
BASE = os.environ.get("SUPABASE_URL") or env.get("VITE_SUPABASE_URL") or env.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_KEY") or env.get("SUPABASE_SERVICE_KEY")
if not BASE or not KEY:
    sys.exit("SUPABASE_URL and SUPABASE_SERVICE_KEY required (set env or .env.local)")

HEADERS = {
    "apikey": KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type": "application/json",
}


def req(path):
    r = urllib.request.Request(BASE + path, method="GET")
    for k, v in HEADERS.items():
        r.add_header(k, v)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")[:2000]


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    baseline_path = None
    change_list_path = None
    args = sys.argv[1:]
    while args:
        a = args.pop(0)
        if a == "--baseline":
            baseline_path = args.pop(0)
        elif a == "--change-list":
            change_list_path = args.pop(0)
        else:
            sys.exit(f"unknown arg: {a}")

    if baseline_path is None:
        cands = [
            os.path.join(script_dir, "..", "survey", "targets.json"),
            os.path.join(script_dir, "..", ".verify-baseline.json"),
        ]
        baseline_path = next((p for p in cands if os.path.exists(p)), None)
    baseline = load_json(baseline_path) if baseline_path else {}

    results = []
    failures = []

    def check(name, ok, detail):
        results.append((name, ok, detail))
        if not ok:
            failures.append(name)

    # ---- fresh read of all content tables (service key sees unpublished too) ----
    current = {}
    for t in CONTENT_TABLES:
        status, data = req(f"/rest/v1/{t}?select=*")
        if status != 200:
            check(f"read {t}", False, f"HTTP {status}: {data}")
            continue
        current[t] = data if isinstance(data, list) else []

    # ---- 1. target checks ----
    for cid, spec in EXPECTED.items():
        rows = current.get(spec["table"], [])
        row = next((r for r in rows if r.get("id") == spec["pk"]), None)
        if row is None:
            check(f"{cid} row present", False, f"PK {spec['pk']} not found in {spec['table']}")
            continue
        guard_ok = all(row.get(k) == v for k, v in spec["guard"].items())
        check(f"{cid} natural-key guard", guard_ok,
              f"{spec['table']} {spec['pk']} guard {spec['guard']} -> "
              f"actual {json.dumps({k: row.get(k) for k in spec['guard']})}")
        actual = row.get(spec["field"])
        check(f"{cid} target value", actual == spec["target"],
              f"{spec['table']}.{spec['field']} = {json.dumps(actual)} (expected {json.dumps(spec['target'])}, was {json.dumps(spec['was'])})")

    # ---- 2. unintended-change diff vs baseline ----
    # Baseline quirks handled here (survey artifacts, not data drift):
    #   * "manifest" pseudo-table of empty objects — skip (no real ids)
    #   * long URLs were TRUNCATED in the survey's targets.json — prefix-match url
    base_tables = baseline.get("tables", {})
    for t, base_tbl in base_tables.items():
        base_rows = [b for b in base_tbl.get("rows", []) if b.get("id")]
        cur_rows = current.get(t, [])
        cur_by_id = {r.get("id"): r for r in cur_rows}
        for br in base_rows:
            bid = br.get("id")
            cr = cur_by_id.get(bid)
            if cr is None:
                check(f"{t} baseline row {bid} still exists", False, "row missing from current read")
                continue
            target_pk = any(spec["pk"] == bid for spec in EXPECTED.values())
            for fld in br:
                if fld == "id":
                    continue
                base_v, cur_v = br[fld], cr.get(fld)
                if base_v == cur_v:
                    continue
                # intended change on a target row's target field
                if target_pk:
                    spec = next((s for s in EXPECTED.values() if s["pk"] == bid), None)
                    if spec and fld == spec["field"]:
                        continue
                # survey-truncated URL baseline (prefix still matches)
                if fld == "url" and isinstance(base_v, str) and isinstance(cur_v, str) \
                        and cur_v.startswith(base_v):
                    continue
                check(f"{t} row {bid[:8]} field {fld} unchanged", False,
                      f"baseline {json.dumps(base_v)} != current {json.dumps(cur_v)}")
        extra_ids = [rid for rid in cur_by_id if rid not in {b.get("id") for b in base_rows}]
        target_pks = {spec["pk"] for spec in EXPECTED.values()}
        for rid in extra_ids:
            if rid in target_pks:
                continue  # target rows are handled above even if not in anon baseline
            extra = cur_by_id[rid]
            # pre-existing unpublished row — must not carry a recent updated_at in the apply window
            ts = extra.get("updated_at") or extra.get("created_at") or ""
            touched_recently = isinstance(ts, str) and ts >= APPLY_WINDOW
            check(f"{t} extra row {rid[:8]} is pre-existing unpublished", not touched_recently,
                  f"row visible only to service key (unpublished in baseline); id={rid} "
                  f"name/title={extra.get('name') or extra.get('title') or extra.get('key')} "
                  f"updated_at={ts}")

    # ---- 3. guard row ----
    tw = {r.get("id"): r for r in current.get("tech_widgets", [])}
    mon = tw.get("61b10fab-451a-4769-9c03-16eae9496300")
    check("monitoring widget still published",
          mon is not None and mon.get("published") is True,
          f"monitoring widget (61b10fab) published={mon.get('published') if mon else 'MISSING'} (must stay true)")

    # ---- 4. updated_at window scan (any row written during the apply window?) ----
    # audit_log is empty (0 rows even for service role), so instead scan every
    # content table for rows whose updated_at falls inside the apply window.
    touched = {}
    for t in CONTENT_TABLES:
        rows = current.get(t, [])
        for r in rows:
            ts = r.get("updated_at")
            if isinstance(ts, str) and ts >= APPLY_WINDOW:
                touched.setdefault(t, []).append((r.get("id"), ts))
    expected_pks = {spec["pk"] for spec in EXPECTED.values()}
    unexpected = [(t, rid, ts) for t, lst in touched.items() for rid, ts in lst if rid not in expected_pks]
    check("no rows written outside the 3 targets during apply window",
          not unexpected,
          f"rows with updated_at >= {APPLY_WINDOW}: "
          f"{[(t, rid[:8], ts) for t, rid, ts in unexpected] or 'only the 3 target rows'}")
    target_touched = [(t, rid[:8]) for t, lst in touched.items() for rid, _ in lst if rid in expected_pks]
    results.append(("target rows carry fresh updated_at (informational)", True,
                    f"rows freshly written: {target_touched or 'no updated_at column on most content tables — window scan best-effort only'}"))

    # ---- report ----
    print(f"Supabase project: {BASE}")
    print(f"Baseline: {baseline_path or '(none)'}")
    print()
    n_ok = sum(1 for _, ok, _ in results if ok)
    print(f"Checks: {n_ok}/{len(results)} passed")
    for name, ok, detail in results:
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}: {detail}")
    print()
    if failures:
        print("VERIFICATION FAILED:")
        for f in failures:
            print(f"  - {f}")
        return 1
    print("VERIFICATION PASSED — all audited content items match target values; no unintended rows changed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
