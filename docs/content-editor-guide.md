# Content Editor Guide

A reference for content editors managing the JCA 1221 Holdings website.

---

## Table of Contents

1. [Accessing the Editor](#accessing-the-editor)
2. [JSON Crash Course](#json-crash-course)
3. [Projects](#projects)
4. [News](#news)
5. [Team Members](#team-members)
6. [Partners](#partners)
7. [CSR Projects](#csr-projects)
8. [Page Content](#page-content)
9. [Slugs](#slugs)
10. [Images](#images)
11. [Publishing & Ordering](#publishing--ordering)

---

## Accessing the Editor

Go to `/edit` on the website and sign in.

The editor has two panels:
- **Left sidebar** — tabs for each content type
- **Left list** — click any item to edit, or **+ New** to create
- **Right panel** — the form for the selected item

---

## JSON Crash Course

Some fields use **JSON** — a way to write structured data. If JSON is wrong, the field will show as empty or broken on the live site.

### Basic Rules

```
[]  — square brackets = a list of items
{}  — curly braces = one item with properties
""  — double quotes around text values
,   — comma between items
```

### Example — Stats field

```json
[
  { "label": "Population Served", "value": "300,000+" },
  { "label": "Area Coverage", "value": "5 municipalities" }
]
```

This is a list of 2 stat items. Each item has a `label` and a `value`.

### Common Mistakes

| Wrong | Fixed | Why |
|-------|-------|-----|
| `{label: "text"}` | `{"label": "text"}` | Keys need double quotes |
| `["text",]` | `["text"]` | No trailing comma |
| `{}{}` | `[{}, {}]` | Multiple items need `[]` wrapper |
| Missing comma between items | Add `,` between items | JSON can't tell where one item ends and next starts |

### Validate Before Saving

Use [jsonlint.com](https://jsonlint.com/) — paste your JSON, it tells you if it's correct.

---

## Projects

### Fields

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | Project title |
| Slug | Text | URL identifier — see [Slugs](#slugs) |
| Location | Text | Where project is based |
| Status | Dropdown | `operational` / `development` / `planning` |
| Hero Image URL | URL | Main banner image |
| Hero Description | Text | Short text over the hero image |
| Short Description | Text | Shown in project list cards |
| Full Description | Multi-line text | Long description for detail page |
| Stats | [JSON](#project-stats) | Key numbers shown on project page |
| Technology | [JSON](#project-technology) | Tech description + tags |
| Impact Metrics | [JSON](#project-impact-metrics) | Performance/improvement data |
| Year Started | Number | e.g. `2020` |
| Year Completed | Number | Leave blank if ongoing |
| Gallery Images | [Comma URLs](#images) | Additional photos |
| Order | Number | Sort position — lower = first |

### Project Stats

```json
[
  { "label": "Population Served", "value": "300,000+" },
  { "label": "Treatment Capacity", "value": "50 MLD" }
]
```

- `label` — what is being measured (text)
- `value` — the number or amount (text)

### Project Technology

```json
{
  "description": "Sequencing Batch Reactor (SBR) technology for biological treatment",
  "tags": ["SBR", "Biological Treatment", "Phosphorus Removal"]
}
```

- `description` — plain text explanation
- `tags` — list of technology keywords

### Project Impact Metrics

```json
[
  { "label": "Water Treated", "value": "50M L/day", "improvement": "+30%" },
  { "label": "Energy Efficiency", "value": "Baseline 100 kWh", "improvement": "-15%" }
]
```

- `label` — metric name
- `value` — current reading
- `improvement` — change from baseline (include + or - sign)

---

## News

### Fields

| Field | Type | Notes |
|-------|------|-------|
| Title | Text | Article headline |
| Source | Text | Publication name (e.g. "Philippine Star") |
| Date | Date picker | Publication date |
| Category | Dropdown | `awards` / `projects` / `policy` / `expansion` / `media` |
| Type | Dropdown | `media-coverage` / `award` / `feature` |
| Excerpt | Multi-line | Summary/snippet |
| URL | URL | Link to the full article |
| Tags | Comma-separated | Keywords for filtering |

### Tags

Type keywords separated by commas:

```
Puerto Princesa, Awards, Water Infrastructure
```

Each tag becomes a filterable label.

---

## Team Members

### Fields

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | Full name |
| Role | Text | Job title |
| Credentials | Text | e.g. "PhD, PE, MBA" |
| Photo URL | URL | Headshot |
| Bio | Multi-line | Biography |
| Quote | Text | A notable quote |
| Expertise | Comma-separated | Areas of expertise |
| Links | [JSON](#team-links) | Social/profile links |
| Order | Number | Sort position |

### Team Links

```json
[
  { "type": "linkedin", "label": "LinkedIn", "url": "https://linkedin.com/in/..." },
  { "type": "email", "label": "Email", "url": "mailto:name@jca1221.com" }
]
```

- `type` — either `"linkedin"` or `"email"` (determines icon)
- `label` — display text
- `url` — full URL (email uses `mailto:` prefix)

### Expertise

Type areas separated by commas:

```
Water Treatment, PPP, Environmental Engineering, Project Management
```

---

## Partners

### Fields

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | Organization name |
| Type | Dropdown | `LGU` / `national_agency` / `private_sector` / `community` / `regulatory` |
| Logo URL | URL | Logo image |
| Website URL | URL | Partner's website |
| Project IDs | Comma-separated UUIDs | IDs of related projects |

### Project IDs

This links a partner to projects. Get the project UUID from the browser URL when editing a project (the long string in the address bar).

```
a1b2c3d4-..., e5f6g7h8-...
```

---

## CSR Projects

### Fields

| Field | Type | Notes |
|-------|------|-------|
| Name | Text | CSR project title |
| Slug | Text | URL identifier |
| Category | Text | e.g. "Coastal Restoration" |
| Location | Text | Where it takes place |
| Hero Image URL | URL | Main image |
| Description | Multi-line | Short summary |
| Story | Multi-line | Full narrative |
| Stats | [JSON](#csr-stats) | Key numbers |
| Timeline | [JSON](#csr-timeline) | Chronological events |
| SDG Tags | Comma-separated | UN Sustainable Development Goals |
| Gallery | Comma URLs | Additional photos |
| Linked Project ID | Text | Related project UUID |
| Order | Number | Sort position |

### CSR Stats

Same format as [Project Stats](#project-stats):

```json
[
  { "label": "Trees Planted", "value": "1,200" },
  { "label": "Volunteers", "value": "300" }
]
```

### CSR Timeline

```json
[
  {
    "date": "2024-01",
    "title": "Project Launch",
    "description": "Initial meeting with stakeholders.",
    "photo": null
  },
  {
    "date": "2024-06",
    "title": "Mangrove Planting",
    "description": "First batch of 500 seedlings planted.",
    "photo": "https://..."
  }
]
```

- `date` — any date string (month + year is enough)
- `title` — event name
- `description` — what happened
- `photo` — image URL or `null` if no photo

### SDG Tags

Type goal IDs separated by commas:

```
SDG 14, SDG 13, SDG 11
```

---

## Page Content

This section stores small text snippets for specific pages. Use caution — changing these affects the live site.

### Fields

| Field | Type | Notes |
|-------|------|-------|
| Page | Dropdown | Which page this content belongs to |
| Key | Text | Identifier (e.g. `hero_title`, `mission_text`) |
| Value | Multi-line | The content itself |
| Order | Number | Sort position |

Keys are auto-formatted to lowercase with underscores (e.g. `call_to_action_text`).

---

## Slugs

A slug is the URL-friendly identifier for a project or CSR page.

- **Auto-generation**: when creating, the slug is generated from the name (e.g. "Puerto Princesa WTP" → `puerto-princesa-wtp`)
- **Override**: you can edit the slug manually. Once set, it stays as-is
- **Rules**: lowercase, hyphens only (no spaces, no special chars)
- **Warning**: changing a slug on a published item breaks any existing links to that page

---

## Images

### Image URL Format

Use absolute URLs (starting with `https://`). Supported formats:
- JPEG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- WebP (`.webp`) (preferred — smaller, faster)

### Hero Images

Every project and CSR has a hero image — the large banner at the top of the detail page. Best dimensions: 1920×600 px or similar wide format.

### Gallery Images (Projects & CSR)

Type each URL separated by a comma:

```
https://example.com/image1.jpg, https://example.com/image2.jpg, https://example.com/image3.jpg
```

No brackets, no quotes — just URLs with commas.

### Icons / Logos (Team & Partners)

Team photos and partner logos work best as square images (400×400 px minimum).

---

## Publishing & Ordering

### Publish vs Draft

- **Publish** — makes the item visible on the live site immediately
- **Save as Draft** — saves without making it visible (only admins see it in the editor)
- Existing published items: the list view shows a dot indicator; use the toggle to unpublish

### Order Field

Controls the sort position of items on the website:
- Lower numbers appear first
- If items have the same number, they sort alphabetically
- News articles sort by date (newest first) regardless of order

### Deleting Items

- Projects, news, team members, partners, and CSR items can be deleted from the list panel (click the × button that appears on hover)
- **Deleted items cannot be recovered** — there is no trash bin

---

## Summary Table — JSON Fields Only

| Content Type | JSON Fields | Shape |
|-------------|-------------|-------|
| Project | `Stats` | `[{"label","value"}]` |
| Project | `Technology` | `{"description","tags":[]}` |
| Project | `Impact Metrics` | `[{"label","value","improvement"}]` |
| Team | `Links` | `[{"type","label","url"}]` |
| CSR | `Stats` | Same as Project Stats |
| CSR | `Timeline` | `[{"date","title","description","photo"}]` |

Everything else uses regular form fields or comma-separated text.

---

## Quick Troubleshooting

| Symptom | Likely Cause |
|---------|-------------|
| Item not showing on site | Check if **Published** is yes. Check **Order** value. |
| Stats/JSON field shows blank | JSON has a syntax error. Paste into [jsonlint.com](https://jsonlint.com/). |
| Image not loading | URL is broken or uses HTTP (needs HTTPS). |
| Page shows 404 | The **Slug** was changed or the URL is wrong. |
| Can't find an item | Check the correct tab. Use the list scroll — it loads all items. |

---

*Last updated: 2026-06-17*
