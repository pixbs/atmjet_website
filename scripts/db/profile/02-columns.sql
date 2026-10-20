-- The real column definitions, which nine of the twelve tables have nowhere else
-- (docs/legacy-inventory.md section 8.8): type, nullability and default, in column order.
SELECT
  c.relname AS table_name,
  row_number() OVER (PARTITION BY c.relname ORDER BY a.attnum) AS position,
  a.attname AS column_name,
  format_type(a.atttypid, a.atttypmod) AS type,
  a.attnotnull AS not_null,
  pg_get_expr(d.adbin, d.adrelid) AS default_value
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
WHERE n.nspname = current_schema() AND c.relkind IN ('r', 'p') AND a.attnum > 0 AND NOT a.attisdropped
ORDER BY c.relname, a.attnum;
