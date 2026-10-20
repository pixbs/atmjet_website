-- The references between tables that no foreign key holds, and what the pages read through them:
-- the contacts of `new_yachts`, the images of each aircraft, and the airports both catalogues name.
SELECT measure, value
FROM (VALUES
  (1, 'new_yachts.contact_id without a contact row',
      (SELECT count(*) FROM new_yachts y
       WHERE y.contact_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM contact c WHERE c.id = y.contact_id))),
  (2, 'new_yachts.captain_id without a contact row',
      (SELECT count(*) FROM new_yachts y
       WHERE y.captain_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM contact c WHERE c.id = y.captain_id))),
  (3, 'contact rows no yacht points at',
      (SELECT count(*) FROM contact c
       WHERE NOT EXISTS (SELECT 1 FROM new_yachts y WHERE c.id IN (y.contact_id, y.captain_id)))),
  (4, 'aircrafts with no image',
      (SELECT count(*) FROM aircrafts a WHERE NOT EXISTS (SELECT 1 FROM aircraft_images i WHERE i.aircraft_id = a.id))),
  (5, 'aircrafts with images but no exterior one (no listing cover)',
      (SELECT count(*) FROM aircrafts a
       WHERE EXISTS (SELECT 1 FROM aircraft_images i WHERE i.aircraft_id = a.id)
         AND NOT EXISTS (SELECT 1 FROM aircraft_images i WHERE i.aircraft_id = a.id AND i.type = 'exterior'))),
  (6, 'aircrafts with an image of a type other than exterior, cabin or cockpit',
      (SELECT count(DISTINCT aircraft_id) FROM aircraft_images WHERE type NOT IN ('exterior', 'cabin', 'cockpit'))),
  (7, 'most images on one aircraft',
      (SELECT max(n) FROM (SELECT count(*) AS n FROM aircraft_images GROUP BY aircraft_id) per_aircraft)),
  (8, 'aircrafts.airport_icao absent from airports.icao_code',
      (SELECT count(*) FROM aircrafts a WHERE btrim(a.airport_icao) <> ''
         AND NOT EXISTS (SELECT 1 FROM airports p WHERE upper(btrim(p.icao_code)) = upper(btrim(a.airport_icao))))),
  (9, 'aircrafts.airport_icao absent from new_airports.icao',
      (SELECT count(*) FROM aircrafts a WHERE btrim(a.airport_icao) <> ''
         AND NOT EXISTS (SELECT 1 FROM new_airports p WHERE upper(btrim(p.icao)) = upper(btrim(a.airport_icao))))),
  (10, 'airports ICAO codes absent from new_airports',
      (SELECT count(DISTINCT upper(btrim(icao_code))) FROM airports a WHERE btrim(a.icao_code) <> ''
         AND NOT EXISTS (SELECT 1 FROM new_airports p WHERE upper(btrim(p.icao)) = upper(btrim(a.icao_code)))))
) AS m (n, measure, value)
ORDER BY n;
