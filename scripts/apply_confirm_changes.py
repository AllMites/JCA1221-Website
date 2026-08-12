#!/usr/bin/env python3
"""
JCA1221 content audit — APPLY round 2 (task t_2b9bd140, dashboard green light 2026-08-12)

Applies the 8 CONFIRM changes from docs/content-audit-change-list.json (b9a02b1)
to Supabase project urtdzvtdekyycdnszlyp using the service-role key, after the
dashboard gave "green light on all" (comment 2026-08-12 11:11).

Changes applied (each a single atomic PostgREST PATCH keyed by primary key):
  CL-02  team_members.id=cb5ae9a2-...  Odysseus credentials 'Chem. Engr.' -> 'Chem. Engr., BS Chemical Engineering, University of San Agustin'
  CL-04  page_content.id=ba5f631e-...  about/founder/title 'Founder & Chairman' -> 'Founder & President'
  CL-05  page_content.id=5854d7a0-...  about/founder/profile role 'Founder & CEO, ...' -> 'Founder & President, ...'
  CL-08  csr_projects.id=e2a23c2f-...  siargao-community-waste description -> aquaculture/farms/research-education copy
  CL-09  csr_projects.id=828e8279-...  puerto-princesa-learning-center description -> aquaculture/research-education copy
  CL-10  page_content.id=446222d9-...  pillars[0].subPoints integrity: card1 -> 'Solutions First Mentality', card3 -> 'Long Term Stability'
  CL-11  page_content.id=446222d9-...  pillars[2].subPoints[2] restore 'Knowledge transfer, not dependency'
  CL-12  page_content.id=446222d9-...  pillars[1].description -> mimic-nature text; subPoints trimmed to the two result cards

Design notes:
  - Keyed by PK, natural-key guard asserted first, Prefer: return=representation.
  - CL-10/11/12 all touch the same pillars row -> read-modify-write once, one atomic PATCH.
  - 'DRAFT:' prefixes in the change list are author annotations, not content; stripped.
  - Idempotent: re-running re-sets the same target values (no state change).

Usage: python3 apply_confirm_changes.py
Env required: SUPABASE_URL, SUPABASE_SERVICE_KEY (loaded from repo .env.local by default)
"""
import json
import os
import sys
import urllib.error
import urllib.request

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
    "Prefer": "return=representation",
}

def req(method, path, body=None):
    r = urllib.request.Request(BASE + path, method=method,
                               data=json.dumps(body).encode() if body is not None else None)
    for k, v in HEADERS.items():
        r.add_header(k, v)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")[:2000]

def get_rows(table, query):
    status, data = req("GET", f"/rest/v1/{table}?{query}")
    if status != 200:
        raise RuntimeError(f"GET {table} failed: {status} {data}")
    return data

def patch_row(table, pk_filter, payload, label, guard=None):
    rows = get_rows(table, f"{pk_filter}&select=*")
    if len(rows) == 0:
        print(f"[SKIP] {label}: no row matches {pk_filter}")
        return 0, None
    if len(rows) > 1:
        raise RuntimeError(f"[ABORT] {label}: {len(rows)} rows match {pk_filter}")
    if guard:
        for k, v in guard.items():
            assert rows[0].get(k) == v, f"[ABORT] {label} guard {k}={v!r} failed: {rows[0].get(k)!r}"
    status, patched = req("PATCH", f"/rest/v1/{table}?{pk_filter}", payload)
    if status != 200:
        raise RuntimeError(f"PATCH {table} failed: {status} {patched}")
    return len(patched), patched[0]

results = []

# ── CL-02: Odysseus credentials ──
row = get_rows("team_members", "id=eq.cb5ae9a2-0b66-42a3-9ecf-cb3f2af278e2&select=*")
assert len(row) == 1 and row[0]["name"] == "Odysseus C. Alfon", f"CL-02 guard failed: {row}"
cur = row[0]["credentials"]
n, after = patch_row(
    "team_members",
    "id=eq.cb5ae9a2-0b66-42a3-9ecf-cb3f2af278e2",
    {"credentials": "Chem. Engr., BS Chemical Engineering, University of San Agustin"},
    "CL-02 team_members.credentials",
)
results.append({"id": "CL-02", "table": "team_members", "pk": "cb5ae9a2-0b66-42a3-9ecf-cb3f2af278e2",
                "field": "credentials", "before": cur,
                "after": after["credentials"] if after else None, "affected_rows": n})

# ── CL-04: founder title ──
row = get_rows("page_content", "id=eq.ba5f631e-ef39-4b79-b6fb-802822cbb37e&select=*")
assert len(row) == 1 and row[0]["key"] == "title", f"CL-04 guard failed: {row}"
cur = row[0]["value"]
n, after = patch_row(
    "page_content",
    "id=eq.ba5f631e-ef39-4b79-b6fb-802822cbb37e",
    {"value": "Founder & President"},
    "CL-04 page_content founder title",
)
results.append({"id": "CL-04", "table": "page_content", "pk": "ba5f631e-ef39-4b79-b6fb-802822cbb37e",
                "field": "value", "before": cur,
                "after": after["value"] if after else None, "affected_rows": n})

# ── CL-05: founder profile role (jsonb) ──
row = get_rows("page_content", "id=eq.5854d7a0-ff7c-4ff0-b984-812f022f100c&select=*")
assert len(row) == 1 and row[0]["key"] == "profile", f"CL-05 guard failed: {row}"
cur_val = row[0]["value"]
cur_role = cur_val.get("role")
new_val = dict(cur_val)
new_val["role"] = "Founder & President, JCA 1221 Holdings Inc."
n, after = patch_row(
    "page_content",
    "id=eq.5854d7a0-ff7c-4ff0-b984-812f022f100c",
    {"value": new_val},
    "CL-05 page_content founder profile.role",
)
results.append({"id": "CL-05", "table": "page_content", "pk": "5854d7a0-ff7c-4ff0-b984-812f022f100c",
                "field": "value.role", "before": cur_role,
                "after": (after["value"].get("role") if after else None), "affected_rows": n})

# ── CL-08: siargao CSR description ──
row = get_rows("csr_projects", "id=eq.e2a23c2f-185a-4f0c-a837-368346162a92&select=*")
assert len(row) == 1 and row[0]["slug"] == "siargao-community-waste", f"CL-08 guard failed: {row}"
cur = row[0]["description"]
target08 = ("Community-led waste segregation and collection program in Del Carmen and surrounding "
            "barangays — turning diverted waste into soil enhancer for local farms and recycled "
            "water for aquaculture, while building research and education partnerships ahead of "
            "the pyrolysis facility launch.")
n, after = patch_row(
    "csr_projects",
    "id=eq.e2a23c2f-185a-4f0c-a837-368346162a92",
    {"description": target08},
    "CL-08 csr_projects siargao description",
)
results.append({"id": "CL-08", "table": "csr_projects", "pk": "e2a23c2f-185a-4f0c-a837-368346162a92",
                "field": "description", "before": cur,
                "after": after["description"] if after else None, "affected_rows": n})

# ── CL-09: puerto learning center CSR description ──
row = get_rows("csr_projects", "id=eq.828e8279-c090-4b4d-94f2-2f80366fb7ec&select=*")
assert len(row) == 1 and row[0]["slug"] == "puerto-princesa-learning-center", f"CL-09 guard failed: {row}"
cur = row[0]["description"]
target09 = ("On-site learning center at the Puerto Princesa facility, hosting students and community "
            "members for research education on water quality, wastewater treatment, aquaculture, and "
            "coastal ecosystem restoration.")
n, after = patch_row(
    "csr_projects",
    "id=eq.828e8279-c090-4b4d-94f2-2f80366fb7ec",
    {"description": target09},
    "CL-09 csr_projects puerto learning center description",
)
results.append({"id": "CL-09", "table": "csr_projects", "pk": "828e8279-c090-4b4d-94f2-2f80366fb7ec",
                "field": "description", "before": cur,
                "after": after["description"] if after else None, "affected_rows": n})

# ── CL-10 + CL-11 + CL-12: pillars row (one atomic read-modify-write) ──
row = get_rows("page_content", "id=eq.446222d9-1b1d-4e98-b119-9b51e2dbaacb&select=*")
assert len(row) == 1 and row[0]["key"] == "pillars", f"CL-10/11/12 guard failed: {row}"
pillars = row[0]["value"]
assert [p["id"] for p in pillars] == ["integrity", "circular-economy", "service-over-profit", "track-record"], \
    f"pillars structure guard failed: {[p.get('id') for p in pillars]}"

before10 = json.loads(json.dumps(pillars[0]["subPoints"]))
before11 = json.loads(json.dumps(pillars[2]["subPoints"]))
before12_desc = pillars[1]["description"]
before12_subs = json.loads(json.dumps(pillars[1]["subPoints"]))

# CL-10: integrity pillar subPoints -> [Solutions First Mentality, Community-first accountability, Long Term Stability]
SOLUTIONS_FIRST = {
    "title": "Solutions First Mentality",
    "description": ("We approach every project by pulling the understanding, required resources, and "
                    "context, tailor fitting every solution to ensure success."),
}
LONG_TERM_STABILITY = {
    "title": "Long Term Stability",
    "description": ("Our solutions match current needs with available resources that produce immediate "
                    "impact with long-term benefits. We build with flexibility that allows for expansion "
                    "to meet future needs and available resources. The result: high-impact sustainable solutions"),
}
integrity_subs = pillars[0]["subPoints"]
community_card = next(s for s in integrity_subs if s["title"] == "Community-first accountability")
pillars[0]["subPoints"] = [SOLUTIONS_FIRST, community_card, LONG_TERM_STABILITY]

# CL-11: service-over-profit pillar third subPoint -> Knowledge transfer, not dependency
pillars[2]["subPoints"][2] = {
    "title": "Knowledge transfer, not dependency",
    "description": ("Every facility includes a Learning Center component. We train local operators, share "
                    "technical knowledge, and build capacity so communities own their environmental future."),
}

# CL-12: circular-economy pillar description -> mimic-nature text; drop the duplicate mimic
# sub-point so the results are the two remaining cards (recycled water, pyrolysis).
pillars[1]["description"] = (
    "Our systems mimic nature's cleaning processes. Microorganisms do the heavy lifting — no harsh "
    "chemicals, no energy-intensive brute force. For solid waste, we design with the environment in "
    "mind by meeting and exceeding regulatory standards."
)
pillars[1]["subPoints"] = [s for s in pillars[1]["subPoints"] if s["title"] != "Our systems mimic nature’s cleaning processes"]

n, after = patch_row(
    "page_content",
    "id=eq.446222d9-1b1d-4e98-b119-9b51e2dbaacb",
    {"value": pillars},
    "CL-10/11/12 page_content pillars",
)
if after:
    aft = after["value"]
    results.append({"id": "CL-10", "table": "page_content", "pk": "446222d9-1b1d-4e98-b119-9b51e2dbaacb",
                    "field": "value[0].subPoints", "before": before10,
                    "after": aft[0]["subPoints"], "affected_rows": n})
    results.append({"id": "CL-11", "table": "page_content", "pk": "446222d9-1b1d-4e98-b119-9b51e2dbaacb",
                    "field": "value[2].subPoints[2]", "before": before11[2],
                    "after": aft[2]["subPoints"][2], "affected_rows": n})
    results.append({"id": "CL-12", "table": "page_content", "pk": "446222d9-1b1d-4e98-b119-9b51e2dbaacb",
                    "field": "value[1].description + subPoints", "before": {"description": before12_desc, "subPoints": before12_subs},
                    "after": {"description": aft[1]["description"], "subPoints": aft[1]["subPoints"]},
                    "affected_rows": n})
else:
    print("[ERROR] pillars PATCH returned no row")

print("\n=== RESULTS ===")
print(json.dumps(results, indent=2, ensure_ascii=False))
ok = all(r["affected_rows"] == 1 and r["after"] is not None for r in results)
sys.exit(0 if ok else 1)
