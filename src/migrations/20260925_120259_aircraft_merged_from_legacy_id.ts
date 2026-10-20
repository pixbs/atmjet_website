import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The legacy id moves out of the row key it was sharing; a row already written keeps it (#79).
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "aircraft_provenance_merged_from" ADD COLUMN "legacy_id" numeric;
  UPDATE "aircraft_provenance_merged_from" SET "legacy_id" = "id";
  ALTER TABLE "aircraft_provenance_merged_from" ALTER COLUMN "legacy_id" SET NOT NULL;
  ALTER TABLE "aircraft_provenance_merged_from" ALTER COLUMN "id" SET DATA TYPE varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "aircraft_provenance_merged_from" ALTER COLUMN "id" SET DATA TYPE numeric USING "legacy_id";
  ALTER TABLE "aircraft_provenance_merged_from" DROP COLUMN "legacy_id";`)
}
