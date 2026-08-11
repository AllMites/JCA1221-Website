# JCA 1221 Content Audit — Database Change List

**Source audit:** `docs/content-audit-checklist.md` — "JCA 1221 Content Audit — Dad's Input Checklist" (father-son session, 2026-07-14; decisions in the "IF YOU'RE READING THIS, THIS IS THE REAL STUFF HE ADDED" section).

**Supabase project:** `urtdzvtdekyycdnszlyp` (anon JWT from parent card used read-only to verify current state).

**Consumer:** update task `t_e3bbb5ac` — combine this list with the survey task (`t_e301d363`) output, apply via targeted statements keyed by primary key / natural key.

**Status legend:** `APPLY` = precise & ready · `CONFIRM` = precise target but requester should confirm (prior session applied an alternative interpretation) · `NEEDS INPUT` = audit intent clear, target value unknown · `VERIFIED DONE` = already in live DB · `PENDING ASSET` = waiting on Dad's assets · `CODE` = source/static files, not DB.

> Headline finding: a previous session already applied the large majority of the audit to the live database (hero copy, all three projects' stats/technology/impact metrics, founder milestones 2015→2026, value pillars, contact copy, Del Carmen status). The list below contains only the **remaining** changes.

---

## REMAINING DB CHANGES

### APPLY — ready to execute

| ID | Table / key | Field | Current | Target | Reason | SQL hint |
|----|-------------|-------|---------|--------|--------|----------|
| CL-01 | `team_members` / name = `Jehremiah C. Asis` | credentials | `*** UP Diliman (Magna Cum Laude)` | `UP Diliman (Magna Cum Laude)` | Literal `***` redaction artifact stored in the row. Audit Team #1 wanted education added. (Full string ambiguity → NI-03.) | `UPDATE team_members SET credentials='UP Diliman (Magna Cum Laude)' WHERE name='Jehremiah C. Asis';` |
| CL-06 | `tech_widgets` / project = puerto-princesa, widget_type = `visitor_portfolio` | published | `true` | `false` | Audit Puerto #7: "remove or hide or disable VBRP for all". VBRP = Visitor, Benchmarking & Recognition Portfolio. UI already filters it out; unpublish for DB consistency. | `UPDATE tech_widgets SET published=false WHERE project_id=(SELECT id FROM projects WHERE slug='puerto-princesa') AND widget_type='visitor_portfolio';` |
| CL-07 | `tech_widgets` / project = puerto-princesa, widget_type = `process_flow` | published | `true` | `false` | Audit Puerto #5: "no need for process — remove process". UI already filters it out; unpublish for DB consistency. | `UPDATE tech_widgets SET published=false WHERE project_id=(SELECT id FROM projects WHERE slug='puerto-princesa') AND widget_type='process_flow';` |

### CONFIRM — precise per audit, but verify with requester

| ID | Table / key | Field | Current | Target | Reason | SQL hint |
|----|-------------|-------|---------|--------|--------|----------|
| CL-02 | `team_members` / name = `Odysseus C. Alfon` | credentials | `Chem. Engr.` | `Chem. Engr., BS Chemical Engineering, University of San Agustin` | Audit Team #2: education missing, "search up his education". LinkedIn / ZoomInfo / RocketReach consistently list BS ChemE 2002–2007, University of San Agustin. | `UPDATE team_members SET credentials='Chem. Engr., BS Chemical Engineering, University of San Agustin' WHERE name='Odysseus C. Alfon';` |
| CL-04 | `page_content` / about·founder·title | value | `Founder & Chairman` | `Founder & President` | Inconsistent titles across rows; migration 00005 + contact team contacts both use "Founder & President". Key currently unrendered — low impact. | `UPDATE page_content SET value='"Founder & President"'::jsonb WHERE page='about' AND section='founder' AND key='title';` |
| CL-05 | `page_content` / about·founder·profile | value.role | `Founder & CEO, JCA 1221 Holdings Inc.` | `Founder & President, JCA 1221 Holdings Inc.` | Same inconsistency — rendered by the About page. Migration 00005's regexp never reached this row. | `UPDATE page_content SET value=jsonb_set(value,'{role}','"Founder & President, JCA 1221 Holdings Inc."') WHERE page='about' AND section='founder' AND key='profile';` |
| CL-08 | `csr_projects` / slug = `siargao-community-waste` | description | "Community-led waste segregation and collection program in Del Carmen and surrounding barangays, building local capacity ahead of the pyrolysis facility launch." | DRAFT: "Community-led waste segregation and collection program in Del Carmen and surrounding barangays — turning diverted waste into soil enhancer for local farms and recycled water for aquaculture, while building research and education partnerships ahead of the pyrolysis facility launch." | Audit Homepage #10: CSR descriptions must highlight aquaculture + farms + research education. Draft copy — confirm wording. | — |
| CL-09 | `csr_projects` / slug = `puerto-princesa-learning-center` | description | "On-site learning center at the Puerto Princesa facility, educating students and community members about water quality, wastewater treatment, and coastal ecosystem restoration." | DRAFT: "On-site learning center at the Puerto Princesa facility, hosting students and community members for research education on water quality, wastewater treatment, aquaculture, and coastal ecosystem restoration." | Audit Homepage #10. Confirm wording. | — |
| CL-10 | `page_content` / about·values·pillars → `[0].subPoints` (integrity) | jsonb | 1. "Full transparency in procurement" (old title+desc) 2. "Community-first accountability" (audit text) 3. "Solutions First Mentality" (audit #3 text) | PER AUDIT: 1. "Solutions First Mentality" (audit #3 text) 2. "Community-first accountability" 3. "Long Term Stability" (audit #5 text) | Audit About #3 + #5. Previous session applied #3 as a new 3rd card (old title kept on card 1) and moved #5's content to service-over-profit. Realign or keep — requester decision. | — |
| CL-11 | `page_content` / about·values·pillars → `[2].subPoints` (service-over-profit) | jsonb | 3rd subPoint = "Long Term Stability" (audit #5 text) | Restore 3rd subPoint = "Knowledge transfer, not dependency" ("Every facility includes a Learning Center component. We train local operators…") | Audit never touched this card; "Long Term Stability" belongs in integrity pillar per About #5. Confirm before reverting. | — |
| CL-12 | `page_content` / about·values·pillars → `[1].description` (circular-economy) | jsonb | "Nature doesn't produce waste — everything cycles…" | PER AUDIT: "Our systems mimic nature's cleaning processes. Microorganisms do the heavy lifting… For solid waste, we design with the environment in mind by meeting and exceeding regulatory standards." | Audit About #6: Card 1 description should be replaced; prior session put the text in subPoint[0] instead. Confirm. | — |

### NEEDS INPUT — cannot write a precise update without requester

| ID | Table / key | Field | Current | What's needed | Audit ref |
|----|-------------|-------|---------|---------------|-----------|
| NI-01 | `projects` / puerto-princesa | short_description | "…recycling facility that was proved to rehabilitate a bay." | Concrete edit — audit only says "Text needs to be edited" (unclear). Descriptions were already rewritten per other items; ask if anything further. | Homepage #8 |
| NI-02 | `team_members` (all) | bio | current bios | Source write-ups: "adopt write ups used in SUAC (ambiguous characters, SUAC or SCAC or SBAC I don't know), Bangkdo (ambiguous writing), Seminar (ambiguous)". The referenced documents/acronym are unidentified — requester must supply them. | Team general note |
| NI-03 | `team_members` / Jehremiah | credentials | `*** UP Diliman (Magna Cum Laude)` | Confirm full education string: dad listed "UB (ambiguous, I don't know), Up Diliman + BS Econ, UP Diliman (Magna Cum Laude)". CL-01 is the minimal cleanup; final string needs his pick. | Team #1 |
| NI-04 | `team_members` / Zara C. See | credentials | (empty) | Education value — not provided by dad, not in public sources. Ask dad/Zara. | Team #3 |
| NI-05 | `tech_widgets` / puerto monitoring + app logic | config | per-project dashboard | Cross-project "weighted average + total based on system time" is a feature change → developer, not content. | Puerto #6 |
| NI-06 | technology page metrics | liveMetrics (static data.json) | synthetic 2,920,000 m³ / 4,127 m³/day / 98.7% / 34% | Real SCADA/operations data from dad. | Checklist #4 |

---

## VERIFIED DONE — already applied in live DB (no action)

Hero "nature-inspired" (home hero content + description) · "Serving" label · Homepage partner list (code) · Stewardship/Ingenuity/Purpose pillars (code + about/values/items) · Del Carmen status = operational · DILG/IRO certifications (section no longer exists) · Founder letter rewrite · Integrity pillar description · Community-first accountability · Serbisyo "clean water and proper waste treatment" · UP validation sentence · "5+" removed · "…or process their trash" · Milestones 2015→2026 (1999-2015, 2017 rewrite, nature-inspired 2019, up-to-4,000 2022, 2023 Mindanao & Siargao, 2026 Del Carmen Breakthrough) · Gingoog 1,030 m³/day + tech + impact + Macajalar Bay · PPWRLC "/day wastewater" + SBR + Solar-UV removed + visitors 500+ · Del Carmen 5 tons/day + 20 m³/day + desc + tech + outputs + Cebu cut · Contact: "Serious inquiries only." removed, response guarantee removed, PDCP address confirmed · Awards/partners sections gone from UI (rows orphaned — optional cleanup; deletion is destructive, not recommended).

Full machine-readable detail (incl. per-item evidence): `docs/content-audit-change-list.json`.

## PENDING ASSETS (Dad) — future content, not edits

3 team headshots (Jehremiah, Constantine, Zara) · 2 CSR photo sets · 8 partner logos (all `partners.logo` NULL) · real SCADA dashboard numbers (NI-06) · 5 facility videos ("Preview coming soon" carousel) · admin panel parent account details.

## CODE-SCOPE leftovers (not DB — flag to requester)

- "nature-mimicking" still hardcoded in `src/pages/HomePage.tsx:17,80`, `src/shell/components/AppShell.tsx:220`, `src/shell/ShellPreview.tsx:45`, `src/sections/faq/components/FaqSection.tsx:45`, `src/pages/TechnologyPage.tsx:24` (fallbacks/SEO/footer/FAQ — DB is fixed, these strings are not).
- "photo placeholder" (`product/sections/about-and-mission/spec.md:18`) and "map placeholder" (`product/sections/contact-and-partnerships/data.json:6`) — internal docs (audit checklist #21/#22).
- Cross-project monitoring dashboard feature (NI-05).

---

*Produced by task t_4d32a77a. Current values verified against live Supabase (anon read) on 2026-08-12; repo seed.sql is stale relative to live and should not be used as current-state source.*
