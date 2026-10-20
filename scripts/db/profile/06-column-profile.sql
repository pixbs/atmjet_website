-- Every column of every table: how often it is null, blank or padded with whitespace, how many
-- values it takes and how long they are. Counts only, never a value; the two tables holding
-- personal data and passwords (`contact`, `atmjet_admin__users`) do not even give lengths.
SELECT
  c.table_name,
  c.column_name,
  p.nulls,
  p.blank,
  p.padded,
  p.distinct_values,
  CASE WHEN c.table_name NOT IN ('contact', 'atmjet_admin__users') THEN p.min_length END AS min_length,
  CASE WHEN c.table_name NOT IN ('contact', 'atmjet_admin__users') THEN p.max_length END AS max_length
FROM information_schema.columns c
CROSS JOIN LATERAL xmltable(
  '/table/row' PASSING query_to_xml(
    format(
      $q$SELECT count(*) - count(%1$I) AS nulls,
                count(*) FILTER (WHERE btrim(%1$I::text, E' \t\r\n') = '') AS blank,
                count(*) FILTER (WHERE %1$I::text ~ '^\s|\s$') AS padded,
                count(DISTINCT %1$I::text) AS distinct_values,
                min(length(%1$I::text)) AS min_length,
                max(length(%1$I::text)) AS max_length
         FROM %2$I.%3$I$q$,
      c.column_name, c.table_schema, c.table_name
    ),
    false, false, ''
  )
  COLUMNS
    nulls bigint, blank bigint, padded bigint, distinct_values bigint,
    min_length integer, max_length integer
) p
WHERE c.table_schema = current_schema()
ORDER BY c.table_name, c.ordinal_position;
