import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_quote_variant" AS ENUM('press', 'founder');
  CREATE TYPE "public"."enum__pages_v_blocks_quote_variant" AS ENUM('press', 'founder');
  CREATE TABLE "pages_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_quote_variant" DEFAULT 'press',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_quote_locales" (
  	"quote" varchar,
  	"attribution" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_quote" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_quote_variant" DEFAULT 'press',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_quote_locales" (
  	"quote" varchar,
  	"attribution" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_quote" ADD CONSTRAINT "pages_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_quote_locales" ADD CONSTRAINT "pages_blocks_quote_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_quote"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quote" ADD CONSTRAINT "_pages_v_blocks_quote_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_quote_locales" ADD CONSTRAINT "_pages_v_blocks_quote_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_quote"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_quote_order_idx" ON "pages_blocks_quote" USING btree ("_order");
  CREATE INDEX "pages_blocks_quote_parent_id_idx" ON "pages_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_quote_path_idx" ON "pages_blocks_quote" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_quote_locales_locale_parent_id_unique" ON "pages_blocks_quote_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_quote_order_idx" ON "_pages_v_blocks_quote" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_quote_parent_id_idx" ON "_pages_v_blocks_quote" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_quote_path_idx" ON "_pages_v_blocks_quote" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_quote_locales_locale_parent_id_unique" ON "_pages_v_blocks_quote_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_quote" CASCADE;
  DROP TABLE "pages_blocks_quote_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_quote" CASCADE;
  DROP TABLE "_pages_v_blocks_quote_locales" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_quote_variant";
  DROP TYPE "public"."enum__pages_v_blocks_quote_variant";`)
}
