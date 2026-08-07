-- ============================================================================
-- Community / CSR content update
--   1. Puerto Princesa Environmental Learning Center — refined summary plus
--      newsletter-style entries (short, scannable) replacing the long block.
--      Source: docs/ppwrlc-visitor-portfolio-data.json (KFA visitor portfolio).
--   2. Gingoog Adopt-a-Barangay — new community initiative card.
--
-- The `timeline` column is reused as the newsletter entry list; CsrSection
-- renders it as short entry cards, not as a timeline.
-- Uses dollar-quoting for all long strings to avoid keyword collisions.
-- NOTE: Gingoog activity details are intentionally kept general — confirm
--       specifics (barangay name, dates, figures) with the owner before launch.
-- ============================================================================

-- ============================================================================
-- CSR — Puerto Princesa Environmental Learning Center
-- ============================================================================

UPDATE csr_projects
SET
  description = $$An on-site environmental learning center at the Puerto Princesa water reclamation facility, where students, local governments, water utilities and international delegations see wastewater treatment working up close.$$,
  timeline = $$[
    {"date":"October 2025","title":"Asian Water Improvement Project of the Year","description":"Recognised in Kuala Lumpur as the first combined septage and sewage treatment facility in the Philippines producing recycled water.","photo":null},
    {"date":"May 2025","title":"Western Philippines University","description":"Engineering students toured the plant for hands-on exposure to green engineering, sustainable technologies and resource recovery.","photo":null},
    {"date":"November 2024","title":"Municipality of San Vicente, Palawan","description":"Benchmarking visit with DENR-CENRO Roxas on sewage treatment operations and practices other LGUs can replicate.","photo":null},
    {"date":"August 2024","title":"Palawan Provincial General Services Office","description":"Provincial government learning visit on environmental sustainability and water management.","photo":null},
    {"date":"July 2024","title":"Metropolitan Cebu Water District","description":"Technical plant visit exchanging practice between water utilities on advanced wastewater treatment.","photo":null},
    {"date":"July 2024","title":"Mapua University","description":"35 chemical engineering students on an educational plant tour covering circular economy and wastewater technology in practice.","photo":null},
    {"date":"July 2023","title":"Save Puerto Princesa Bays Open House","description":"Public open house on environmental awareness and the rehabilitation of the city's bays.","photo":null},
    {"date":"August 2023","title":"Puerto Princesa City Youth Development Office","description":"Educational plant tour for the city's youth development programme.","photo":null},
    {"date":"March 2023","title":"ICMA International Study Tour","description":"USAID and City ENRO delegates studied the facility's public-private partnership model.","photo":null},
    {"date":"February 2022","title":"First Septage Fee Remittance","description":"PHP 1,071,354.38 remitted to the city — the first return to government under the partnership.","photo":null},
    {"date":"March 2022","title":"Palawan Water, El Nido","description":"Technical collaboration between operators on wastewater treatment practice.","photo":null},
    {"date":"February 2022","title":"Ambassador of Canada","description":"Courtesy and technical visit by His Excellency Peter MacArthur.","photo":null},
    {"date":"January 2022","title":"Puerto Princesa City Fire Department","description":"Discussion on using recycled water from the facility for firefighting operations.","photo":null}
  ]$$::jsonb
WHERE slug ILIKE '%learning-center%'
   OR name ILIKE '%Environmental Learning Center%';

-- ============================================================================
-- CSR — Gingoog Adopt-a-Barangay (idempotent insert)
-- ============================================================================

INSERT INTO csr_projects (
  name, slug, category, description, story, location, hero_image,
  stats, timeline, sdg_tags, gallery, linked_project_id, "order", published
)
SELECT
  'Gingoog Adopt-a-Barangay',
  'gingoog-adopt-a-barangay',
  'Community',
  $$JCA 1221 has adopted a host barangay in Gingoog City, working with residents on sanitation awareness, proper septage management and environmental stewardship around the city's water reclamation facility.$$,
  $$Infrastructure only works when the community around it understands it. Alongside the Gingoog water reclamation facility, JCA 1221 adopted a host barangay to bring sanitation and environmental education directly to residents — how septage is collected and treated, why wastewater has to be cleaned before it reaches coastal waters, and what households can do. The programme runs through community sessions and school activities with the barangay and the city government.$$,
  'Gingoog City, Misamis Oriental',
  '/images/projects/gingoog-hero.png',
  '[]'::jsonb,
  '[]'::jsonb,
  '{}',
  '{}',
  (SELECT id FROM projects WHERE slug ILIKE 'gingoog%' LIMIT 1),
  3,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM csr_projects WHERE slug = 'gingoog-adopt-a-barangay'
);
