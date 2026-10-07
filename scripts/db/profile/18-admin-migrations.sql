-- The migrations the legacy admin's Drizzle applied, from its own `drizzle` schema, which the
-- dump carries beside `public`: eleven, where atmjet-admin/drizzle has four files (section 8.8).
-- The restore (#74) leaves that schema in the encrypted dump, so the restored copy prints none.
SELECT m.id, m.hash, m.applied_at_utc
FROM xmltable(
  '/table/row' PASSING query_to_xml(
    CASE
      WHEN to_regclass('drizzle.__drizzle_migrations') IS NULL THEN 'SELECT WHERE false'
      ELSE $q$SELECT id, hash, to_char(to_timestamp(created_at / 1000.0) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') AS applied_at_utc
              FROM drizzle.__drizzle_migrations$q$
    END,
    false, false, ''
  )
  COLUMNS id integer, hash text, applied_at_utc text
) m
ORDER BY m.id;
