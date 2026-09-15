-- ============================================================================
-- Official team photoshoot headshots
-- Studio portraits (grey backdrop, 3:4 crop, 1050x1400) committed to
-- public/images/team/. Sets team_members.photo for every published member.
-- Identity matched against the previously held photos of Odysseus, Katherine
-- and Jehremiah; Zara and Constantine had no prior photo on file.
-- ============================================================================

UPDATE team_members SET photo = '/images/team/jehremiah-asis.jpg'    WHERE name = 'Jehremiah C. Asis';
UPDATE team_members SET photo = '/images/team/ody-alfon.jpg'         WHERE name = 'Odysseus C. Alfon';
UPDATE team_members SET photo = '/images/team/constantine-doncila.jpg' WHERE name = 'Constantine A. Doncila';
UPDATE team_members SET photo = '/images/team/zara-see.jpg'          WHERE name = 'Zara C. See';
UPDATE team_members SET photo = '/images/team/katherine-asis.jpg'    WHERE name = 'Katherine F. Asis';

-- Contact panel avatar for the founder lives in page_content.contact.team.contacts
UPDATE page_content
SET value = replace(value::text, '/images/team/jehremiah-asis.png', '/images/team/jehremiah-asis.jpg')::jsonb
WHERE page = 'contact' AND section = 'team' AND key = 'contacts'
  AND value::text LIKE '%/images/team/jehremiah-asis.png%';

-- Founder profile photo on the About page
UPDATE page_content
SET value = replace(replace(value::text,
      '/images/team/jehri-asis.jpg', '/images/team/jehremiah-asis.jpg'),
      '/images/team/jehremiah-asis.png', '/images/team/jehremiah-asis.jpg')::jsonb
WHERE page = 'about' AND section = 'founder' AND key = 'profile'
  AND (value::text LIKE '%/images/team/jehri-asis.jpg%'
       OR value::text LIKE '%/images/team/jehremiah-asis.png%');
