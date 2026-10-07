-- The planes of `aircrafts` and of `vehicles` on the canonical registration the importers merge
-- on (`canonicalRegistration` in src/lib/aircraft.ts: whitespace and ASCII hyphens removed,
-- upper case), and on the `upper(replace(x, '-', ''))` issue #75 names, where the two differ.
WITH catalogue AS (
  SELECT upper(regexp_replace(registration_number, '[\s-]', '', 'g')) AS canonical,
         upper(replace(registration_number, '-', '')) AS issue_form,
         registration_number AS raw
  FROM aircrafts
),
planes AS (
  SELECT upper(regexp_replace(tail_number, '[\s-]', '', 'g')) AS canonical
  FROM vehicles
  WHERE btrim(tail_number) <> ''
)
SELECT measure, value
FROM (VALUES
  (1, 'aircrafts rows', (SELECT count(*) FROM catalogue)),
  (2, 'aircrafts without a registration', (SELECT count(*) FROM catalogue WHERE coalesce(canonical, '') = '')),
  (3, 'aircrafts registrations with whitespace', (SELECT count(*) FROM catalogue WHERE raw ~ '\s')),
  (4, 'aircrafts registrations with a character outside A-Z, 0-9, space and the ASCII hyphen',
      (SELECT count(*) FROM catalogue WHERE upper(raw) ~ '[^A-Z0-9 -]')),
  (5, 'aircrafts canonical registrations held by more than one row',
      (SELECT count(*) FROM (SELECT canonical FROM catalogue WHERE canonical <> '' GROUP BY 1 HAVING count(*) > 1) d)),
  (6, 'aircrafts rows where the issue form differs from the canonical one',
      (SELECT count(*) FROM catalogue WHERE issue_form IS DISTINCT FROM canonical)),
  (7, 'vehicles planes (a tail number that is not blank)', (SELECT count(*) FROM planes)),
  (8, 'vehicles canonical registrations held by more than one plane',
      (SELECT count(*) FROM (SELECT canonical FROM planes GROUP BY 1 HAVING count(*) > 1) d)),
  (9, 'vehicles planes whose registration aircrafts also has',
      (SELECT count(*) FROM planes p WHERE EXISTS (SELECT 1 FROM catalogue c WHERE c.canonical = p.canonical))),
  (10, 'vehicles planes aircrafts does not have',
      (SELECT count(*) FROM planes p WHERE NOT EXISTS (SELECT 1 FROM catalogue c WHERE c.canonical = p.canonical))),
  (11, 'distinct planes across both tables',
      (SELECT count(*) FROM (SELECT canonical FROM catalogue WHERE canonical <> '' UNION SELECT canonical FROM planes) u))
) AS m (n, measure, value)
ORDER BY n;
