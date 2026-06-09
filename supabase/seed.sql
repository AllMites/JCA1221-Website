-- ============================================================================
-- JCA 1221 Website – Seed Data Migration
-- Migrates static product/sections/*/data.json content into Supabase
-- Source: product/sections/{projects,team,news,contact,about,home}/data.json
-- Idempotent: safe to run multiple times
-- ============================================================================

-- ============================================================================
-- PROJECTS (source: product/sections/projects-and-track-record/data.json)
-- ============================================================================

-- Puerto Princesa Water Reclamation & Learning Center
INSERT INTO projects (id, name, slug, location, status, hero_image, hero_description, short_description, description, stats, technology, impact_metrics, year_started, year_completed, gallery_images, "order", published)
VALUES (
  gen_random_uuid(),
  'Puerto Princesa Water Reclamation & Learning Center',
  'puerto-princesa',
  'Puerto Princesa City, Palawan',
  'operational',
  '/images/projects/puerto-princesa-hero.jpg',
  'The Philippines'' first large-scale combined septage and sewage treatment facility — a model for how environmental infrastructure can restore coastal ecosystems while remaining financially sustainable.',
  'City-scale biological treatment facility preventing 4,000 cubic meters of untreated wastewater from entering Puerto Princesa Bay daily.',
  'The Philippines'' first large-scale combined septage and sewage treatment facility — a model for how environmental infrastructure can restore coastal ecosystems while remaining financially sustainable.',
  '[
    {"label": "Daily Capacity", "value": "4,000 m³"},
    {"label": "Technology", "value": "Biological Nutrient Removal"},
    {"label": "Project Cost", "value": "PHP 450M+"},
    {"label": "Communities Served", "value": "300,000+"}
  ]'::jsonb,
  '{
    "description": "The facility uses a Sequential Batch Reactor (SBR) system with biological nutrient removal — the same nitrogen cycle found in healthy aquatic ecosystems. Wastewater passes through primary screening, biological treatment, secondary clarification, and UV disinfection before being released as clean recycled water. Solar-assisted operations reduce energy costs, and IoT sensors provide real-time remote monitoring of water quality parameters.",
    "tags": ["Biological Nutrient Removal", "SBR Technology", "UV Disinfection", "Solar-Assisted", "IoT Remote Monitoring", "Septage + Sewage Combined"]
  }'::jsonb,
  '[
    {"label": "Wastewater treated daily", "value": "4,000 m³", "improvement": "Prevents equivalent volume from entering the bay"},
    {"label": "Recycled water released", "value": "4,000 m³/day", "improvement": "Dilutes remaining outflows, restoring marine habitats"},
    {"label": "Bay water quality", "value": "Swimmable", "improvement": "Now hosts Ironman triathlons and dragon boat races"},
    {"label": "Local employment", "value": "50+ jobs", "improvement": "Operators, technicians, and educators from the community"}
  ]'::jsonb,
  2022,
  2024,
  ARRAY['/images/projects/puerto-princesa-1.jpg', '/images/projects/puerto-princesa-2.jpg', '/images/projects/puerto-princesa-3.jpg'],
  1,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Gingoog City Septage Treatment Facility
INSERT INTO projects (id, name, slug, location, status, hero_image, hero_description, short_description, description, stats, technology, impact_metrics, year_started, year_completed, gallery_images, "order", published)
VALUES (
  gen_random_uuid(),
  'Gingoog City Septage Treatment Facility',
  'gingoog',
  'Gingoog City, Misamis Oriental',
  'development',
  '/images/projects/gingoog-hero.jpg',
  'Bringing modern wastewater treatment to Mindanao''s coastal communities — a modular, scalable facility designed for Gingoog''s growing population and unique geography.',
  'Modular septage treatment plant designed for Mindanao''s coastal terrain, preventing untreated septage from reaching Macajalar Bay.',
  'Bringing modern wastewater treatment to Mindanao''s coastal communities — a modular, scalable facility designed for Gingoog''s growing population and unique geography.',
  '[
    {"label": "Design Capacity", "value": "2,500 m³/day"},
    {"label": "Technology", "value": "Modular SBR + Reed Bed Filtration"},
    {"label": "Est. Project Cost", "value": "PHP 280M"},
    {"label": "Est. Communities Served", "value": "150,000+"}
  ]'::jsonb,
  '{
    "description": "Gingoog''s facility uses a modular approach — prefabricated treatment units that can be deployed in phases as the city grows. The system combines SBR biological treatment with constructed reed bed filtration, a nature-based polishing step that removes residual nutrients before discharge. This hybrid design reduces energy consumption by 30% compared to fully mechanical systems, while the modular architecture allows rapid deployment to remote coastal terrain.",
    "tags": ["Modular SBR", "Reed Bed Filtration", "Hybrid Nature-Based", "Phased Deployment", "Coastal Engineering"]
  }'::jsonb,
  '[
    {"label": "Design treatment capacity", "value": "2,500 m³/day", "improvement": "Sufficient for Gingoog''s current and near-term population"},
    {"label": "Energy reduction", "value": "30% lower", "improvement": "Compared to fully mechanical treatment plants"},
    {"label": "Modular expansion capability", "value": "3 phases", "improvement": "Scales with city growth without service interruption"},
    {"label": "Local employment (est.)", "value": "30+ jobs", "improvement": "Construction and operations workforce from Gingoog"}
  ]'::jsonb,
  2025,
  null,
  ARRAY['/images/projects/gingoog-1.jpg', '/images/projects/gingoog-2.jpg'],
  2,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- Del Carmen Solid Waste Management & Pyrolysis Facility
INSERT INTO projects (id, name, slug, location, status, hero_image, hero_description, short_description, description, stats, technology, impact_metrics, year_started, year_completed, gallery_images, "order", published)
VALUES (
  gen_random_uuid(),
  'Del Carmen Solid Waste Management & Pyrolysis Facility',
  'del-carmen',
  'Del Carmen, Siargao Island, Surigao del Norte',
  'planning',
  '/images/projects/del-carmen-hero.jpg',
  'JCA 1221''s first solid waste management project — introducing pyrolysis technology to Siargao, converting municipal waste into biochar and clean energy while preserving the island''s world-famous ecosystem.',
  'Pyrolysis-based solid waste management plant converting municipal waste into biochar and syngas — the first of its kind on Siargao Island.',
  'JCA 1221''s first solid waste management project — introducing pyrolysis technology to Siargao, converting municipal waste into biochar and clean energy while preserving the island''s world-famous ecosystem.',
  '[
    {"label": "Design Throughput", "value": "15 tons/day"},
    {"label": "Technology", "value": "Pyrolysis + Biochar Production"},
    {"label": "Est. Project Cost", "value": "PHP 320M"},
    {"label": "Est. Communities Served", "value": "40,000+"}
  ]'::jsonb,
  '{
    "description": "The Del Carmen facility marks JCA 1221''s expansion from water into solid waste. The pyrolysis plant uses thermal decomposition in an oxygen-free environment to convert municipal solid waste into three products: biochar (a soil amendment that sequesters carbon), syngas (used to power the facility itself), and recovered materials. Unlike incineration, pyrolysis produces no toxic emissions. The biochar can be used by local farmers to improve soil fertility, creating a circular economy loop — waste from the community becomes a resource for the community.",
    "tags": ["Pyrolysis", "Biochar Production", "Syngas Energy Recovery", "Zero Toxic Emissions", "Circular Economy", "Solid Waste Management"]
  }'::jsonb,
  '[
    {"label": "Waste diversion", "value": "15 tons/day", "improvement": "Diverted from landfill and open dumping on Siargao"},
    {"label": "Biochar production", "value": "~3 tons/day", "improvement": "Available to local farmers as carbon-sequestering soil amendment"},
    {"label": "Energy self-sufficiency", "value": "100%", "improvement": "Facility powered by its own syngas output"},
    {"label": "Carbon sequestration potential", "value": "~1,000 tons CO₂/year", "improvement": "Through biochar soil application"}
  ]'::jsonb,
  null,
  null,
  ARRAY['/images/projects/del-carmen-1.jpg', '/images/projects/del-carmen-2.jpg', '/images/projects/del-carmen-3.jpg'],
  3,
  true
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- PROJECT AWARDS (source: projects-and-track-record/data.json awards arrays)
-- ============================================================================

-- Puerto Princesa – Asian Water Award 2025 (two different award name variants in data; use the one from the project detail)
INSERT INTO project_awards (id, project_id, title, organization, year, description)
SELECT gen_random_uuid(), p.id, 'Water Reclamation Project of the Year', 'Asian Water Awards', 2025,
       'Recognized for restoring coastal ecosystems through innovative, scalable treatment technology — the first Philippine facility to win this category.'
FROM projects p
WHERE p.slug = 'puerto-princesa'
  AND NOT EXISTS (SELECT 1 FROM project_awards pa WHERE pa.project_id = p.id AND pa.title = 'Water Reclamation Project of the Year');

-- ============================================================================
-- NEWS ARTICLES (source: product/sections/news/data.json)
-- ============================================================================

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Gov. Pam Eyes Siargao Model to Strengthen Cebu Solid Waste Management', 'Cebu Provincial Government', '2026-03-05'::date,
       'Cebu Governor Pamela Baricuatro is exploring a waste-to-fuel solution modeled after Siargao''s solid waste treatment plant in Del Carmen. She invited JCA 1221 Holdings CEO Jehremiah Asis to present at the Cebu Waste Management Summit, seeking mayors'' approval to pilot the modular pyrolysis system across tourist-heavy and coastal districts.',
       'https://cebuprovince.org/9466/gov-pam-eyes-siargao-model-to-strengthen-cebu-solid-waste-management/',
       'expansion', ARRAY['Cebu', 'Siargao Model', 'Pyrolysis', 'Solid Waste', 'Gov. Baricuatro'], 'media-coverage', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://cebuprovince.org/9466/gov-pam-eyes-siargao-model-to-strengthen-cebu-solid-waste-management/');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Waste-to-Fuel Plant Eyed', 'SunStar Cebu', '2026-03-27'::date,
       'The Siargao pyrolysis plant processes up to five tons of solid waste daily, transforming it into fuel that powers the facility itself. Unlike conventional waste-to-energy plants that require lengthy construction, JCA 1221''s modular approach allows rapid deployment — attracting interest from Cebu as a template for district-level waste management.',
       'https://www.sunstar.com.ph/cebu/waste-to-fuel-plant-eyed',
       'expansion', ARRAY['Siargao', 'Pyrolysis', 'Waste-to-Fuel', 'Modular'], 'media-coverage', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://www.sunstar.com.ph/cebu/waste-to-fuel-plant-eyed');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Baricuatro Eyes Siargao''s Success to Solve Cebu''s Waste Crisis', 'Politiko Visayas', '2026-03-03'::date,
       'The Siargao facility converts waste from five neighboring towns into diesel fuel through a modular pyrolysis system. Cebu Governor Baricuatro sees it as a model for solving the province''s waste crisis, preferring district-level upcycling over landfill expansion.',
       'https://visayas.politiko.com.ph/2026/03/03/baricuatro-eyes-siargaos-success-to-solve-cebus-waste-crisis/daily-feed/',
       'expansion', ARRAY['Cebu', 'Siargao', 'Pyrolysis', 'Policy'], 'media-coverage', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://visayas.politiko.com.ph/2026/03/03/baricuatro-eyes-siargaos-success-to-solve-cebus-waste-crisis/daily-feed/');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Philippines Wins Big at the 2025 Asian Water Awards', 'PhilStar Tech', '2025-10-27'::date,
       'JCA 1221''s Puerto Princesa Water Reclamation and Learning Center won Water Quality Improvement Project of the Year at the 2025 Asian Water Awards in Kuala Lumpur. The facility — the Philippines'' first combined septage and sewage treatment plant — was recognized for restoring coastal ecosystems and enabling international events to return to Puerto Princesa Bay.',
       'https://philstartech.com/events/2025/10/27/15510/philippines-wins-big-at-the-2025-asian-water-awards/',
       'awards', ARRAY['Asian Water Awards', 'Puerto Princesa', 'Water Quality'], 'award', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://philstartech.com/events/2025/10/27/15510/philippines-wins-big-at-the-2025-asian-water-awards/');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Puerto Princesa''s Green Breakthrough: Philippine Water Facility Wins Top Honor for Restoring Coastal Ecosystems', 'Manila Bulletin', '2025-11-03'::date,
       'In-depth feature on the Puerto Princesa Water Reclamation and Learning Center, detailing how a public-private partnership among JCA 1221 Holdings, Vivant Hydro Holdings, and the Puerto Princesa City government prevented 4,000 cubic meters of daily untreated wastewater from reaching the bay.',
       'https://mb.com.ph/2025/11/03/puerto-princesas-green-breakthrough-philippine-water-facility-wins-top-honor-for-restoring-coastal-ecosystems',
       'projects', ARRAY['Puerto Princesa', 'Asian Water Awards', 'PPP', 'Coastal Restoration'], 'feature', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://mb.com.ph/2025/11/03/puerto-princesas-green-breakthrough-philippine-water-facility-wins-top-honor-for-restoring-coastal-ecosystems');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'This Lawyer Harnessed Technology to Make Our Waters Cleaner, One Island at a Time', 'PhilStar Tech', '2025-10-20'::date,
       'Profile of Jehremiah Asis — from Philippine Science High School and UP law to corporate project finance, a near-fatal car accident, and an aquarium hobby that sparked a new approach to wastewater treatment. Covers JCA 1221''s IoT sensors, solar-assisted UV disinfection, AI-assisted diagnostics, and expansion across the Philippines.',
       'https://philstartech.com/enterprise/2025/10/20/15367/this-lawyer-harnessed-technology-to-make-our-waters-cleaner-one-island-at-a-time/',
       'media', ARRAY['Jehremiah Asis', 'Founder Profile', 'IoT', 'Technology'], 'feature', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://philstartech.com/enterprise/2025/10/20/15367/this-lawyer-harnessed-technology-to-make-our-waters-cleaner-one-island-at-a-time/');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'JCA CEO: ₱100 Billion Lost to Corruption Could Fund Wastewater Treatment for Every Philippine City', 'LinkedIn / Cathy Yap-Yang', '2025-10-15'::date,
       'JCA 1221 CEO Jehremiah Asis speaks out on the cost of corruption in Philippine infrastructure, noting that funds lost to graft could have fully treated wastewater for every city in the country. Reinforces JCA 1221''s positioning as an integrity-first infrastructure partner.',
       'https://www.linkedin.com/posts/cathyyapyang_jehremiah-asis-ceo-of-jca-1221-holdings-activity-7395015702312583168-3Va3',
       'policy', ARRAY['Integrity', 'Anti-Corruption', 'Infrastructure', 'Policy'], 'media-coverage', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://www.linkedin.com/posts/cathyyapyang_jehremiah-asis-ceo-of-jca-1221-holdings-activity-7395015702312583168-3Va3');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Puerto Princesa Opens Water Treatment Plant', 'Manila Standard', '2024-12-15'::date,
       'The Puerto Princesa Water Reclamation and Learning Center officially commenced operations, marking the Philippines'' first combined septage and sewage treatment facility. The plant charges the lowest septage fee among highly urbanized Philippine cities.',
       'https://manilastandard.net/?p=314214204',
       'projects', ARRAY['Puerto Princesa', 'Operations', 'Commissioning'], 'media-coverage', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://manilastandard.net/?p=314214204');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Sewerage and Septage Treatment Plant to Reduce Pollution in Puerto Bay', 'Palawan News', '2024-12-10'::date,
       'Local coverage of the Puerto Princesa facility''s environmental impact, detailing how the plant would prevent up to 4,000 cubic meters of daily wastewater from reaching Puerto Princesa Bay and restore marine habitats.',
       'https://palawan-news.com/sewerage-and-septage-treatment-plant-to-reduce-pollution-in-puerto-bay/',
       'projects', ARRAY['Puerto Princesa', 'Bay Restoration', 'Marine Life'], 'media-coverage', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://palawan-news.com/sewerage-and-septage-treatment-plant-to-reduce-pollution-in-puerto-bay/');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Sanitation Project to Address Siargao''s Sewage Problem', 'Philippine Daily Inquirer', '2023-09-20'::date,
       'The Del Carmen, Siargao septage and sanitation project — led by JCA 1221 with local government backing — aims to address the island''s growing sewage problem driven by tourism expansion. The facility combines wastewater treatment with solid waste management, creating a comprehensive environmental solution for one of the Philippines'' most iconic island destinations.',
       'https://newsinfo.inquirer.net/1792867/sanitation-project-to-address-siargaos-sewage-problem',
       'expansion', ARRAY['Siargao', 'Septage', 'Sanitation', 'Tourism'], 'media-coverage', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://newsinfo.inquirer.net/1792867/sanitation-project-to-address-siargaos-sewage-problem');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Asian Water Awards 2025 Winner: Jehremiah C. Asis of Puerto Princesa', 'Asian Water Awards (Vimeo)', '2025-10-25'::date,
       'Video feature on Jehremiah Asis accepting the Water Quality Improvement Project of the Year award at the 2025 Asian Water Awards ceremony in Kuala Lumpur. Includes facility footage and on-site interview.',
       'https://vimeo.com/1146796447',
       'awards', ARRAY['Asian Water Awards', 'Video', 'Jehremiah Asis'], 'award', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://vimeo.com/1146796447');

INSERT INTO news_articles (id, title, source, date, excerpt, url, category, tags, type, published)
SELECT gen_random_uuid(), 'Asis: Innovation Key to Capital, Operation-Efficient Water Projects', 'One News PH', '2025-10-22'::date,
       'Television interview with Jehremiah Asis on One News PH, discussing how JCA 1221''s technology combines nature-mimicking biological treatment with IoT monitoring and solar power to deliver affordable wastewater infrastructure to Philippine communities.',
       'https://www.youtube.com/watch?v=5fBdnE5UQdI',
       'media', ARRAY['TV Interview', 'Innovation', 'IoT', 'Affordability'], 'media-coverage', true
WHERE NOT EXISTS (SELECT 1 FROM news_articles WHERE url = 'https://www.youtube.com/watch?v=5fBdnE5UQdI');

-- ============================================================================
-- TEAM MEMBERS (source: product/sections/team/data.json)
-- ============================================================================

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(), 'Jehremiah C. Asis', 'Founder & CEO', 'Atty.',
       '/images/team/jehri-asis.jpg',
       'Former corporate lawyer who pivoted to environmental infrastructure after a near-fatal car accident reframed his purpose. Conceptualized and led the Puerto Princesa Water Reclamation and Learning Center — the Philippines'' first combined septage and sewage treatment facility. Combines project finance expertise with a deep technical understanding of biological treatment processes, drawn from years of aquarium science.',
       'Pollution is the same whether it happens in an urban center or a remote barangay. That''s why we go where others won''t.',
       ARRAY['Public-Private Partnerships', 'Project Finance Law', 'Biological Treatment Systems', 'Environmental Policy'],
       '[{"type": "email", "label": "jhasis@jca1221.com", "url": "mailto:jhasis@jca1221.com"}, {"type": "linkedin", "label": "LinkedIn", "url": "https://linkedin.com/in/jehremiah-asis"}]'::jsonb,
       1, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Jehremiah C. Asis' AND role = 'Founder & CEO');

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(), 'Maria Clara Santos', 'Head of Government Partnerships', null,
       null,
       '15 years of experience in Philippine local government administration and public-private partnership negotiations. Previously served as Assistant City Administrator for a highly urbanized Visayan city, where she led the procurement and contracting of the city''s first sanitary landfill and recycling program. Bridges the gap between JCA 1221''s technical capabilities and the procurement realities facing LGUs.',
       null,
       ARRAY['LGU Procurement', 'PPP Contract Negotiation', 'RA 11966 Compliance', 'Stakeholder Engagement'],
       '[{"type": "email", "label": "mc.santos@jca1221.com", "url": "mailto:mc.santos@jca1221.com"}]'::jsonb,
       2, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Maria Clara Santos' AND role = 'Head of Government Partnerships');

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(), 'Antonio C. Reyes', 'Director of Investor Relations', null,
       null,
       'Chartered Financial Analyst with a decade of infrastructure investment experience across Southeast Asia. Former investment officer at a multilateral development bank, where he structured blended finance facilities for water and sanitation projects in Cambodia and Indonesia. Leads JCA 1221''s capital raising, financial modeling, and investor due diligence processes.',
       null,
       ARRAY['Infrastructure Finance', 'Blended Finance', 'ESG Investment', 'Financial Modeling'],
       '[{"type": "email", "label": "a.reyes@jca1221.com", "url": "mailto:a.reyes@jca1221.com"}]'::jsonb,
       3, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Antonio C. Reyes' AND role = 'Director of Investor Relations');

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(), 'Elena R. Cruz', 'Chief Technology Officer', 'P.E., M.Sc. Environmental Engineering',
       null,
       'Licensed environmental engineer with specialization in biological nutrient removal and constructed wetland design. Previously led process engineering for a Singapore-based water technology firm, deploying modular treatment systems across 12 sites in Southeast Asia. Designed the four-stage treatment configuration that underpins JCA 1221''s ieSSTP technology — combining SBR biological treatment, reed bed filtration, and solar-assisted UV disinfection into a single integrated system.',
       null,
       ARRAY['Biological Nutrient Removal', 'Modular Treatment Design', 'IoT Process Monitoring', 'Constructed Wetlands'],
       '[{"type": "email", "label": "e.cruz@jca1221.com", "url": "mailto:e.cruz@jca1221.com"}]'::jsonb,
       4, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Elena R. Cruz' AND role = 'Chief Technology Officer');

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(), 'Rafael T. Mendoza', 'Head of Operations, Puerto Princesa', null,
       null,
       'Palawan native who joined JCA 1221 during the Puerto Princesa facility''s commissioning phase. Manages day-to-day operations of the 4,000 m³/day treatment plant, overseeing a team of 50+ local operators and technicians. Certified wastewater treatment plant operator with hands-on expertise in SBR process control, laboratory analysis, and IoT-based remote monitoring. Led the facility through Typhoon Odette, ensuring uninterrupted recycled water supply to affected communities.',
       null,
       ARRAY['SBR Process Control', 'Plant Operations', 'Water Quality Lab Analysis', 'Disaster Resilience'],
       '[{"type": "email", "label": "r.mendoza@jca1221.com", "url": "mailto:r.mendoza@jca1221.com"}]'::jsonb,
       5, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Rafael T. Mendoza' AND role = 'Head of Operations, Puerto Princesa');

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(), 'Sofia L. Tan', 'Solid Waste Program Lead', 'M.Sc. Environmental Science',
       null,
       'Environmental scientist specializing in pyrolysis technology and circular economy systems for island communities. Previously consulted for the Philippine Reef and Rainforest Conservation Foundation on solid waste interventions in coastal tourism destinations. Leading JCA 1221''s expansion into solid waste management — from the Del Carmen, Siargao pyrolysis facility to the Cebu provincial waste management study.',
       null,
       ARRAY['Pyrolysis Technology', 'Circular Economy', 'Island Waste Management', 'Community-Based Systems'],
       '[{"type": "email", "label": "s.tan@jca1221.com", "url": "mailto:s.tan@jca1221.com"}]'::jsonb,
       6, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Sofia L. Tan' AND role = 'Solid Waste Program Lead');

-- ============================================================================
-- PARTNERS (consolidated from projects-and-track-record/data.json project partners
--           and contact-and-partnerships/data.json partnerLogos, deduplicated)
-- ============================================================================
-- Note: project_ids is NULL because UUIDs are generated at insert time.
-- Admin users can link projects via the admin panel after seeding.

INSERT INTO partners (id, name, type, logo, website_url, project_ids, published)
SELECT gen_random_uuid(), 'Puerto Princesa City Government', 'LGU',
       '/images/partners/puerto-princesa-lgu.png', null, '{}', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Puerto Princesa City Government');

INSERT INTO partners (id, name, type, logo, website_url, project_ids, published)
SELECT gen_random_uuid(), 'Department of Environment and Natural Resources', 'national_agency',
       '/images/partners/denr.svg', null, '{}', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Department of Environment and Natural Resources');

INSERT INTO partners (id, name, type, logo, website_url, project_ids, published)
SELECT gen_random_uuid(), 'Palawan Council for Sustainable Development', 'regulatory',
       null, null, '{}', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Palawan Council for Sustainable Development');

INSERT INTO partners (id, name, type, logo, website_url, project_ids, published)
SELECT gen_random_uuid(), 'Gingoog City Government', 'LGU',
       '/images/partners/gingoog-lgu.png', null, '{}', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Gingoog City Government');

INSERT INTO partners (id, name, type, logo, website_url, project_ids, published)
SELECT gen_random_uuid(), 'Department of Public Works and Highways', 'national_agency',
       null, null, '{}', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Department of Public Works and Highways');

INSERT INTO partners (id, name, type, logo, website_url, project_ids, published)
SELECT gen_random_uuid(), 'Municipality of Del Carmen', 'LGU',
       '/images/partners/del-carmen-lgu.png', null, '{}', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Municipality of Del Carmen');

INSERT INTO partners (id, name, type, logo, website_url, project_ids, published)
SELECT gen_random_uuid(), 'Siargao Environmental Council', 'community',
       null, null, '{}', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Siargao Environmental Council');

INSERT INTO partners (id, name, type, logo, website_url, project_ids, published)
SELECT gen_random_uuid(), 'Asian Water Council', 'private_sector',
       '/images/partners/asian-water-council.png', null, '{}', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Asian Water Council');

INSERT INTO partners (id, name, type, logo, website_url, project_ids, published)
SELECT gen_random_uuid(), 'Tourism Infrastructure and Enterprise Zone Authority', 'national_agency',
       '/images/partners/tieza.svg', null, '{}', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE name = 'Tourism Infrastructure and Enterprise Zone Authority');

-- ============================================================================
-- PAGE CONTENT (source: product/sections/about-and-mission/data.json,
--               product/sections/home/data.json)
-- ============================================================================

-- Home page — impact stats
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'home', 'hero', 'impact_stats',
  '[
    {"number": 4000, "suffix": "m³", "label": "Wastewater treated daily", "description": "Kept out of Puerto Princesa Bay every single day since 2022"},
    {"number": 3, "suffix": "", "label": "Active project sites", "description": "Across Palawan, Mindanao, and Siargao Island"},
    {"number": 1, "suffix": "st", "label": "Asian Water Award", "description": "Water Quality Improvement Project of the Year 2025"},
    {"number": 2, "suffix": "", "label": "International events restored", "description": "Ironman and Dragon Boat races returned to Puerto Princesa Bay"}
  ]'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Home page — mission values
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'home', 'mission', 'values',
  '[
    {"title": "Serbisyo, Hindi Negosyo", "description": "Service, not business. We temper profitability to keep environmental services affordable for every community — because pollution doesn''t discriminate between urban centers and remote barangays.", "icon": "HeartHandshake"},
    {"title": "Full Transparency", "description": "Complete transparency in every engagement. Our projects run with real-time monitoring data available to partners, government units, and the public.", "icon": "ShieldCheck"},
    {"title": "Integrity in Every Project", "description": "Every facility we build is delivered on time, on scope, and with measurable environmental outcomes. Our track record speaks through restored ecosystems and communities that thrive.", "icon": "Scale"},
    {"title": "Environmental Stewardship", "description": "Our machines enhance natural treatment processes instead of replacing them — lower power use, fewer chemicals, and less impact. We work with nature, not against it.", "icon": "Leaf"}
  ]'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Home page — expansion initiatives
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'home', 'expansion', 'initiatives',
  '[
    {"location": "Siargao Island", "title": "Pyrolysis — Waste to Fuel", "description": "Introducing solid waste management through pyrolysis technology that converts non-recyclable waste into usable fuel. Combined with our wastewater treatment, this creates the first fully integrated environmental facility for a Philippine island tourism destination.", "status": "In Development", "image": "/images/expansion/siargao-pyrolysis.jpg"},
    {"location": "Cebu Province", "title": "Provincial-Scale Waste Management", "description": "The Cebu Provincial Government is studying the Siargao model as a template for solving Cebu''s solid waste crisis — validating JCA 1221''s approach as the blueprint for island-based environmental infrastructure across the Philippines.", "status": "Planning & Assessment", "image": "/images/expansion/cebu-planning.jpg"}
  ]'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- About page — founder letter
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'about', 'founder', 'letter',
  '"I spent the first part of my career in corporate law — structuring project finance, negotiating deals, working the long hours that come with complex transactions. I was precise, analytical, and good at what I did. But after a near-fatal car accident, I found myself asking a question I couldn''t ignore: ''What was I really meant to do?'' The answer came from an unexpected place — my aquarium hobby. The nitrogen cycle that keeps a tank alive is the same process that can clean entire watersheds. Nature already knows how to purify water. It just needs the right infrastructure and the right people to make it happen. That''s why JCA 1221 exists. We build environmental infrastructure that mimics natural processes — no heavy chemicals, no energy-intensive brute force, just biology guided by engineering. We go where others won''t: small island communities, remote barangays, places where the business case isn''t obvious but the environmental need is desperate. Our motto is ''Serbisyo, Hindi Negosyo'' — Service, Not Business. That doesn''t mean we don''t care about sustainability. It means we measure success not just in revenue, but in cubic meters of water cleaned, in bays restored, in communities that can finally see through their coastline. If you are looking for a partner committed to doing the job right — with full transparency and accountability — whether you represent a municipality, an agency, or an investor who wants returns with real environmental impact — we should talk. — Jehremiah C. Asis, Founder & CEO"'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- About page — founder profile
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'about', 'founder', 'profile',
  '{
    "name": "Jehremiah C. Asis",
    "role": "Founder & CEO, JCA 1221 Holdings Inc.",
    "photo": "/images/team/jehri-asis.jpg",
    "signatureQuote": "If people can''t afford to clean polluted water, the environment will continue to suffer. That''s why we go where others won''t.",
    "quotes": [
      {"text": "Pollution is the same whether it happens in an urban center or a remote barangay. The water doesn''t care about jurisdiction.", "context": "On why JCA 1221 works in underserved communities"},
      {"text": "I''m not an environmentalist by training. I''m a corporate lawyer who discovered that the nitrogen cycle in his aquarium could clean a bay.", "context": "On his unconventional path to environmental infrastructure"},
      {"text": "Integrity is our foundation. It''s the reason we can look every community leader in the eye and promise that their project will be done right.", "context": "On integrity as competitive advantage"}
    ],
    "milestones": [
      {"year": 2015, "title": "Corporate Law Career", "description": "Practiced project finance law in Manila, structuring complex transactions and developing the financial discipline that would later underpin JCA 1221''s public-private partnership model."},
      {"year": 2017, "title": "The Turning Point", "description": "A near-fatal car accident prompted a period of deep reflection, shifting focus from corporate practice toward environmental infrastructure and public service."},
      {"year": 2019, "title": "JCA 1221 Founded", "description": "Established JCA 1221 Holdings with the mission of bringing affordable, nature-mimicking wastewater treatment to Philippine communities — starting with the places others overlooked."},
      {"year": 2022, "title": "Puerto Princesa Breakthrough", "description": "Led the development of the Philippines'' first city-scale combined septage and sewage treatment facility, now preventing 4,000 cubic meters of untreated wastewater from reaching the bay daily."},
      {"year": 2025, "title": "Asian Water Award & Expansion", "description": "Puerto Princesa facility won the 2025 Asian Water Award for Water Reclamation Project of the Year. Launched expansion to Gingoog City and Del Carmen, Siargao with pyrolysis-based solid waste management."}
    ]
  }'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- About page — value pillars
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'about', 'values', 'pillars',
  '[
    {
      "id": "integrity",
      "title": "Integrity in Every Project",
      "icon": "ShieldCheck",
      "sectionColor": "amber",
      "glassTint": "amber",
      "description": "Integrity isn''t a marketing angle — it''s the foundation of every project we build. When a project must be done right — on time, on budget, to spec — our commitment to doing it properly is our strongest advantage.",
      "subPoints": [
        {"title": "Full transparency in procurement", "description": "Every contract, every supplier, every cost is documented and auditable. Government partners and investors get complete visibility into where their money goes at every stage."},
        {"title": "Community-first accountability", "description": "We don''t just report to government agencies. We answer to the communities whose water we clean, whose bays we restore, and whose trust we earn project by project."},
        {"title": "Ethical procurement, auditable end-to-end", "description": "Strict ethical procurement policies apply across all projects, vendors, and subcontractors. Every transaction is documented and auditable — giving partners full confidence in every peso spent."}
      ]
    },
    {
      "id": "circular-economy",
      "title": "Waste Is a Resource, Not an Endpoint",
      "icon": "RefreshCw",
      "sectionColor": "emerald",
      "glassTint": "emerald",
      "description": "Nature doesn''t produce waste — everything cycles. Our treatment systems follow the same principle: wastewater becomes clean water, solid waste becomes energy, and what was once pollution becomes productive.",
      "subPoints": [
        {"title": "Biological treatment mimics nature", "description": "Our systems use the same nitrogen cycle found in healthy aquatic ecosystems. Microorganisms do the heavy lifting — no harsh chemicals, no energy-intensive brute force."},
        {"title": "Recycled water returns to the ecosystem", "description": "The Puerto Princesa facility releases 4,000 cubic meters of treated water daily back into the bay, diluting other outflows and restoring marine habitats that now host Ironman and dragon boat events."},
        {"title": "Pyrolysis transforms solid waste into energy", "description": "Our Siargao expansion converts municipal solid waste into biochar and syngas through thermal decomposition — turning a pollution crisis into a clean energy source."}
      ]
    },
    {
      "id": "service-over-profit",
      "title": "Serbisyo, Hindi Negosyo",
      "icon": "HeartHandshake",
      "sectionColor": "blue",
      "glassTint": "blue",
      "description": "Service, Not Business. We are profitable and financially sustainable — but profit is the engine, not the destination. Our pricing model ensures communities can afford clean water, because environmental protection can''t depend on wealth.",
      "subPoints": [
        {"title": "Affordable for communities", "description": "Treatment fees structured so that even small municipalities and island communities can access world-class environmental infrastructure without crippling their budgets."},
        {"title": "Public-private partnership expertise", "description": "We navigate the legal, financial, and regulatory complexity of PPPs so that local governments get infrastructure that works — with transparent governance and clear accountability at every stage."},
        {"title": "Knowledge transfer, not dependency", "description": "Every facility includes a Learning Center component. We train local operators, share technical knowledge, and build capacity so communities own their environmental future."}
      ]
    },
    {
      "id": "track-record",
      "title": "Proven Results, Not Promises",
      "icon": "Trophy",
      "sectionColor": "slate",
      "glassTint": "amber",
      "description": "We don''t ask for trust — we earn it with every project delivered. From the award-winning Puerto Princesa facility to our growing pipeline across the Philippines, our track record speaks louder than any pitch deck.",
      "subPoints": [
        {"title": "2025 Asian Water Award", "description": "Water Reclamation Project of the Year — recognized internationally for restoring coastal ecosystems through innovative, scalable treatment technology."},
        {"title": "Puerto Princesa Bay rehabilitation", "description": "The bay, once too polluted for recreation, now hosts international Ironman triathlons and dragon boat races. Water quality is monitored, verified, and publicly transparent."},
        {"title": "Scaling to new communities", "description": "Active projects in Gingoog City (Mindanao), Del Carmen (Siargao), and a pipeline of 5+ municipalities in assessment — each with the same integrity-first, nature-first approach."}
      ]
    }
  ]'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Contact page — form configuration
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'contact', 'form', 'config',
  '{
    "sectionTitle": "Let''s Build Together",
    "sectionSubtitle": "Partner with JCA 1221 to bring world-class environmental infrastructure to your community. Serious inquiries only.",
    "basicFields": [
      {"name": "fullName", "label": "Full Name", "type": "text", "required": true, "placeholder": "Juan dela Cruz"},
      {"name": "email", "label": "Email Address", "type": "email", "required": true, "placeholder": "juan@lgu.gov.ph"},
      {"name": "organization", "label": "Organization / LGU", "type": "text", "required": true, "placeholder": "Municipality of Taytay"},
      {"name": "message", "label": "What would you like to discuss?", "type": "textarea", "required": true, "placeholder": "Tell us about your community''s environmental infrastructure needs..."}
    ],
    "detailedFields": [
      {"name": "phone", "label": "Phone Number", "type": "tel", "required": false, "placeholder": "+63 912 345 6789"},
      {"name": "role", "label": "Your Role", "type": "text", "required": false, "placeholder": "Municipal Planning Officer, Investor, etc."},
      {"name": "projectType", "label": "Project Type", "type": "select", "required": false, "placeholder": "Select a project type"},
      {"name": "estimatedTimeline", "label": "Estimated Timeline", "type": "select", "required": false, "placeholder": "When are you looking to start?"}
    ],
    "submitButtonText": "Send Inquiry",
    "detailedToggleText": "Add more details (helps us prepare)",
    "successMessage": {
      "title": "Thank you for reaching out.",
      "body": "Our partnerships team reviews every inquiry within 2 business days. For urgent matters, call us directly at +63 2 8123 4567.",
      "nextSteps": [
        "Check your email for a confirmation and our capability statement",
        "A team member will contact you within 48 hours",
        "In the meantime, explore our project portfolio"
      ]
    }
  }'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Contact page — inquiry types
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'contact', 'form', 'inquiry_types',
  '[
    {"value": "wastewater-treatment", "label": "Wastewater Treatment Facility"},
    {"value": "solid-waste", "label": "Solid Waste Management"},
    {"value": "septage-management", "label": "Septage Management Program"},
    {"value": "learning-center", "label": "Environmental Learning Center"},
    {"value": "partnership", "label": "Investment Partnership"},
    {"value": "other", "label": "Other"}
  ]'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Contact page — timeline options
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'contact', 'form', 'timeline_options',
  '[
    {"value": "immediate", "label": "As soon as possible"},
    {"value": "3-months", "label": "Within 3 months"},
    {"value": "6-months", "label": "Within 6 months"},
    {"value": "1-year", "label": "Within the year"},
    {"value": "exploratory", "label": "Exploratory — no set timeline"}
  ]'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Contact page — office info
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'contact', 'office', 'info',
  '{
    "address": "Unit 2808, 28th Floor, The Peak Tower, 107 Leviste Street, Salcedo Village",
    "city": "Makati City, Metro Manila 1227",
    "phone": "+63 2 8123 4567",
    "email": "partnerships@jca1221.com",
    "mapEmbedUrl": "https://maps.google.com/?q=The+Peak+Tower+Makati",
    "hoursNote": "Monday–Friday, 9:00 AM – 6:00 PM PHT"
  }'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Contact page — downloadable resource
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'contact', 'resources', 'capability_statement',
  '{
    "title": "JCA 1221 Capability Statement",
    "description": "Download our full corporate profile including project case studies, technical specifications, partnership models, and financial projections.",
    "fileName": "JCA1221-Capability-Statement-2026.pdf",
    "fileSize": "4.2 MB",
    "fileUrl": "/downloads/capability-statement.pdf"
  }'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Contact page — scheduling info
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'contact', 'cta', 'scheduling',
  '{
    "title": "Schedule a Consultation",
    "description": "Book a 30-minute video call with our partnerships team. We''ll review your community''s needs and outline how JCA 1221''s model can work for you.",
    "ctaText": "Book a Call",
    "calendarUrl": "https://calendly.com/jca1221/partnership-consultation"
  }'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Home page — hero content
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'home', 'hero', 'content',
  '{
    "siteName": "JCA 1221 Holdings",
    "tagline": "Earth Renewal for Generations",
    "description": "Philippine environmental infrastructure — restoring coastal ecosystems through nature-mimicking technology and public-private partnerships.",
    "backgroundImage": "/images/hero-water.jpg",
    "ctaLabel": "Our Projects",
    "ctaHref": "#projects"
  }'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;

-- Contact page — team contacts
INSERT INTO page_content (id, page, section, key, value, published)
VALUES (
  gen_random_uuid(), 'contact', 'team', 'contacts',
  '[
    {
      "id": "jehremiah",
      "name": "Atty. Jehremiah Asis",
      "title": "Founder & Chairman",
      "email": "jhasis@jca1221.com",
      "phone": "+63 2 8123 4567",
      "inquiryCategories": ["Investment Partnerships", "Strategic Direction"],
      "imageUrl": "/images/team/jehremiah-asis.png"
    },
    {
      "id": "partnerships",
      "name": "Maria Clara Santos",
      "title": "Head of Government Partnerships",
      "email": "mc.santos@jca1221.com",
      "phone": "+63 2 8123 4568",
      "inquiryCategories": ["LGU Partnerships", "National Government Agency Inquiries"]
    },
    {
      "id": "investors",
      "name": "Antonio Reyes",
      "title": "Investor Relations Director",
      "email": "a.reyes@jca1221.com",
      "phone": "+63 2 8123 4569",
      "inquiryCategories": ["Investment Partnerships", "Due Diligence"]
    }
  ]'::jsonb, true
)
ON CONFLICT (page, section, key) DO NOTHING;
