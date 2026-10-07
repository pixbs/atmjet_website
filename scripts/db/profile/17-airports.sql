-- The two airport tables on the keys the importer merges them by (`airportKey` in
-- scripts/migrate/airports.ts: ICAO, else IATA, else the Wikidata item; codes without
-- whitespace, upper case), and the passenger counts it parses.
SELECT measure, value
FROM (VALUES
  (1, 'airports rows', (SELECT count(*) FROM airports)),
  (2, 'airports with a blank ICAO code', (SELECT count(*) FROM airports WHERE btrim(icao_code) = '')),
  (3, 'airports ICAO codes held by more than one row',
      (SELECT count(*) FROM (SELECT upper(regexp_replace(icao_code, '\s', '', 'g')) FROM airports
                             WHERE btrim(icao_code) <> '' GROUP BY 1 HAVING count(*) > 1) d)),
  (4, 'new_airports rows', (SELECT count(*) FROM new_airports)),
  (5, 'new_airports with neither ICAO nor IATA',
      (SELECT count(*) FROM new_airports WHERE coalesce(btrim(icao), '') = '' AND coalesce(btrim(iata), '') = '')),
  (6, 'new_airports ICAO codes held by more than one row',
      (SELECT count(*) FROM (SELECT upper(regexp_replace(icao, '\s', '', 'g')) FROM new_airports
                             WHERE btrim(icao) <> '' GROUP BY 1 HAVING count(*) > 1) d)),
  (7, 'new_airports Wikidata items held by more than one row',
      (SELECT count(*) FROM (SELECT wikidata FROM new_airports GROUP BY 1 HAVING count(*) > 1) d)),
  (8, 'new_airports ICAO values that are not four letters or digits',
      (SELECT count(*) FROM new_airports WHERE icao !~ '^[A-Za-z0-9]{4}$')),
  (9, 'new_airports ICAO values that are Wikidata blank-node URLs',
      (SELECT count(*) FROM new_airports WHERE icao LIKE 'http://www.wikidata.org/.well-known/genid/%')),
  (10, 'new_airports passengers_per_year present',
      (SELECT count(*) FROM new_airports WHERE btrim(passengers_per_year) <> '')),
  (11, 'new_airports passengers_per_year the importer cannot read as a count',
      (SELECT count(*) FROM new_airports
       WHERE btrim(passengers_per_year) <> ''
         AND regexp_replace(passengers_per_year, '[\s,''_]', '', 'g') !~ '^\d+(\.\d+)?$'))
) AS m (n, measure, value)
ORDER BY n;
