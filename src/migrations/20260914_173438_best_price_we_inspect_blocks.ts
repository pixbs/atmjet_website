import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_best_price" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_source" varchar DEFAULT 'Best_price',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_best_price_locales" (
  	"title" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_we_inspect_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_we_inspect_slides_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_we_inspect" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_we_inspect_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_best_price" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_source" varchar DEFAULT 'Best_price',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_best_price_locales" (
  	"title" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_we_inspect_slides" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_we_inspect_slides_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_we_inspect" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_we_inspect_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_best_price" ADD CONSTRAINT "pages_blocks_best_price_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_best_price" ADD CONSTRAINT "pages_blocks_best_price_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_best_price_locales" ADD CONSTRAINT "pages_blocks_best_price_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_best_price"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_we_inspect_slides" ADD CONSTRAINT "pages_blocks_we_inspect_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_we_inspect_slides" ADD CONSTRAINT "pages_blocks_we_inspect_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_we_inspect"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_we_inspect_slides_locales" ADD CONSTRAINT "pages_blocks_we_inspect_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_we_inspect_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_we_inspect" ADD CONSTRAINT "pages_blocks_we_inspect_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_we_inspect_locales" ADD CONSTRAINT "pages_blocks_we_inspect_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_we_inspect"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_best_price" ADD CONSTRAINT "_pages_v_blocks_best_price_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_best_price" ADD CONSTRAINT "_pages_v_blocks_best_price_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_best_price_locales" ADD CONSTRAINT "_pages_v_blocks_best_price_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_best_price"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_we_inspect_slides" ADD CONSTRAINT "_pages_v_blocks_we_inspect_slides_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_we_inspect_slides" ADD CONSTRAINT "_pages_v_blocks_we_inspect_slides_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_we_inspect"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_we_inspect_slides_locales" ADD CONSTRAINT "_pages_v_blocks_we_inspect_slides_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_we_inspect_slides"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_we_inspect" ADD CONSTRAINT "_pages_v_blocks_we_inspect_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_we_inspect_locales" ADD CONSTRAINT "_pages_v_blocks_we_inspect_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_we_inspect"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_best_price_order_idx" ON "pages_blocks_best_price" USING btree ("_order");
  CREATE INDEX "pages_blocks_best_price_parent_id_idx" ON "pages_blocks_best_price" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_best_price_path_idx" ON "pages_blocks_best_price" USING btree ("_path");
  CREATE INDEX "pages_blocks_best_price_image_idx" ON "pages_blocks_best_price" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_best_price_locales_locale_parent_id_unique" ON "pages_blocks_best_price_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_we_inspect_slides_order_idx" ON "pages_blocks_we_inspect_slides" USING btree ("_order");
  CREATE INDEX "pages_blocks_we_inspect_slides_parent_id_idx" ON "pages_blocks_we_inspect_slides" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_we_inspect_slides_image_idx" ON "pages_blocks_we_inspect_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_we_inspect_slides_locales_locale_parent_id_uniq" ON "pages_blocks_we_inspect_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_we_inspect_order_idx" ON "pages_blocks_we_inspect" USING btree ("_order");
  CREATE INDEX "pages_blocks_we_inspect_parent_id_idx" ON "pages_blocks_we_inspect" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_we_inspect_path_idx" ON "pages_blocks_we_inspect" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_we_inspect_locales_locale_parent_id_unique" ON "pages_blocks_we_inspect_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_best_price_order_idx" ON "_pages_v_blocks_best_price" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_best_price_parent_id_idx" ON "_pages_v_blocks_best_price" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_best_price_path_idx" ON "_pages_v_blocks_best_price" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_best_price_image_idx" ON "_pages_v_blocks_best_price" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_best_price_locales_locale_parent_id_unique" ON "_pages_v_blocks_best_price_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_we_inspect_slides_order_idx" ON "_pages_v_blocks_we_inspect_slides" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_we_inspect_slides_parent_id_idx" ON "_pages_v_blocks_we_inspect_slides" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_we_inspect_slides_image_idx" ON "_pages_v_blocks_we_inspect_slides" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_we_inspect_slides_locales_locale_parent_id_u" ON "_pages_v_blocks_we_inspect_slides_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_we_inspect_order_idx" ON "_pages_v_blocks_we_inspect" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_we_inspect_parent_id_idx" ON "_pages_v_blocks_we_inspect" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_we_inspect_path_idx" ON "_pages_v_blocks_we_inspect" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_we_inspect_locales_locale_parent_id_unique" ON "_pages_v_blocks_we_inspect_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_best_price" CASCADE;
  DROP TABLE "pages_blocks_best_price_locales" CASCADE;
  DROP TABLE "pages_blocks_we_inspect_slides" CASCADE;
  DROP TABLE "pages_blocks_we_inspect_slides_locales" CASCADE;
  DROP TABLE "pages_blocks_we_inspect" CASCADE;
  DROP TABLE "pages_blocks_we_inspect_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_best_price" CASCADE;
  DROP TABLE "_pages_v_blocks_best_price_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_we_inspect_slides" CASCADE;
  DROP TABLE "_pages_v_blocks_we_inspect_slides_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_we_inspect" CASCADE;
  DROP TABLE "_pages_v_blocks_we_inspect_locales" CASCADE;`)
}
