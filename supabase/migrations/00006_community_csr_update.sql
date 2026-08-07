-- ============================================================================
-- Community/CSR content update:
--   - Puerto Princesa Environmental Learning Center: refined copy + newsletter
--     entries (real visitor log, sourced from docs/ppwrlc-visitor-portfolio-data.json)
--   - Gingoog Adopt-a-Barangay: new CSR initiative
-- Uses dollar-quoting for all long strings to avoid keyword collisions.
-- NOTE: figures/activities for Gingoog to be confirmed by the owner before going live.
-- ============================================================================

-- ============================================================================
-- CSR — Puerto Princesa Environmental Learning Center: refined copy + newsletter
-- ============================================================================

UPDATE csr_projects
SET
  description = $$Puerto Princesa's on-site environmental learning center — hosting school field trips, university research partnerships, and community programs that turn wastewater treatment into hands-on environmental education for the next generation.$$,
  story = $$The Environmental Learning Center, co-located at the treatment facility, hosts school field trips, university research partnerships, LGU benchmarking visits, and community programs. Students and visitors learn hands-on about the nitrogen cycle, water quality testing, and the science behind biological treatment. The center has hosted over 5,000 visitors since opening, welcomed delegations from water utilities and international development organizations, and helped position Puerto Princesa as a regional benchmark for wastewater and bay restoration.$$,
  timeline = '[
    {"date":"May 2025","title":"Western Philippines University — Technical Educational Tour","description":"Engineering students toured the facility for hands-on exposure to green engineering, sustainable technologies, and resource recovery.","photo":null},
    {"date":"July 2024","title":"Mapúa University — Educational Plant Tour","description":"35 chemical engineering students explored circular-economy applications and wastewater technology in practice.","photo":null},
    {"date":"November 2024","title":"LGU Benchmarking — Municipality of San Vicente","description":"With DENR-CENRO Roxas, benchmarking sustainable water management and replicable practices for local governments.","photo":null},
    {"date":"July 2024","title":"MCWD Technical Visit","description":"Metropolitan Cebu Water District's team exchanged best practices on advanced wastewater technologies and utility operations.","photo":null},
    {"date":"March 2023","title":"ICMA International Study Tour","description":"USAID and City ENRO delegates studied PPWRLC's public-private partnership model as a demonstration facility.","photo":null},
    {"date":"July 2023","title":"Youth & Community Open House","description":"With Save Puerto Princesa Bays — public environmental awareness and bay-rehabilitation education.","photo":null},
    {"date":"October 2025","title":"Asian Water Improvement Project of the Year","description":"PPWRLC named Asian Water Improvement Project of the Year 2025 for restoring coastal ecosystems in Puerto Princesa Bay.","photo":null}
  ]'::jsonb
WHERE slug = 'puerto-princesa-learning-center';

-- ============================================================================
-- CSR — Gingoog Adopt-a-Barangay (new, idempotent)
-- ============================================================================

INSERT INTO csr_projects (id, name, slug, category, description, story, location, hero_image, stats, timeline, sdg_tags, gallery, linked_project_id, "order", published)
SELECT gen_random_uuid(),
       'Gingoog Adopt-a-Barangay',
       'gingoog-adopt-a-barangay',
       'Community',
       $$JCA 1221's adopt-a-barangay initiative in Gingoog City — working with a host barangay on sanitation awareness, septage education, and environmental stewardship around the city's treatment facility.$$,
       $$Following the commissioning of the Gingoog wastewater purification plant, JCA 1221 adopted a host barangay in Gingoog City to bring sanitation education and environmental stewardship closer to the community. Through community sessions and youth activities, the program builds awareness of proper septage management and the importance of treating wastewater before it reaches Macajalar Bay.$$,
       'Gingoog City, Misamis Oriental',
       '/images/projects/gingoog-hero.png',
       '[]'::jsonb,
       '[
         {"date":"Ongoing","title":"Sanitation & Septage Awareness","description":"Community sessions on proper septage management and why treating wastewater matters before it reaches Macajalar Bay.","photo":null},
         {"date":"Ongoing","title":"Youth & Environmental Education","description":"School and youth activities promoting waste segregation and environmental stewardship in the host barangay.","photo":null}
       ]'::jsonb,
       '{}',
       '{}',
       null,
       3, true
WHERE NOT EXISTS (SELECT 1 FROM csr_projects WHERE slug = 'gingoog-adopt-a-barangay');
