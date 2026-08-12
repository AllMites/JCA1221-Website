#!/usr/bin/env python3
"""Scan all JCA1221 content tables for any value containing 'certif' or 'complianc'
(case-insensitive) — the dashboard wants the 'certifications and compliance' tag removed."""
import json, os, sys, urllib.error, urllib.request

def _env_local_candidates():
    here = os.path.dirname(os.path.abspath(__file__))
    yield os.path.join(here, ".env.local")
    yield os.path.join(os.path.dirname(here), ".env.local")
    yield os.path.join(os.path.dirname(os.path.dirname(here)), ".env.local")
    yield os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(here))), ".env.local")
    yield os.path.join(os.path.expanduser("~"), "AppData", "Local", "hermes", ".env.local")

def load_env(path):
    env = {}
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

for p in _env_local_candidates():
    if os.path.exists(p):
        ENV_LOCAL = p
        break
env = load_env(ENV_LOCAL)
BASE = os.environ.get("SUPABASE_URL") or env.get("VITE_SUPABASE_URL") or env.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_SERVICE_KEY") or env.get("SUPABASE_SERVICE_KEY")
if not BASE or not KEY:
    sys.exit("no creds")

HEADERS = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}

def req(path):
    r = urllib.request.Request(BASE + path, method="GET")
    for k, v in HEADERS.items():
        r.add_header(k, v)
    try:
        with urllib.request.urlopen(r, timeout=60) as resp:
            return resp.status, json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(errors="replace")[:2000]

TABLES = ["projects", "project_awards", "news_articles", "team_members",
          "csr_projects", "partners", "tech_widgets", "page_content"]

def walk(o, path=""):
    hits = []
    if isinstance(o, dict):
        for k, v in o.items():
            hits += walk(v, f"{path}.{k}" if path else k)
    elif isinstance(o, list):
        for i, v in enumerate(o):
            hits += walk(v, f"{path}[{i}]")
    elif isinstance(o, str):
        low = o.lower()
        if "certif" in low or "complianc" in low or "iro 140001" in low or "dilg" in low or "ppp framework" in low:
            hits.append((path, o))
    return hits

for t in TABLES:
    status, data = req(f"/rest/v1/{t}?select=*")
    if status != 200:
        print(f"{t}: HTTP {status}")
        continue
    for row in data:
        hits = walk(row)
        if hits:
            rid = row.get("id", "?")
            ident = row.get("name") or row.get("title") or row.get("slug") or row.get("key") or row.get("widget_type") or ""
            print(f"\n=== {t} id={rid} ident={ident!r}")
            for path, val in hits:
                print(f"  {path}: {val!r}")
