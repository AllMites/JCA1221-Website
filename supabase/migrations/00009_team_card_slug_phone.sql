-- ============================================================================
-- NFC calling card pages: jca1221.com/team/<slug>
--   slug  — lowercase firstname+lastname, used by the /team/:slug route
--   phone — E.164 mobile number (+639XXXXXXXXX); filled in via admin
-- Both columns are public under the existing "Public can read published
-- team" policy — card info is intentionally public (noindex, unlinked).
-- ============================================================================

ALTER TABLE team_members
  ADD COLUMN IF NOT EXISTS slug  text UNIQUE,
  ADD COLUMN IF NOT EXISTS phone text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_members_slug_format') THEN
    ALTER TABLE team_members
      ADD CONSTRAINT team_members_slug_format CHECK (slug ~ '^[a-z0-9]+$');
  END IF;
END $$;

UPDATE team_members t
SET slug = s.slug
FROM (VALUES
  ('Jehremiah C. Asis',      'jehremiahasis'),
  ('Katherine F. Asis',      'katherineasis'),
  ('Odysseus C. Alfon',      'odysseusalfon'),
  ('Constantine A. Doncila', 'constantinedoncila'),
  ('Zara C. See',            'zarasee')
) AS s(name, slug)
WHERE t.name = s.name;
