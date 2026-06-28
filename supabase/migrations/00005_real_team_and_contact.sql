-- ============================================================================
-- Real team members + corrected contact info
-- Source: Slack #website channel (2026-06-11)
-- Uses dollar-quoting for all long strings to avoid keyword collisions.
-- ============================================================================

-- ============================================================================
-- TEAM MEMBERS — update Jehremiah (role + bio)
-- ============================================================================

UPDATE team_members
SET
  role  = 'Founder & President',
  bio   = $$Jehremiah is a pioneer in Philippine environmental sustainability, specializing in inventive, context-based solutions for municipal wastewater, water supply, and solid waste management. A UP Law alumnus, he co-founded Abuda Asis & Associates, a top-ranked infrastructure and energy law firm, and has served as a PPP consultant for the Asian Development Bank. In 2021, through JCA 1221, he launched the landmark Puerto Princesa Sanitation Project - the country's first city-scale PPP integrating septage and sewage treatment, which won the Asian Water Improvement Project of the Year 2025. Under his leadership, JCA 1221 currently supports multiple local governments with sustainable utility infrastructure.$$,
  links = '[{"type": "linkedin", "label": "LinkedIn", "url": "https://linkedin.com/in/jehremiah-asis"}]'::jsonb,
  "order" = 1
WHERE name = 'Jehremiah C. Asis';

-- ============================================================================
-- TEAM MEMBERS — insert real members (idempotent)
-- ============================================================================

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(),
       'Odysseus C. Alfon',
       'Chief Technical Officer',
       'Chem. Engr.',
       null,
       $$Odysseus is an accomplished Chemical Engineer with extensive experience delivering high-impact water, wastewater, and infrastructure projects across Asia, the Middle East, and North Africa. His career highlights include quality assurance work on Libya's Great Man-Made River Project - one of the world's largest water engineering systems - and leading process optimization in Saudi Arabia. In the Philippines, he drives the technical leadership, master planning, design, and commissioning of sewage treatment plants, bulk water facilities, and zero-waste systems for JCA 1221 and major utility developers.$$,
       null,
       ARRAY['Water & Wastewater Engineering', 'Process Optimization', 'Infrastructure Design', 'Zero-Waste Systems'],
       '[]'::jsonb,
       2, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Odysseus C. Alfon');

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(),
       'Constantine A. Doncila',
       'Chief Legal Officer',
       'Atty.',
       null,
       $$Constantine is an attorney specializing in project finance, public-private partnerships (PPPs), and energy regulation. As Chief Legal Officer for JCA 1221, he oversees contract documentation, EPC contracting, and regulatory compliance for the company's multi-sector infrastructure portfolio. He previously assisted in multi-billion-peso loan transactions in Abuda Asis and Associates and handled the development and financing of major transport, power, and airport PPPs at Prime Asset Ventures Inc. Constantine graduated cum laude from UP Diliman and passed the Philippine Bar with Exemplary Distinction.$$,
       null,
       ARRAY['Project Finance Law', 'PPP Contract Negotiation', 'EPC Contracting', 'Regulatory Compliance'],
       '[{"type": "linkedin", "label": "LinkedIn", "url": "https://linkedin.com/in/cadoncila"}]'::jsonb,
       3, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Constantine A. Doncila');

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(),
       'Zara C. See',
       'CFO & COO',
       null,
       null,
       $$Zara is a financial modeler and operational strategist dedicated to sustainable infrastructure. She builds bankable financial models for wastewater, solid-waste, and circular-economy systems, bridging funding structures with operational viability. Her background includes developing proprietary PFRS 9 financial reporting calculators for PwC Philippines (Isla Lipana & Co.). Driven by community impact, Zara also leads JCA 1221's social initiatives, including the LISC Digital Growth Accelerator and Siklab, an award-winning waste-to-energy optimization concept.$$,
       null,
       ARRAY['Financial Modeling', 'Operations Strategy', 'Sustainable Infrastructure Finance', 'Social Enterprise'],
       '[]'::jsonb,
       4, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Zara C. See');

INSERT INTO team_members (id, name, role, credentials, photo, bio, quote, expertise, links, "order", published)
SELECT gen_random_uuid(),
       'Katherine F. Asis',
       'Chief CSR Officer',
       null,
       null,
       $$Katherine translates academic and artistic excellence into transformative community advocacy. A valedictorian graduate of both the Philippine High School for the Arts and the University of the Philippines (summa cum laude), she was recognized as one of the Ten Outstanding Students of the Philippines. At JCA 1221, she heads the Corporate Social Responsibility (CSR) program, balancing her corporate impact with her roles as a music missionary and dedicated homemaker.$$,
       null,
       ARRAY['Corporate Social Responsibility', 'Community Advocacy', 'Education & Arts', 'Program Management'],
       '[]'::jsonb,
       5, true
WHERE NOT EXISTS (SELECT 1 FROM team_members WHERE name = 'Katherine F. Asis');

-- ============================================================================
-- TEAM MEMBERS — remove AI-generated placeholders
-- ============================================================================

DELETE FROM team_members WHERE name IN (
  'Maria Clara Santos',
  'Antonio C. Reyes',
  'Elena R. Cruz',
  'Rafael T. Mendoza',
  'Sofia L. Tan'
);

-- ============================================================================
-- CONTACT — office info (confirmed by Zara in Slack 2026-06-11)
-- ============================================================================

UPDATE page_content
SET value = '{"address":"4E PDCP Bank Center, Salcedo Village, V.A. Rufino St, Makati City","city":"1227 Metro Manila","phone":"","email":"founders@jca1221-group.com","mapEmbedUrl":"https://maps.google.com/?q=PDCP+Bank+Center+Salcedo+Village+Makati","hoursNote":"Monday-Friday, 9:00 AM - 6:00 PM PHT"}'::jsonb
WHERE page = 'contact' AND section = 'office' AND key = 'info';

-- ============================================================================
-- CONTACT — team contacts (real team only)
-- ============================================================================

UPDATE page_content
SET value = '[{"id":"jehremiah","name":"Atty. Jehremiah Asis","title":"Founder & President","email":"founders@jca1221-group.com","inquiryCategories":["Investment Partnerships","Strategic Direction","LGU Partnerships"]},{"id":"zara","name":"Zara C. See","title":"CFO & COO","email":"founders@jca1221-group.com","inquiryCategories":["Financial Inquiries","Operations","Social Initiatives"]},{"id":"ody","name":"Odysseus C. Alfon","title":"Chief Technical Officer","email":"founders@jca1221-group.com","inquiryCategories":["Technical Specifications","Engineering","Project Design"]}]'::jsonb
WHERE page = 'contact' AND section = 'team' AND key = 'contacts';

-- ============================================================================
-- CONTACT — clean success message (no placeholder phone)
-- ============================================================================

UPDATE page_content
SET value = jsonb_set(
  jsonb_set(
    jsonb_set(
      value,
      '{successMessage,title}',
      '"Thank you for reaching out."'::jsonb
    ),
    '{successMessage,body}',
    '"Our team reviews every inquiry within 2 business days."'::jsonb
  ),
  '{successMessage,nextSteps}',
  '["Check your email for a confirmation","A team member will contact you within 48 hours","In the meantime, explore our project portfolio"]'::jsonb
)
WHERE page = 'contact' AND section = 'form' AND key = 'config';

-- ============================================================================
-- CONTACT — hide Calendly CTA and capability PDF (not yet ready)
-- ============================================================================

UPDATE page_content SET published = false
WHERE page = 'contact' AND section = 'cta' AND key = 'scheduling';

UPDATE page_content SET published = false
WHERE page = 'contact' AND section = 'resources' AND key = 'capability_statement';

-- ============================================================================
-- ABOUT — fix title: "Founder & CEO" -> "Founder & President"
-- ============================================================================

UPDATE page_content
SET value = regexp_replace(value::text, 'Founder & CEO', 'Founder & President', 'g')::jsonb
WHERE page = 'about' AND value::text LIKE '%Founder & CEO%';
