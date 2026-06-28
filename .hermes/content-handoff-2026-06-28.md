# JCA1221 Website — Content Handoff
## 2026-06-28 — Hermes Ops Session

### CONFIRMED (from direct sources)
The following content comes from direct sources: Supabase DB, company website (jca1221.com, jca1221-group.com), news articles in DB, Philstar Tech profile, ONE News, LinkedIn, Inquirer.

| Field | Source |
|---|---|
| "Water Renewal for Generations" tagline | jca1221.com |
| "Serbisyo, Hindi Negosyo" mission title | jca1221.com |
| Founder aquarium origin story | jca1221.com/about |
| Near-fatal car accident | jca1221.com/about + Philstar Tech |
| "60% cheaper" claim | jca1221.com |
| Asian Water Award 2025 | Multiple news + Vimeo |
| Puerto Princesa 4,000 m³/day | Multiple sources |
| Gingoog modular SBR | DB + news articles |
| Del Carmen pyrolysis 15 tons/day | DB + Cebu Gov't article |
| Cross-subsidy model ("laylayan") | Inquirer (2023) |
| Corruption ₱100B quote | ONE News / LinkedIn |
| Team member bios | Supabase migration 00005 |
| Ironman/dragon boat races in bay | jca1221.com |
| 5 team members | Supabase team_members |
| 8 partners | Supabase partners |
| 12 news articles | Supabase news_articles |

### INFERRED (plausible but unverified)
The following details are reasonable extrapolations from confirmed data but have not been independently verified.

| Content | Basis for inference | Risk |
|---|---|---|
| SBR technology specifics (aerobic/anoxic cycles) | Standard for biological nutrient removal; mentioned as "nitrogen cycle" | Low |
| Reed bed polishing at Gingoog | Common modular SBR configuration for Mindanao terrain | Medium — verify |
| 200+ households in Siargao segregation | In CSR project DB entry | Low — from DB |
| "Studied by Cebu Province" | News article "Gov. Pam Eyes Siargao Model" (cebuprovince.org) | Low — has source |
| Water quality 98.7% compliance | In static data.json; plausible but unverified | Medium — verify with IoT data |
| Solar energy 34% contribution | In static data.json; plausible but unverified | Medium — verify with IoT data |
| Gingoog 2,500 m³/day capacity | In DB; not independently verified beyond DB | Medium — verify |

### PENDING VERIFICATION
- [ ] Gingoog: Confirm reed bed polishing tech
- [ ] All projects: Verify capacity figures with engineering team
- [ ] Dashboard metrics: Replace simulated data with real IoT data
- [ ] Del Carmen: Confirm facility operational status (currently "development")
- [ ] Team member photos: Upload real photos for Katherine + Odysseus (placeholder images exist)

### WHAT WAS WRITTEN TO SUPABASE
- homepage hero: tagline, description, CTA, impact_stats
- homepage mission: sectionTitle ("Serbisyo, Hindi Negosyo"), sectionLabel, values
- about founder: letter (full aquarium + accident story)
- about mission: statement
- about values: items (stewardship, ingenuity, partnership, transparency)
- projects: full descriptions, hero_descriptions, stats, technology, impact_metrics for all 3 projects
- Technology page: static data.json stop-slop pass

### WHAT WAS CLEANED
- Test project unpublished (id: a5d372e8...)
- CSR name fixed: "siargao-community-waste-program" → "Siargao Community Waste Program"
- 12 old design screenshots deleted + committed
- 3 clean commits pushed to GitHub (2b0f45b, 81c3fc4, b192c07)
