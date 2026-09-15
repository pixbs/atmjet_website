import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_available_locales" AS ENUM('en', 'ru', 'uk');
  CREATE TYPE "public"."enum__pages_v_version_available_locales" AS ENUM('en', 'ru', 'uk');
  CREATE TABLE "pages_available_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_pages_available_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_wordmark_note" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_wordmark_note_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_version_available_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_version_available_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_wordmark_note" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_wordmark_note_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_available_locales" ADD CONSTRAINT "pages_available_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_wordmark_note" ADD CONSTRAINT "pages_blocks_wordmark_note_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_wordmark_note_locales" ADD CONSTRAINT "pages_blocks_wordmark_note_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_wordmark_note"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_version_available_locales" ADD CONSTRAINT "_pages_v_version_available_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_wordmark_note" ADD CONSTRAINT "_pages_v_blocks_wordmark_note_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_wordmark_note_locales" ADD CONSTRAINT "_pages_v_blocks_wordmark_note_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_wordmark_note"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_available_locales_order_idx" ON "pages_available_locales" USING btree ("order");
  CREATE INDEX "pages_available_locales_parent_idx" ON "pages_available_locales" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_wordmark_note_order_idx" ON "pages_blocks_wordmark_note" USING btree ("_order");
  CREATE INDEX "pages_blocks_wordmark_note_parent_id_idx" ON "pages_blocks_wordmark_note" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_wordmark_note_path_idx" ON "pages_blocks_wordmark_note" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_wordmark_note_locales_locale_parent_id_unique" ON "pages_blocks_wordmark_note_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_version_available_locales_order_idx" ON "_pages_v_version_available_locales" USING btree ("order");
  CREATE INDEX "_pages_v_version_available_locales_parent_idx" ON "_pages_v_version_available_locales" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_wordmark_note_order_idx" ON "_pages_v_blocks_wordmark_note" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_wordmark_note_parent_id_idx" ON "_pages_v_blocks_wordmark_note" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_wordmark_note_path_idx" ON "_pages_v_blocks_wordmark_note" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_wordmark_note_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_wordmark_note_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_available_locales" CASCADE;
  DROP TABLE "pages_blocks_wordmark_note" CASCADE;
  DROP TABLE "pages_blocks_wordmark_note_locales" CASCADE;
  DROP TABLE "_pages_v_version_available_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_wordmark_note" CASCADE;
  DROP TABLE "_pages_v_blocks_wordmark_note_locales" CASCADE;
  DROP TYPE "public"."enum_pages_available_locales";
  DROP TYPE "public"."enum__pages_v_version_available_locales";`)
}
