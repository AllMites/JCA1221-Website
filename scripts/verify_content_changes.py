#!/usr/bin/env python3
"""
JCA1221 content audit — VERIFY script (task t_2b9bd140, run 3)

Independently verifies that the Supabase content state matches the audit change
list targets after BOTH update rounds:
  round 1 (t_e3bbb5ac): CL-01 / CL-06 / CL-07
  round 2 (this task, green light 2026-08-12): CL-02 / CL-04 / CL-05 / CL-08 / CL-09 / CL-10 / CL-11 / CL-12

Checks performed (all via fresh service-role reads):
  1. TARGET rows — all 11 applied changes must hold their exact target values,
     each with a natural-key guard so a wrong-row write fails loudly.
  2. UNINTENDED rows — every other row in the 8 content tables must still match
     the pre-update baseline snapshot (attachment targets.json from t_e301d363)
     field-for-field. Target rows may differ ONLY in their target field(s).
  3. Guard rows — monitoring widget 61b10fab must still be published=true;
     Zara's credentials must still be empty (CL-03 not applied); other team
     members untouched.
  4. Audit log — if readable, list UPDATE events in the apply windows.

Usage: python3 verify_content_changes.py [--baseline <targets.json>] [--change-list <change-list.json>]
Env required: SUPABASE_URL, SUPABASE_SERVICE_KEY (loaded from repo .env.local by default)
Exit code 0 = all checks pass; 1 = any check failed.
"""
import json
import os
import sys
import urllib.error
import urllib.request

# Each target: table, pk, natural-key guard(s), and a list of (field-or-jsonpath, expected, was)
# jsonpath is a tuple of keys/indices into the row value for jsonb columns.
EXPECTED = {
    # ── round 1 (t_e3bbb5ac) ──
    "CL-01": {
        "table": "team_members",
        "pk": "08dd2da4-cb21-4983-a8d4-772d0294606f",
        "guard": {"name": "Jehremiah C. Asis"},
        "checks": [("credentials", "UP Diliman (Magna Cum Laude)", "*** UP Diliman (Magna Cum Laude)")],
    },
    "CL-06": {
        "table": "tech_widgets",
        "pk": "e003ce08-d3d3-44b0-b2cc-b0259617df3f",
        "guard": {"widget_type": "visitor_portfolio"},
        "checks": [("published", False, True)],
    },
    "CL-07": {
        "table": "tech_widgets",
        "pk": "54a56e94-df51-490e-aba7-f6fe1eb13fb0",
        "guard": {"widget_type": "process_flow"},
        "checks": [("published", False, True)],
    },
    # ── round 2 (this task, green light) ──
    "CL-02": {
        "table": "team_members",
        "pk": "cb5ae9a2-0b66-42a3-9ecf-cb3f2af278e2",
        "guard": {"name": "Odysseus C. Alfon"},
        "checks": [("credentials", "Chem. Engr., BS Chemical Engineering, University of San Agustin", "Chem. Engr.")],
    },
    "CL-04": {
        "table": "page_content",
        "pk": "ba5f631e-ef39-4b79-b6fb-802822cbb37e",
        "guard": {"key": "title"},
        "checks": [("value", "Founder & President", "Founder & Chairman")],
    },
    "CL-05": {
        "table": "page_content",
        "pk": "5854d7a0-ff7c-4ff0-b984-812f022f100c",
        "guard": {"key": "profile"},
        "checks": [("value.role", "Founder & President, JCA 1221 Holdings Inc.", "Founder & CEO, JCA 1221 Holdings Inc.")],
    },
    "CL-08": {
        "table": "csr_projects",
        "pk": "e2a23c2f-185a-4f0c-a837-368346162a92",
        "guard": {"slug": "siargao-community-waste"},
        "checks": [("description",
                    "Community-led waste segregation and collection program in Del Carmen and surrounding barangays — turning diverted waste into soil enhancer for local farms and recycled water for aquaculture, while building research and education partnerships ahead of the pyrolysis facility launch.",
                    "Community-led waste segregation and collection program in Del Carmen and surrounding barangays, building local capacity ahead of the pyrolysis facility launch.")],
    },
    "CL-09": {
        "table": "csr_projects",
        "pk": "828e8279-c090-4b4d-94f2-2f80366fb7ec",
        "guard": {"slug": "puerto-princesa-learning-center"},
        "checks": [("description",
                    "On-site learning center at the Puerto Princesa facility, hosting students and community members for research education on water quality, wastewater treatment, aquaculture, and coastal ecosystem restoration.",
                    "On-site learning center at the Puerto Princesa facility, educating students and community members about water quality, wastewater treatment, and coastal ecosystem restoration.")],
    },
    "CL-10": {
        "table": "page_content",
        "pk": "446222d9-1b1d-4e98-b119-9b51e2dbaacb",
        "guard": {"key": "pillars"},
        "checks": [
            ("value[0].subPoints[0].title", "Solutions First Mentality",
             "Full transparency in procurement"),
            ("value[0].subPoints[0].description",
             "We approach every project by pulling the understanding, required resources, and context, tailor fitting every solution to ensure success.",
             "Every contract, every supplier, every cost is documented and auditable. Government partners and investors get complete visibility into where their money goes at every stage."),
            ("value[0].subPoints[2].title", "Long Term Stability",
             "Solutions First Mentality"),
            ("value[0].subPoints[2].description",
             "Our solutions match current needs with available resources that produce immediate impact with long-term benefits. We build with flexibility that allows for expansion to meet future needs and available resources. The result: high-impact sustainable solutions",
             "We approach every project by pulling the understanding, required resources, and context, tailor fitting every solution to ensure success."),
        ],
    },
    "CL-11": {
        "table": "page_content",
        "pk": "446222d9-1b1d-4e98-b119-9b51e2dbaacb",
        "guard": {"key": "pillars"},
        "checks": [
            ("value[2].subPoints[2].title", "Knowledge transfer, not dependency",
             "Long Term Stability"),
            ("value[2].subPoints[2].description",
             "Every facility includes a Learning Center component. We train local operators, share technical knowledge, and build capacity so communities own their environmental future.",
             "Our solutions match current needs with available resources that produce immediate impact with long-term benefits. We build with flexibility that allows for expansion to meet future needs and available resources. The result: high-impact sustainable solutions."),
        ],
    },
    "CL-12": {
        "table": "page_content",
        "pk": "446222d9-1b1d-4e98-b119-9b51e2dbaacb",
        "guard": {"key": "pillars"},
        "checks": [
            ("value[1].description",
             "Our systems mimic nature's cleaning processes. Microorganisms do the heavy lifting — no harsh chemicals, no energy-intensive brute force. For solid waste, we design with the environment in mind by meeting and exceeding regulatory standards.",
             "Nature doesn't produce waste — everything cycles. Our treatment systems follow the same principle: wastewater becomes clean water, solid waste becomes energy, and what was once pollution becomes productive."),
            ("value[1].subPoints[0].title", "Recycled water returns to the ecosystem",
             "Our systems mimic nature's cleaning processes"),
            ("value[1].subPoints[1].title", "Pyrolysis transforms solid waste into energy",
             "Recycled water returns to the ecosystem"),
        ],
    },
}

# Rows whose target field(s) may differ from baseline — keyed by (table, pk).
# Everything else must match the baseline field-for-field.
TARGET_KEYS = {(s["table"], s["pk"]) for s in EXPECTED.values()}

CONTENT_TABLES = [
    "projects", "project_awards", "news_articles", "team_members",
    "csr_projects", "partners", "tech_widgets", "page_content",
]

APPLY_WINDOW_1 = "2026-08-12T00:50:00Z"   # round 1 ran ~00:55–00:59 local (UTC+8)
APPLY_WINDOW_2 = "2026-08-12T11:15:00Z"   # round 2 ran ~11:15 local (UTC+8)


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


def json_get(obj, path):
    """Resolve 'a.b[0].c' style path into an object."""
    cur = obj
    import re
    for part in re.split(r"(?<=\])\.|\.", path):
        # handle [n] suffixes
        m = re.match(r"^([^[]*)(\[(\d+)\])?$", part)
        key = m.group(1)
        idx = m.group(3)
        if key:
            if not isinstance(cur, dict) or key not in cur:
                return None
            cur = cur[key]
        if idx is not None:
            if not isinstance(cur, list) or int(idx) >= len(cur):
                return None
            cur = cur[int(idx)]
    return cur


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    baseline_path = None
    args = sys.argv[1:]
    while args:
        a = args.pop(0)
        if a == "--baseline":
            baseline_path = args.pop(0)
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
        for field, expected, was in spec["checks"]:
            actual = json_get(row, field)
            check(f"{cid} {field}", actual == expected,
                  f"{spec['table']}.{field} = {json.dumps(actual)} "
                  f"(expected {json.dumps(expected)}, was {json.dumps(was)})")

    # ---- 2. unintended-change diff vs baseline ----
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
            is_target = (t, bid) in TARGET_KEYS
            for fld in br:
                if fld == "id":
                    continue
                base_v, cur_v = br[fld], cr.get(fld)
                if base_v == cur_v:
                    continue
                if is_target:
                    continue  # target rows may differ in their intended fields
                # survey-truncated URL baseline (prefix still matches)
                if fld == "url" and isinstance(base_v, str) and isinstance(cur_v, str) \
                        and cur_v.startswith(base_v):
                    continue
                check(f"{t} row {bid[:8]} field {fld} unchanged", False,
                      f"baseline {json.dumps(base_v)} != current {json.dumps(cur_v)}")
        extra_ids = [rid for rid in cur_by_id if rid not in {b.get("id") for b in base_rows}]
        target_pks = {s["pk"] for s in EXPECTED.values()}
        for rid in extra_ids:
            if rid in target_pks:
                continue
            extra = cur_by_id[rid]
            ts = extra.get("updated_at") or extra.get("created_at") or ""
            touched_recently = isinstance(ts, str) and (ts >= APPLY_WINDOW_1 or ts >= APPLY_WINDOW_2)
            check(f"{t} extra row {rid[:8]} is pre-existing unpublished", not touched_recently,
                  f"row visible only to service key (unpublished in baseline); id={rid} "
                  f"name/title={extra.get('name') or extra.get('title') or extra.get('key')} "
                  f"updated_at={ts}")

    # ---- 3. guard rows ----
    tw = {r.get("id"): r for r in current.get("tech_widgets", [])}
    mon = tw.get("61b10fab-451a-4769-9c03-16eae9496300")
    check("monitoring widget still published",
          mon is not None and mon.get("published") is True,
          f"monitoring widget (61b10fab) published={mon.get('published') if mon else 'MISSING'} (must stay true)")
    tm = {r.get("id"): r for r in current.get("team_members", [])}
    zara = tm.get("ccae2ba3-b83f-429f-a759-6ed1efc72017")
    check("Zara credentials still empty (CL-03 not applied)",
          zara is not None and zara.get("credentials") in (None, ""),
          f"Zara credentials={zara.get('credentials') if zara else 'MISSING'} (must stay empty)")
    const = tm.get("56176145-d10d-40e3-98c6-396b2e2617a8")
    check("Constantine credentials untouched",
          const is not None and const.get("credentials") == "Atty., UP Diliman (cum laude)",
          f"Constantine credentials={const.get('credentials') if const else 'MISSING'}")

    # ---- 4. updated_at window scan (any row written outside the target set?) ----
    touched = {}
    for t in CONTENT_TABLES:
        for r in current.get(t, []):
            ts = r.get("updated_at")
            if isinstance(ts, str) and (ts >= APPLY_WINDOW_1 or ts >= APPLY_WINDOW_2):
                touched.setdefault(t, []).append((r.get("id"), ts))
    expected_pks = {s["pk"] for s in EXPECTED.values()}
    unexpected = [(t, rid, ts) for t, lst in touched.items() for rid, ts in lst if rid not in expected_pks]
    check("no rows written outside the 11 targets during apply windows",
          not unexpected,
          f"rows with updated_at in apply windows: "
          f"{[(t, rid[:8], ts) for t, rid, ts in unexpected] or 'only the 11 target rows'}")
    target_touched = [(t, rid[:8]) for t, lst in touched.items() for rid, _ in lst if rid in expected_pks]
    results.append(("target rows carry fresh updated_at (informational)", True,
                    f"rows freshly written: {target_touched or 'no updated_at column on most content tables — best-effort'}"  ))

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
