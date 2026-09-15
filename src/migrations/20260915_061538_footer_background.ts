import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" ADD COLUMN "background_id" integer;
  ALTER TABLE "footer" ADD CONSTRAINT "footer_background_id_media_id_fk" FOREIGN KEY ("background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "footer_background_idx" ON "footer" USING btree ("background_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" DROP CONSTRAINT "footer_background_id_media_id_fk";
  
  DROP INDEX "footer_background_idx";
  ALTER TABLE "footer" DROP COLUMN "background_id";`)
}
