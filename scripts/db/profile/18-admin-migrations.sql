-- The migrations the legacy admin's Drizzle applied, from its own `drizzle` schema, which the
-- dump carries beside `public`: eleven, where atmjet-admin/drizzle has four files (section 8.8).
SELECT id, hash, to_char(to_timestamp(created_at / 1000.0) AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS') AS applied_at_utc
FROM drizzle.__drizzle_migrations
ORDER BY id;
