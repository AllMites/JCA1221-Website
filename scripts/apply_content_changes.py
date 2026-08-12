#!/usr/bin/env python3
"""
JCA1221 content audit — APPLY script (task t_e3bbb5ac)

Applies exactly the 3 status='apply' changes from docs/content-audit-change-list.json
to Supabase project urtdzvtdekyycdnszlyp using the service-role key.

Changes applied (each a single atomic PostgREST PATCH keyed by primary key):
  CL-01  team_members.id=08dd2da4-...  credentials '*** UP Diliman (Magna Cum Laude)' -> 'UP Diliman (Magna Cum Laude)'
  CL-06  tech_widgets.id=e003ce08-...  visitor_portfolio published true -> false
  CL-07  tech_widgets.id=54a56e94-...  process_flow        published true -> false

Design notes:
  - Keyed by PK (deterministic UUIDs from the survey), NOT by natural key, so each
    statement touches exactly one row. A natural-key guard is still asserted first
    (row must match the expected widget_type/name) to fail loudly on drift.
  - Every PATCH runs with Prefer: return=representation so the affected row is
    echoed back; affected-row count is verified = 1 for each.
  - PostgREST has no multi-statement transaction support, so each PATCH is its own
    atomic transaction — the three are independent and order-insensitive.
  - Idempotent in effect: re-running when already applied re-sets the same target
    value (no state change); the guard + representation echo make drift visible.

Usage: python3 apply_content_changes.py
Env required: SUPABASE_URL, SUPABASE_SERVICE_KEY (loaded from repo .env.local by default)
"""
import json
import os
import sys
import urllib.error
import urllib.request

def _env_local_candidates():
    here = os.path.dirname(os.path.abspath(__file__))
    yield os.path.join(here, ".env.local")                      # scripts/.env.local
    yield os.path.join(os.path.dirname(here), ".env.local")     # worktree root/.env.local
    yield os.path.join(os.path.dirname(os.path.dirname(here)), ".env.local")  # .worktrees/.env.local
    yield os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(here))), ".env.local")  # parent repo/.env.local
    yield os.path.join(os.path.expanduser("~"), "AppData", "Local", "hermes", ".env.local")

def _find_env_local():
    for p in _env_local_candidates():
        if os.path.exists(p):
            return p
    return None

ENV_LOCAL = _find_env_local()

def load_env(path):
    env = {}
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

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

def req(method, path, body=None, extra_headers=None):
    r = urllib.request.Request(BASE + path, method=method, data=json.dumps(body).encode() if body is not None else None)
    h = dict(HEADERS)
    if extra_headers:
        h.update(extra_headers)
    for k, v in h.items():
        r.add_header(k, v)
    try:
        with urllib.request.urlopen(r) as resp:
            raw = resp.read().decode()
            return resp.status, json.loads(raw) if raw else None
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

def get_rows(table, query):
    status, data = req("GET", f"/rest/v1/{table}?{query}")
    if status != 200:
        raise RuntimeError(f"GET {table} failed: {status} {data}")
    return data

def patch_row(table, pk_filter, payload, label):
    """Assert exactly one matching row, then PATCH it. Returns (affected_count, row)."""
    rows = get_rows(table, f"{pk_filter}&select=*")
    if len(rows) == 0:
        print(f"[SKIP] {label}: no row matches {pk_filter} — already gone or drift; nothing to do")
        return 0, None
    if len(rows) > 1:
        raise RuntimeError(f"[ABORT] {label}: {len(rows)} rows match {pk_filter}, refusing ambiguous update")
    status, patched = req("PATCH", f"/rest/v1/{table}?{pk_filter}", payload)
    if status != 200:
        raise RuntimeError(f"PATCH {table} failed: {status} {patched}")
    return len(patched), patched[0]

results = []

# ── CL-01: strip literal '***' redaction artifact from Jehremiah's credentials ──
row = get_rows("team_members", "id=eq.08dd2da4-cb21-4983-a8d4-772d0294606f&select=*")
assert len(row) == 1 and row[0]["name"] == "Jehremiah C. Asis", f"CL-01 guard failed: {row}"
cur = row[0]["credentials"]
n, after = patch_row(
    "team_members",
    "id=eq.08dd2da4-cb21-4983-a8d4-772d0294606f",
    {"credentials": "UP Diliman (Magna Cum Laude)"},
    "CL-01 team_members.credentials",
)
results.append({"id": "CL-01", "table": "team_members", "pk": "08dd2da4-cb21-4983-a8d4-772d0294606f",
                "field": "credentials", "before": cur, "after": after["credentials"] if after else None,
                "affected_rows": n})

# ── CL-06: unpublish visitor_portfolio widget (Puerto Princesa / VBRP) ──
row = get_rows("tech_widgets", "id=eq.e003ce08-d3d3-44b0-b2cc-b0259617df3f&select=*")
assert len(row) == 1 and row[0]["widget_type"] == "visitor_portfolio", f"CL-06 guard failed: {row}"
n, after = patch_row(
    "tech_widgets",
    "id=eq.e003ce08-d3d3-44b0-b2cc-b0259617df3f",
    {"published": False},
    "CL-06 tech_widgets.visitor_portfolio.published",
)
results.append({"id": "CL-06", "table": "tech_widgets", "pk": "e003ce08-d3d3-44b0-b2cc-b0259617df3f",
                "field": "published", "before": True, "after": after["published"] if after else None,
                "affected_rows": n})

# ── CL-07: unpublish process_flow widget (Puerto Princesa) ──
row = get_rows("tech_widgets", "id=eq.54a56e94-df51-490e-aba7-f6fe1eb13fb0&select=*")
assert len(row) == 1 and row[0]["widget_type"] == "process_flow", f"CL-07 guard failed: {row}"
n, after = patch_row(
    "tech_widgets",
    "id=eq.54a56e94-df51-490e-aba7-f6fe1eb13fb0",
    {"published": False},
    "CL-07 tech_widgets.process_flow.published",
)
results.append({"id": "CL-07", "table": "tech_widgets", "pk": "54a56e94-df51-490e-aba7-f6fe1eb13fb0",
                "field": "published", "before": True, "after": after["published"] if after else None,
                "affected_rows": n})

print("\n=== RESULTS ===")
print(json.dumps(results, indent=2, ensure_ascii=False))
ok = all(r["affected_rows"] == 1 and r["after"] is not None for r in results)
sys.exit(0 if ok else 1)
