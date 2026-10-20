import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const NOTE = 'Legacy /planes/:id and /aircrafts/:id, one per aircraft (issue #172).'

/**
 * The redirect map a database already holds, tightened as `scripts/migrate/redirects.ts` writes
 * it (issue #172): `/planes` and `/aircrafts` stop catching the paths below them, and each
 * aircraft present gets its `/planes/<id>` and `/aircrafts/<id>`. A deployment applies this, so
 * staging needs no reseed; the aircraft imported later get theirs from `import:legacy redirects`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(
    sql`UPDATE "redirects" SET "match_sub_paths" = false WHERE "from" IN ('/planes', '/aircrafts')`,
  )
  await db.execute(sql`
    INSERT INTO "redirects" ("from", "to_type", "to_url", "type", "match_sub_paths", "note")
    SELECT DISTINCT p.prefix || '/' || trim(n.name), 'custom'::"enum_redirects_to_type", '/aircraft/' || s.served,
      '308'::"enum_redirects_type", false, ${NOTE}
    FROM "aircraft" a
    CROSS JOIN LATERAL (
      SELECT coalesce(
        nullif(a."slug", ''),
        nullif(upper(regexp_replace(a."registration_display", '[\\s-]', '', 'g')), ''),
        a."registration_display"
      ) AS served
    ) s
    CROSS JOIN LATERAL (
      VALUES (a."provenance_legacy_slug"), (a."provenance_legacy_tail_number"), (s.served)
    ) n(name)
    CROSS JOIN (VALUES ('/planes'), ('/aircrafts')) p(prefix)
    WHERE trim(coalesce(n.name, '')) <> '' AND position('/' in n.name) = 0
      AND NOT EXISTS (SELECT 1 FROM "redirects" r WHERE r."from" = p.prefix || '/' || trim(n.name))`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DELETE FROM "redirects" WHERE "note" = ${NOTE}`)
  await db.execute(
    sql`UPDATE "redirects" SET "match_sub_paths" = true WHERE "from" IN ('/planes', '/aircrafts')`,
  )
}
