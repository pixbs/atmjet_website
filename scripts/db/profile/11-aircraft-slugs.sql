-- `aircrafts.slug` against the registration it is assumed to spell (docs/legacy-inventory.md
-- section 15.1): every row whose slug is not the lower-cased registration, which is the URL the
-- legacy sitemap published for it (`/aircraft/<slug>`). Registrations are public, so listed.
SELECT
  CASE
    WHEN registration_number IS NULL THEN 'no registration'
    WHEN slug ~ '^[0-9]+$' THEN 'digits only'
    WHEN slug = lower(regexp_replace(registration_number, '[\s-]', '', 'g')) THEN 'registration without hyphen'
    WHEN slug LIKE lower(btrim(registration_number)) || '-%' THEN 'registration with a suffix'
    ELSE 'another registration or a misspelling'
  END AS kind,
  id,
  slug,
  to_jsonb(registration_number)::text AS registration_number
FROM aircrafts
WHERE slug IS DISTINCT FROM lower(btrim(registration_number))
ORDER BY kind, id;
