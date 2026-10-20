-- Every index, with the schema taken out of its definition so the source and the restored copy
-- print the same text. All are btree: pg_trgm is installed (05-extensions.sql) but indexes nothing.
SELECT
  t.relname AS table_name,
  i.relname AS index_name,
  replace(pg_get_indexdef(i.oid), ' ON ' || quote_ident(n.nspname) || '.', ' ON ') AS definition
FROM pg_index x
JOIN pg_class i ON i.oid = x.indexrelid
JOIN pg_class t ON t.oid = x.indrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = current_schema()
ORDER BY t.relname, i.relname;
