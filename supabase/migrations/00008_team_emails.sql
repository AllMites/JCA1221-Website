-- ============================================================================
-- Team member emails (jca1221-group.com)
--   1. team_members.links — replace any existing email link with the
--      member's own address, placed first.
--   2. contact team contacts — swap shared founders@ address for each
--      person's own address.
-- ============================================================================

-- ============================================================================
-- TEAM MEMBERS — email links
-- ============================================================================

UPDATE team_members t
SET links = jsonb_build_array(
      jsonb_build_object('type', 'email', 'label', e.email, 'url', 'mailto:' || e.email)
    ) || coalesce(
      (SELECT jsonb_agg(l) FROM jsonb_array_elements(t.links) l WHERE l->>'type' <> 'email'),
      '[]'::jsonb
    )
FROM (VALUES
  ('Jehremiah C. Asis',      'jehremiah.asis@jca1221-group.com'),
  ('Katherine F. Asis',      'katherine.asis@jca1221-group.com'),
  ('Odysseus C. Alfon',      'odysseus.alfon@jca1221-group.com'),
  ('Constantine A. Doncila', 'constantine.doncila@jca1221-group.com'),
  ('Zara C. See',            'zara.see@jca1221-group.com')
) AS e(name, email)
WHERE t.name = e.name;

-- ============================================================================
-- CONTACT — team contacts
-- ============================================================================

UPDATE page_content
SET value = (
  SELECT jsonb_agg(
    CASE c->>'id'
      WHEN 'jehremiah' THEN jsonb_set(c, '{email}', '"jehremiah.asis@jca1221-group.com"')
      WHEN 'zara'      THEN jsonb_set(c, '{email}', '"zara.see@jca1221-group.com"')
      WHEN 'ody'       THEN jsonb_set(c, '{email}', '"odysseus.alfon@jca1221-group.com"')
      ELSE c
    END
    ORDER BY ord
  )
  FROM jsonb_array_elements(value) WITH ORDINALITY AS x(c, ord)
)
WHERE page = 'contact' AND section = 'team' AND key = 'contacts';
