-- The tables of the profiled schema with their exact row counts (docs/legacy-inventory.md
-- section 8 lists twelve). query_to_xml runs one count per table inside this single statement.
SELECT
  c.relname AS table_name,
  (xpath(
    '/row/n/text()',
    query_to_xml(format('SELECT count(*) AS n FROM %I.%I', n.nspname, c.relname), false, true, '')
  ))[1]::text::bigint AS row_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = current_schema() AND c.relkind IN ('r', 'p')
ORDER BY c.relname;
