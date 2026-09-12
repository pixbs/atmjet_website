import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Moves `media.alt` into the localized table (issue #62).
 *
 * The generated statements drop the column outright, which would throw away every alt text, so
 * the existing values are copied into the default locale first and copied back on the way down
 * (docs/adr/0002-database-migration-strategy.md: no migration loses data).
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  INSERT INTO "media_locales" ("alt", "_locale", "_parent_id")
    SELECT "alt", 'en', "id" FROM "media" WHERE "alt" IS NOT NULL;
  ALTER TABLE "media" DROP COLUMN "alt";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "alt" varchar;
  UPDATE "media" SET "alt" = "media_locales"."alt"
    FROM "media_locales"
    WHERE "media_locales"."_parent_id" = "media"."id" AND "media_locales"."_locale" = 'en';
  ALTER TABLE "media" ALTER COLUMN "alt" SET NOT NULL;
  DROP TABLE "media_locales" CASCADE;`)
}
