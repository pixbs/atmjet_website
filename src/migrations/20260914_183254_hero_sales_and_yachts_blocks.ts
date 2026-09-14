import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_hero_sales_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_sales_lines_locales" (
  	"figure" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_sales" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_source" varchar DEFAULT 'Hero_sales',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_sales_locales" (
  	"overline" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_yachts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_source" varchar DEFAULT 'Hero_yachts',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_yachts_locales" (
  	"overline" varchar,
  	"title" varchar,
  	"description" varchar,
  	"description2" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_sales_lines" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_sales_lines_locales" (
  	"figure" varchar,
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_sales" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_source" varchar DEFAULT 'Hero_sales',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_sales_locales" (
  	"overline" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_yachts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_source" varchar DEFAULT 'Hero_yachts',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_yachts_locales" (
  	"overline" varchar,
  	"title" varchar,
  	"description" varchar,
  	"description2" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero_sales_lines" ADD CONSTRAINT "pages_blocks_hero_sales_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_sales"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_sales_lines_locales" ADD CONSTRAINT "pages_blocks_hero_sales_lines_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_sales_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_sales" ADD CONSTRAINT "pages_blocks_hero_sales_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_sales" ADD CONSTRAINT "pages_blocks_hero_sales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_sales_locales" ADD CONSTRAINT "pages_blocks_hero_sales_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_sales"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_yachts" ADD CONSTRAINT "pages_blocks_hero_yachts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_yachts" ADD CONSTRAINT "pages_blocks_hero_yachts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_yachts_locales" ADD CONSTRAINT "pages_blocks_hero_yachts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_yachts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_sales_lines" ADD CONSTRAINT "_pages_v_blocks_hero_sales_lines_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_sales"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_sales_lines_locales" ADD CONSTRAINT "_pages_v_blocks_hero_sales_lines_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_sales_lines"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_sales" ADD CONSTRAINT "_pages_v_blocks_hero_sales_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_sales" ADD CONSTRAINT "_pages_v_blocks_hero_sales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_sales_locales" ADD CONSTRAINT "_pages_v_blocks_hero_sales_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_sales"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_yachts" ADD CONSTRAINT "_pages_v_blocks_hero_yachts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_yachts" ADD CONSTRAINT "_pages_v_blocks_hero_yachts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_yachts_locales" ADD CONSTRAINT "_pages_v_blocks_hero_yachts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_yachts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_sales_lines_order_idx" ON "pages_blocks_hero_sales_lines" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_sales_lines_parent_id_idx" ON "pages_blocks_hero_sales_lines" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_sales_lines_locales_locale_parent_id_uniqu" ON "pages_blocks_hero_sales_lines_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_sales_order_idx" ON "pages_blocks_hero_sales" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_sales_parent_id_idx" ON "pages_blocks_hero_sales" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_sales_path_idx" ON "pages_blocks_hero_sales" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_sales_image_idx" ON "pages_blocks_hero_sales" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_sales_locales_locale_parent_id_unique" ON "pages_blocks_hero_sales_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_yachts_order_idx" ON "pages_blocks_hero_yachts" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_yachts_parent_id_idx" ON "pages_blocks_hero_yachts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_yachts_path_idx" ON "pages_blocks_hero_yachts" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_yachts_image_idx" ON "pages_blocks_hero_yachts" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_yachts_locales_locale_parent_id_unique" ON "pages_blocks_hero_yachts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_sales_lines_order_idx" ON "_pages_v_blocks_hero_sales_lines" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_sales_lines_parent_id_idx" ON "_pages_v_blocks_hero_sales_lines" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_sales_lines_locales_locale_parent_id_un" ON "_pages_v_blocks_hero_sales_lines_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_sales_order_idx" ON "_pages_v_blocks_hero_sales" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_sales_parent_id_idx" ON "_pages_v_blocks_hero_sales" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_sales_path_idx" ON "_pages_v_blocks_hero_sales" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_sales_image_idx" ON "_pages_v_blocks_hero_sales" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_sales_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_sales_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_yachts_order_idx" ON "_pages_v_blocks_hero_yachts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_yachts_parent_id_idx" ON "_pages_v_blocks_hero_yachts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_yachts_path_idx" ON "_pages_v_blocks_hero_yachts" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_yachts_image_idx" ON "_pages_v_blocks_hero_yachts" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_yachts_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_yachts_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_hero_sales_lines" CASCADE;
  DROP TABLE "pages_blocks_hero_sales_lines_locales" CASCADE;
  DROP TABLE "pages_blocks_hero_sales" CASCADE;
  DROP TABLE "pages_blocks_hero_sales_locales" CASCADE;
  DROP TABLE "pages_blocks_hero_yachts" CASCADE;
  DROP TABLE "pages_blocks_hero_yachts_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_sales_lines" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_sales_lines_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_sales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_sales_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_yachts" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_yachts_locales" CASCADE;`)
}
