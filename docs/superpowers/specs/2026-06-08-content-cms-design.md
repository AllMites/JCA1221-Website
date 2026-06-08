# JCA 1221 Website — Content Features & CMS Design Spec

**Date:** 2026-06-08
**Status:** Approved — pending implementation plan
**Context:** Post-board-meeting content strategy. Board green-lit website, requested CMS for admin/editor content management, CSR section, partner logos, and technology page dissolution into project detail pages.

---

## Overview

Four major workstreams:

1. **CMS Foundation** — Supabase backend + auth + admin dashboard + editor panel. Every text field (not metadata/variables) editable via `/admin` and `/edit` routes.
2. **Technology Page Dissolution** — Remove standalone Technology page. Distribute widgets (video carousel, process flow, comparison table, monitoring) to project detail pages. Aggregate into live impact dashboard on Home.
3. **Partner Logos** — Horizontal auto-scroll carousel on Home (all partners). Per-project badge rows on project detail pages (filtered by project).
4. **CSR Section** — New content type. Carousel cards on Home. Full section (card grid + timeline toggle) on Projects page. Individual CSR detail pages.

---

## Architecture

### Access Points

Three separate routes, one Supabase backend:

| Route | Auth | Purpose |
|-------|------|---------|
| `/`, `/about`, `/projects`, etc. | None | Public read-only website. SELECT published=true rows from Supabase. |
| `/edit` | Editor+ | Form-based content editing. Sidebar nav: Projects · News · CSR · Team · Partners · Page Text. Non-technical friendly. |
| `/admin` | Admin only | Full dashboard: all content tables, user management, publish states, audit log, media library. Superset of `/edit` capabilities. |

### Data Flow

```
User Browser
  ├── Public (no auth) → Supabase SELECT (RLS: published=true)
  ├── Editor (auth)    → /edit → Supabase CRUD (RLS: content tables)
  └── Admin (auth)     → /admin → Supabase FULL (RLS: all tables + users)
```

### Technology Stack

- **Frontend:** React (existing), Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Storage + RLS)
- **Hosting:** Netlify (existing)
- **Auth:** Supabase Auth (email/password, no social login needed)

### RLS Tiers

| Role | Permissions |
|------|------------|
| `public` | SELECT only, WHERE published = true. No auth. |
| `editor` | SELECT + INSERT + UPDATE on content tables. Can toggle draft/published. Cannot manage users or view audit log. |
| `admin` | Full CRUD on all tables. User management. Audit log access. Delete capability. |

---

## Database Schema

### Core Content Tables

#### `projects`
Infrastructure projects (water/waste).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | text | |
| slug | text UNIQUE | URL-safe identifier |
| location | text | |
| status | enum | operational, development, planning |
| hero_image | text | URL to Supabase Storage |
| hero_description | text | |
| short_description | text | For cards |
| description | text | Rich text |
| stats | jsonb | Array of {label, value} |
| technology | jsonb | {description, tags[]} |
| impact_metrics | jsonb | Array of {label, value, improvement} |
| year_started | int | |
| year_completed | int | nullable |
| gallery_images | text[] | Array of storage URLs |
| order | int | Display order |
| published | boolean | Default false |

#### `project_awards`
Awards embedded in project detail.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| project_id | UUID FK | References projects.id |
| title | text | |
| organization | text | |
| year | int | |
| description | text | |

#### `tech_widgets`
Per-project technology widgets (replaces standalone Technology page).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| project_id | UUID FK | References projects.id |
| widget_type | enum | process_flow, comparison_table, video_carousel, monitoring |
| config | jsonb | Widget-specific configuration |
| order | int | Display order within project detail |
| published | boolean | |

**`tech_widgets.config` shapes by widget_type:**

| widget_type | config shape |
|-------------|-------------|
| `video_carousel` | `{ videos: [{ icon, title, description, videoSrc }] }` |
| `process_flow` | `{ steps: [{ label, description, icon }], layout: "horizontal" \| "vertical" }` |
| `comparison_table` | `{ title, columns: [string], rows: [{ label, values: [string] }] }` |
| `monitoring` | `{ metrics: [{ key, label, unit, value, source_table, source_column }] }` |

**Note on `project_awards`:** Awards are modeled as a separate table (FK to projects) rather than embedded JSONB to enable querying (e.g., "all awards across all projects") and to support the admin dashboard table view. Migration from existing `data.json` embedded `awards` arrays handles this split.

#### `news_articles`
Press coverage, awards, media mentions.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| title | text | |
| source | text | Publication name |
| date | date | |
| excerpt | text | |
| url | text | External link |
| category | enum | awards, projects, policy, expansion, media |
| tags | text[] | |
| type | enum | media-coverage, award, feature |
| published | boolean | |

#### `team_members`
Leadership and technical team.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | text | |
| role | text | |
| credentials | text | nullable |
| photo | text | Storage URL |
| bio | text | Rich text |
| quote | text | nullable |
| expertise | text[] | |
| links | jsonb | Array of {type, label, url} |
| order | int | Drag-reorder |
| published | boolean | |

#### `csr_projects`
CSR initiatives with structured data and narrative timeline.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | text | |
| slug | text UNIQUE | |
| category | text | e.g., coastal-restoration, education, community |
| description | text | Short summary for cards |
| story | text | Rich text — full narrative |
| location | text | |
| hero_image | text | Storage URL |
| stats | jsonb | Array of {label, value} |
| timeline | jsonb | Array of {date, title, description, photo} |
| sdg_tags | text[] | SDG numbers: ["14", "13"] |
| gallery | text[] | Storage URLs |
| linked_project_id | UUID FK | nullable, references projects.id |
| order | int | |
| published | boolean | |

#### `partners`
Government, private sector, community partners.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | text | |
| type | enum | LGU, national_agency, private_sector, community, regulatory |
| logo | text | Storage URL |
| website_url | text | nullable |
| project_ids | UUID[] | Which projects this partner is associated with |
| published | boolean | |

#### `page_content`
Flexible key-value for page-level text (hero, taglines, impact stats, mission values).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| page | text | e.g., home, about, contact |
| section | text | e.g., hero, mission, impact |
| key | text | e.g., tagline, heading, cta_label |
| value | jsonb | Arbitrary content value |
| published | boolean | |

### System Tables

#### `profiles` (extends Supabase auth.users)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | FK to auth.users |
| email | text | |
| display_name | text | |
| role | enum | admin, editor |
| created_at | timestamptz | |

#### `audit_log` (immutable, append-only)

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID | FK to profiles.id |
| table_name | text | Which table changed |
| record_id | UUID | Which row changed |
| action | enum | create, update, delete |
| changes | jsonb | {old: {...}, new: {...}} |
| timestamp | timestamptz | |

---

## Partner Mapping (Research-Backed)

### Puerto Princesa Water Reclamation & Learning Center
- Puerto Princesa City Government (LGU)
- Vivant Hydro Holdings (Private Sector — PPP partner)
- Department of Environment and Natural Resources (National Agency)
- Palawan Council for Sustainable Development (Regulatory)
- PPP Center (National Agency)

### Gingoog City Septage Treatment Facility
- Gingoog City Government (LGU)
- Department of Public Works and Highways (National Agency)
- Gingoog City Water District (Local Utility)
- Department of the Interior and Local Government (National Agency — Seal of Good Local Governance)

### Del Carmen / Siargao Pyrolysis Facility
- Municipality of Del Carmen (LGU)
- Department of Environment and Natural Resources (National Agency)
- Siargao Environmental Council (Community Organization)

### Expansion / Cross-Cutting
- Cebu Provincial Government
- Surigao del Norte Provincial Government
- National Water Resources Board

### National Agencies (All Projects)
DENR · DPWH · DILG · PPP Center · NWRB

### Sources
Manila Bulletin, PhilStar Tech, BusinessMirror, Palawan News, Mindanao Gold Star Daily, Cebu Province, SunStar Cebu, LinkedIn/Cathy Yap-Yang

---

## Feature Specifications

### 1. Partner Logo Carousel (Home Page)

**Position:** Below project carousel and impact dashboard, or above footer. TBD during implementation.

**Behavior:**
- Smooth auto-scroll infinite loop, ~3 seconds per logo
- All logos grayscale by default (CSS `filter: grayscale(1)`)
- On hover: transition to full color (300ms CSS transition)
- Pause scroll on hover
- Clickable: each logo links to partner website or relevant project page
- Data sourced from `partners` table (all published partners)

### 2. Per-Project Partner Badges (Project Detail Pages)

**Position:** Within project detail page, in a "Project Partners" section (near bottom, above awards or footer).

**Behavior:**
- Filtered by project: only partners where `project_ids` contains the current project UUID
- Badge format: logo thumbnail + partner name + type label (LGU / National Agency / Private Sector / Community / Regulatory)
- Horizontal wrapping row, responsive
- Clicking badge navigates to partner website (if available)

### 3. Technology Dissolution

**Remove:** Standalone `/technology` route + nav link.

**Redistribute:**

| Widget | Destination |
|--------|------------|
| Interactive video carousel | Puerto Princesa project detail |
| Process flow diagram | Each project detail (SBR for PP, Reed Bed for Gingoog, Pyrolysis for Del Carmen) |
| Technology comparison table | Each project detail (specs relevant to that project's tech) |
| IoT monitoring / live data | Each project detail (where available), else static metric cards |
| Aggregate live dashboard | **New:** Home page — replaces static impact stats section |

**Tech widgets table** (`tech_widgets`):
- `widget_type`: process_flow | comparison_table | video_carousel | monitoring
- `config` JSONB: widget-specific configuration (steps for process flow, video sources for carousel, metric keys for monitoring)
- Each widget linked to a `project_id`
- Editors can add/remove/reorder widgets per project via `/edit`

**Home Live Impact Dashboard:**
- Aggregated SUM queries across all projects: total water treated, total waste diverted, communities served, CO₂ sequestered
- Animated counter on load
- Replaces current static `impactStats` array in home data.json
- Falls back to static values if no live data available

### 4. CSR Section

**Content Type (`csr_projects`):**
- Structured stats (beneficiaries, volunteers, area, year active)
- Narrative story (rich text)
- Timeline entries (date + title + description + photo)
- SDG badge tags
- Photo gallery
- Linked parent project (nullable — some CSR may be standalone)

**Home Carousel:**
- Horizontal scroll cards (3-4 featured)
- Compact card: photo, category label, title, short description, SDG badges
- Positioned near project carousel

**Projects Page Section:**
- Below main projects grid
- Toggle: Card Grid (default) / Timeline View
- Filter by SDG badge
- "View All CSR" link → CSR listing page (or scrolls to full section)

**CSR Detail Page:**
- Route: `/csr/[slug]`
- Layout: Hero → Stats bar → Story (rich text with expandable sections) → Timeline widget → Gallery lightbox → Linked project backlink

---

## Editor Panel (`/edit`)

**Audience:** Non-technical content editors.

### UI Layout
- **Sidebar:** Content type tabs — Projects, News, CSR, Team, Partners, Page Text
- **Main area:** Context-dependent

### Content Type Views

| Tab | Default View | Edit Mode |
|-----|-------------|-----------|
| Projects | Table with name, location, status columns. + button. Drag reorder. | Form: text fields, rich text for description, image upload for hero, stats editor (add/remove rows), tech widgets sub-table |
| News | Table with title, source, date, category. + button. | Form: title, source, date picker, category dropdown, tags multi-select, excerpt textarea, URL |
| CSR | Table with name, category, location. + button. | Form: name, category, description, story (rich text), stats rows, timeline sub-form (add/remove entries with date + photo + description), SDG tag selector, gallery upload |
| Team | Table with name, role. + button. Drag reorder. | Form: name, role, credentials, photo upload, bio (rich text), quote, expertise tags, links sub-form |
| Partners | Grid of logo cards. + button. | Form: name, type dropdown, logo upload, website URL, project assignment (checkboxes) |
| Page Text | Grouped by page → section. Click to edit. | Inline or form depending on value type. Hero text = text inputs. Impact stats = number + label rows. |

### Common Features
- "Save as Draft" / "Publish" buttons
- Preview button — opens entry as it appears on public site
- Image upload → Supabase Storage, auto-generates URL
- Confirmation dialog on delete
- Success/error toast notifications

## Admin Dashboard (`/admin`)

**Audience:** Technical administrators.

### All `/edit` features plus:

| Feature | Details |
|---------|---------|
| User Management | Table of all users. Invite new (enter email → Supabase invite flow). Role toggle (admin ↔ editor). Remove user. Password reset trigger. |
| Audit Log | Filterable table: user, table, action, timestamp. Expand row to see old/new diff. Read-only. |
| Media Library | Grid of all uploaded images across buckets. Upload new. Delete. Copy URL. Filter by bucket (team, projects, partners, csr, general). |
| Bulk Operations | Multi-select rows → publish/hide/delete batch. Export table as CSV. |

### Navigation
- Sidebar: Dashboard (overview stats) · Content (same as `/edit` tabs) · Users · Media · Audit Log · Settings

---

## Implementation Phases

### Phase A — CMS Foundation (Week 1-2)
**Ship gate:** News articles editable in `/admin`, served live to `/news` from Supabase.

| # | Deliverable |
|---|------------|
| A.1 | Supabase project + schema (all tables, indexes, RLS policies, storage buckets: `team/`, `projects/`, `partners/`, `csr/`, `general/`) |
| A.2 | Auth system (Supabase Auth email/password, `/login` route, `profiles` table + trigger on `auth.users`, role assignment) |
| A.3 | Admin dashboard shell (`/admin` route with sidebar, auth-gated, empty content panels) |
| A.4 | News CRUD (first content type: create/edit/delete via `/admin`, list view + form, publish toggle) |
| A.5 | News page wired to Supabase (`/news` reads from Supabase instead of data.json) |

### Phase B — Content Migration + Editor Panel (Week 3-4)
**Ship gate:** All content live from Supabase. Editors can use `/edit`. Visitors see no difference.

| # | Deliverable |
|---|------------|
| B.1 | Projects + Team + Partners CRUD in `/admin` (form validation, image upload to Supabase Storage) |
| B.2 | Editor panel `/edit` route (simplified sidebar, form-based editing for all content types) |
| B.3 | Data migration script (data.json → Supabase rows, idempotent) |
| B.4 | All public pages wired to Supabase (Home, About, Projects, Team, Contact) |
| B.5 | Page content editor (hero text, impact stats, mission values, taglines via `/admin`) |

### Phase C — New Features (Week 5-6)
**Ship gate:** All new features live. Technology page gone. CSR and partners visible.

| # | Deliverable |
|---|------------|
| C.1 | Tech widgets per project (video carousel → Puerto Princesa, process flow/comparison/monitoring per project) |
| C.2 | Home live impact dashboard (aggregated counters from projects table, replace static stats) |
| C.3 | Home partner logo carousel (auto-scroll, grayscale→color, clickable, from partners table) |
| C.4 | Per-project partner badges on project detail pages (filtered by project_ids) |
| C.5 | CSR content type + CRUD in `/admin` and `/edit` (timeline sub-form, SDG tag selector) |
| C.6 | CSR home carousel (horizontal scroll cards below projects) |
| C.7 | CSR section on Projects page (card grid default + timeline toggle, SDG filter) |
| C.8 | CSR detail pages (`/csr/[slug]`) |
| C.9 | Remove Technology page (delete route, remove from nav, content already distributed) |

### Phase D — Admin Polish + Audit (Week 7)
**Ship gate:** Full CMS operational. All roles working. Site live on production domain.

| # | Deliverable |
|---|------------|
| D.1 | User management (invite/remove editors, password reset, role toggle) |
| D.2 | Audit log viewer (filterable table, old/new diff expand) |
| D.3 | Publish workflow (draft → published state toggle, "Save as Draft" / "Publish" buttons) |
| D.4 | Media library (browse/upload/delete in Supabase Storage, grid view, filter by bucket) |
| D.5 | Final polish + deploy (all Phase 0 items from content-handoff.md: domain, email, Supabase, SendGrid, Netlify) |

---

## Integration with Existing content-handoff.md

This spec runs in parallel with `content-handoff.md`. The CMS work (Phases A-D above) provides the infrastructure. Content population (team headshots, project photos, verified stats) continues through content-handoff.md phases.

| content-handoff.md Phase | Relationship |
|--------------------------|-------------|
| Phase 0 (Infrastructure) | Overlaps with Phase A — Supabase, domain, Netlify are shared |
| Phase 1 (Launch Essentials) | Photos/stats/team data entered via CMS once Phase B completes |
| Phase 2 (Credibility Layer) | Gallery photos uploaded via CMS media library (Phase D) |
| Phase 3 (Content Review) | Jehremiah reviews content on live site, editors fix via `/edit` |
| Phase 4 (Polish) | Hero backgrounds, meta description editable via page_content CMS |

---

## Extensibility — Adding New Content Types & Pages

The architecture is designed for copy-paste extensibility. Adding a new content type (e.g., "Careers", "Events", "Case Studies") follows a fixed pattern:

### Content Type Recipe

1. **Database:** Add table matching existing shape pattern (id, slug, content columns, `published` boolean). Copy RLS policies from any existing content table — same `public SELECT published=true`, `editor INSERT/UPDATE`, `admin ALL`.
2. **Storage bucket:** Add bucket if content type has images. Same public-read, auth-write policy.
3. **Editor sidebar:** Add tab to `/edit` sidebar nav. Follow existing tab pattern (table view → + button → form).
4. **Admin panel:** Add table to `/admin` content section. Same pattern as other content tables — list view + CRUD form.
5. **Public page:** Add route + component. Query Supabase with same pattern: `.from('new_table').select('*').eq('published', true)`.
6. **API layer:** One shared Supabase client. No per-type API endpoints — all queries follow the same `.from(table).select().eq()` pattern.

### Key Design Decision

**No per-type scaffolding generation.** The pattern is simple enough that copying an existing content type's structure (table DDL, component, route, RLS) is faster and more maintainable than a code generator. The `page_content` table also handles ad-hoc page text without needing new tables — new pages can use `page_content.page = 'new-page'` for hero text, headings, etc. before graduating to a dedicated table if the content becomes structured.

### When to Use `page_content` vs New Table

| Situation | Use |
|-----------|-----|
| Simple page with text/headings/CTAs only | `page_content` key-value rows |
| Structured repeating entries (list of things with same shape) | New database table |
| Page that might grow into structured content later | Start with `page_content`, migrate to table when pattern stabilizes |

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| JSONB overuse becomes unqueryable | Stats, impact_metrics, links use JSONB for flexibility but have well-defined shapes enforced at application layer. If query performance becomes an issue, extract to relational tables later. |
| Migration script fails or corrupts data | Script is idempotent (can re-run). Run against staging Supabase first. Keep data.json files as backup through Phase C. |
| Editors find `/edit` too complex | `/edit` design prioritized simplicity — form-based, no tables. Test with 1-2 non-technical users before full rollout (Phase B). |
| RLS misconfiguration exposes unpublished content | Supabase RLS tested with integration tests per role. All public queries default to `published = true`. |
| Supabase free tier limits hit | Monitor usage during Phase B. Upgrade path defined. Free tier sufficient for 500MB DB + 2GB bandwidth. |

---

## Out of Scope

- Social media scheduling or cross-posting
- Email newsletter system (separate from transactional emails via SendGrid)
- Analytics dashboard (use existing Netlify Analytics or add Plausible later)
- Multi-language content (English only for now)
- Public user accounts or commenting
- E-commerce or donation functionality
