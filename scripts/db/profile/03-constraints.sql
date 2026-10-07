-- Primary keys, unique and foreign keys and checks as the server holds them
-- (kind: p primary, u unique, f foreign, c check).
SELECT
  c.relname AS table_name,
  con.contype AS kind,
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = current_schema()
ORDER BY c.relname, con.contype, con.conname;
