-- Every value of the columns that take only a few, with how many rows hold it. The list is
-- explicit so that no column holding personal data is ever printed (`contact`, `owner`).
WITH picked (table_name, column_name) AS (
  VALUES
    ('aircraft_images', 'type'),
    ('aircrafts', 'aircraft_type_aircraft_class_name'),
    ('new_airports', 'type_en'),
    ('new_yachts', 'currency'),
    ('new_yachts', 'location'),
    ('vehicles', 'source'),
    ('vehicles', 'price'),
    ('vehicles', 'old_price'),
    ('vehicles', 'weight'),
    ('vehicles', 'vendor'),
    ('vehicles', 'new'),
    ('vehicles', 'popular'),
    ('vehicles', 'favorite'),
    ('yachts', 'location')
)
SELECT p.table_name, p.column_name, v.value, v.row_count
FROM picked p
CROSS JOIN LATERAL xmltable(
  '/table/row' PASSING query_to_xml(
    format(
      'SELECT coalesce(to_jsonb(%1$I)::text, ''null'') AS value, count(*) AS row_count FROM %2$I.%3$I GROUP BY 1',
      p.column_name, current_schema(), p.table_name
    ),
    false, false, ''
  )
  COLUMNS value text, row_count bigint
) v
ORDER BY p.table_name, p.column_name, v.row_count DESC, v.value;
