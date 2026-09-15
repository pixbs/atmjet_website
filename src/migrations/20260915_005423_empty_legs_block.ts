import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_empty_legs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 12,
  	"cta_source" varchar DEFAULT 'Empty-legs',
  	"channel_account" varchar DEFAULT 'atmjet1',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_empty_legs_locales" (
  	"title" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"channel_title" varchar,
  	"channel_description" varchar,
  	"channel_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_empty_legs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"limit" numeric DEFAULT 12,
  	"cta_source" varchar DEFAULT 'Empty-legs',
  	"channel_account" varchar DEFAULT 'atmjet1',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_empty_legs_locales" (
  	"title" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"channel_title" varchar,
  	"channel_description" varchar,
  	"channel_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_empty_legs" ADD CONSTRAINT "pages_blocks_empty_legs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_empty_legs_locales" ADD CONSTRAINT "pages_blocks_empty_legs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_empty_legs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_empty_legs" ADD CONSTRAINT "_pages_v_blocks_empty_legs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_empty_legs_locales" ADD CONSTRAINT "_pages_v_blocks_empty_legs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_empty_legs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_empty_legs_order_idx" ON "pages_blocks_empty_legs" USING btree ("_order");
  CREATE INDEX "pages_blocks_empty_legs_parent_id_idx" ON "pages_blocks_empty_legs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_empty_legs_path_idx" ON "pages_blocks_empty_legs" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_empty_legs_locales_locale_parent_id_unique" ON "pages_blocks_empty_legs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_empty_legs_order_idx" ON "_pages_v_blocks_empty_legs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_empty_legs_parent_id_idx" ON "_pages_v_blocks_empty_legs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_empty_legs_path_idx" ON "_pages_v_blocks_empty_legs" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_empty_legs_locales_locale_parent_id_unique" ON "_pages_v_blocks_empty_legs_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_empty_legs" CASCADE;
  DROP TABLE "pages_blocks_empty_legs_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_empty_legs" CASCADE;
  DROP TABLE "_pages_v_blocks_empty_legs_locales" CASCADE;`)
}
