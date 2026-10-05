-- Extensions, and whether each lives in the profiled schema: one that does moves with it when
-- the restore renames `public` to `legacy` (docs/runbooks/legacy-db-snapshot-and-restore.md).
SELECT
  e.extname AS extension,
  e.extversion AS version,
  n.nspname = current_schema() AS in_profiled_schema
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
ORDER BY e.extname;
