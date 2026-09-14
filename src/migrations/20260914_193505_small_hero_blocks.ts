import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_hero_aircraft" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_aircraft_locales" (
  	"title" varchar,
  	"figure" varchar,
  	"title2" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_empty_legs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_empty_legs_locales" (
  	"figure" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_group_locales" (
  	"chip" varchar,
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_partners_locales" (
  	"title" varchar,
  	"figure" varchar,
  	"title2" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_aircraft" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_aircraft_locales" (
  	"title" varchar,
  	"figure" varchar,
  	"title2" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_empty_legs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_empty_legs_locales" (
  	"figure" varchar,
  	"title" varchar,
  	"subtitle" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_group" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_group_locales" (
  	"chip" varchar,
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_partners" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_partners_locales" (
  	"title" varchar,
  	"figure" varchar,
  	"title2" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero_aircraft" ADD CONSTRAINT "pages_blocks_hero_aircraft_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_aircraft_locales" ADD CONSTRAINT "pages_blocks_hero_aircraft_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_aircraft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_empty_legs" ADD CONSTRAINT "pages_blocks_hero_empty_legs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_empty_legs" ADD CONSTRAINT "pages_blocks_hero_empty_legs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_empty_legs_locales" ADD CONSTRAINT "pages_blocks_hero_empty_legs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_empty_legs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_group" ADD CONSTRAINT "pages_blocks_hero_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_group_locales" ADD CONSTRAINT "pages_blocks_hero_group_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_partners" ADD CONSTRAINT "pages_blocks_hero_partners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_partners" ADD CONSTRAINT "pages_blocks_hero_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_partners_locales" ADD CONSTRAINT "pages_blocks_hero_partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_aircraft" ADD CONSTRAINT "_pages_v_blocks_hero_aircraft_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_aircraft_locales" ADD CONSTRAINT "_pages_v_blocks_hero_aircraft_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_aircraft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_empty_legs" ADD CONSTRAINT "_pages_v_blocks_hero_empty_legs_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_empty_legs" ADD CONSTRAINT "_pages_v_blocks_hero_empty_legs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_empty_legs_locales" ADD CONSTRAINT "_pages_v_blocks_hero_empty_legs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_empty_legs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_group" ADD CONSTRAINT "_pages_v_blocks_hero_group_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_group_locales" ADD CONSTRAINT "_pages_v_blocks_hero_group_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_group"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_partners" ADD CONSTRAINT "_pages_v_blocks_hero_partners_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_partners" ADD CONSTRAINT "_pages_v_blocks_hero_partners_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_partners_locales" ADD CONSTRAINT "_pages_v_blocks_hero_partners_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_partners"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_aircraft_order_idx" ON "pages_blocks_hero_aircraft" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_aircraft_parent_id_idx" ON "pages_blocks_hero_aircraft" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_aircraft_path_idx" ON "pages_blocks_hero_aircraft" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_hero_aircraft_locales_locale_parent_id_unique" ON "pages_blocks_hero_aircraft_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_empty_legs_order_idx" ON "pages_blocks_hero_empty_legs" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_empty_legs_parent_id_idx" ON "pages_blocks_hero_empty_legs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_empty_legs_path_idx" ON "pages_blocks_hero_empty_legs" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_empty_legs_image_idx" ON "pages_blocks_hero_empty_legs" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_empty_legs_locales_locale_parent_id_unique" ON "pages_blocks_hero_empty_legs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_group_order_idx" ON "pages_blocks_hero_group" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_group_parent_id_idx" ON "pages_blocks_hero_group" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_group_path_idx" ON "pages_blocks_hero_group" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_hero_group_locales_locale_parent_id_unique" ON "pages_blocks_hero_group_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_hero_partners_order_idx" ON "pages_blocks_hero_partners" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_partners_parent_id_idx" ON "pages_blocks_hero_partners" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_partners_path_idx" ON "pages_blocks_hero_partners" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_partners_image_idx" ON "pages_blocks_hero_partners" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_partners_locales_locale_parent_id_unique" ON "pages_blocks_hero_partners_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_aircraft_order_idx" ON "_pages_v_blocks_hero_aircraft" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_aircraft_parent_id_idx" ON "_pages_v_blocks_hero_aircraft" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_aircraft_path_idx" ON "_pages_v_blocks_hero_aircraft" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_aircraft_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_hero_aircraft_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_empty_legs_order_idx" ON "_pages_v_blocks_hero_empty_legs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_empty_legs_parent_id_idx" ON "_pages_v_blocks_hero_empty_legs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_empty_legs_path_idx" ON "_pages_v_blocks_hero_empty_legs" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_empty_legs_image_idx" ON "_pages_v_blocks_hero_empty_legs" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_empty_legs_locales_locale_parent_id_uni" ON "_pages_v_blocks_hero_empty_legs_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_group_order_idx" ON "_pages_v_blocks_hero_group" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_group_parent_id_idx" ON "_pages_v_blocks_hero_group" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_group_path_idx" ON "_pages_v_blocks_hero_group" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_group_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_group_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_partners_order_idx" ON "_pages_v_blocks_hero_partners" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_partners_parent_id_idx" ON "_pages_v_blocks_hero_partners" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_partners_path_idx" ON "_pages_v_blocks_hero_partners" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_partners_image_idx" ON "_pages_v_blocks_hero_partners" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_partners_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_hero_partners_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_hero_aircraft" CASCADE;
  DROP TABLE "pages_blocks_hero_aircraft_locales" CASCADE;
  DROP TABLE "pages_blocks_hero_empty_legs" CASCADE;
  DROP TABLE "pages_blocks_hero_empty_legs_locales" CASCADE;
  DROP TABLE "pages_blocks_hero_group" CASCADE;
  DROP TABLE "pages_blocks_hero_group_locales" CASCADE;
  DROP TABLE "pages_blocks_hero_partners" CASCADE;
  DROP TABLE "pages_blocks_hero_partners_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_aircraft" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_aircraft_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_empty_legs" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_empty_legs_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_group" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_group_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_partners" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_partners_locales" CASCADE;`)
}
