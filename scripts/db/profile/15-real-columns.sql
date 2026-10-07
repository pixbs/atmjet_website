-- The `real` columns of `aircrafts` as the server prints them and as a double reads them: why
-- the importer asks for them as text (scripts/migrate/source.ts, ADR-0002 item 5).
WITH reals (column_name, value) AS (
  SELECT 'aircraft_type_speed_typical', aircraft_type_speed_typical FROM aircrafts
  UNION ALL SELECT 'aircraft_type_cabin_height', aircraft_type_cabin_height FROM aircrafts
  UNION ALL SELECT 'aircraft_type_cabin_length', aircraft_type_cabin_length FROM aircrafts
  UNION ALL SELECT 'aircraft_type_cabin_width', aircraft_type_cabin_width FROM aircrafts
)
SELECT
  column_name,
  count(value) AS non_null,
  count(DISTINCT value) AS distinct_values,
  min(value)::text AS min_value,
  max(value)::text AS max_value,
  count(*) FILTER (WHERE value::text <> value::double precision::text) AS gains_digits_as_double,
  min(value::text) FILTER (WHERE value::text <> value::double precision::text) AS example_as_text,
  min(value::double precision::text) FILTER (WHERE value::text <> value::double precision::text) AS example_as_double
FROM reals
GROUP BY 1
ORDER BY 1;
