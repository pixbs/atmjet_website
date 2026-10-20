-- The formats of the identifier and code columns: each value with its capitals written `A`, its
-- small letters `a` and its digits `9`, so `9H-ATM` reads `9A-AAA`. Anything else is kept as
-- it is, which is how a tab or a non-ASCII hyphen shows. The five commonest shapes per column,
-- with one example each as a JSON string; no column of `contact` or `atmjet_admin__users`.
WITH picked (table_name, column_name) AS (
  VALUES
    ('aircrafts', 'slug'),
    ('aircrafts', 'registration_number'),
    ('aircrafts', 'verified_at'),
    ('aircrafts', 'airport_icao'),
    ('aircrafts', 'airport_iata'),
    ('aircrafts', 'extension_cabin_height'),
    ('aircrafts', 'extension_luggage_volume'),
    ('airports', 'icao_code'),
    ('airports', 'iata_code'),
    ('airports', 'gmt_offset'),
    ('airports', 'latitude'),
    ('new_airports', 'icao'),
    ('new_airports', 'iata'),
    ('new_airports', 'passengers_per_year'),
    ('new_yachts', 'slug'),
    ('new_yachts', 'cabins'),
    ('vehicles', 'tail_number'),
    ('vehicles', 'tail_year'),
    ('vehicles', 'tail_maxpax'),
    ('vehicles', 'yacht_length'),
    ('vehicles', 'image')
),
shapes AS (
  SELECT p.table_name, p.column_name, s.shape, s.row_count, s.example,
         row_number() OVER (PARTITION BY p.table_name, p.column_name ORDER BY s.row_count DESC, s.shape) AS rank
  FROM picked p
  CROSS JOIN LATERAL xmltable(
    '/table/row' PASSING query_to_xml(
      format(
        $q$SELECT shape, count(*) AS row_count, to_jsonb(min(value))::text AS example
           FROM (SELECT %1$I::text AS value,
                        translate(%1$I::text,
                                  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
                                  'AAAAAAAAAAAAAAAAAAAAAAAAAAaaaaaaaaaaaaaaaaaaaaaaaaaa9999999999') AS shape
                 FROM %2$I.%3$I WHERE %1$I IS NOT NULL) v
           GROUP BY shape$q$,
        p.column_name, current_schema(), p.table_name
      ),
      false, false, ''
    )
    COLUMNS shape text, row_count bigint, example text
  ) s
)
SELECT table_name, column_name, to_jsonb(shape)::text AS shape, row_count, example
FROM shapes
WHERE rank <= 5
ORDER BY table_name, column_name, rank;
