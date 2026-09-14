import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_documents_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_documents_documents_locales" (
  	"title" varchar,
  	"label" varchar,
  	"file_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_guide_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_guide_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_guide" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_guide_locales" (
  	"title" varchar,
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_documents_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_documents_documents_locales" (
  	"title" varchar,
  	"label" varchar,
  	"file_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_guide_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_guide_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_guide" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_guide_locales" (
  	"title" varchar,
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_documents_documents" ADD CONSTRAINT "pages_blocks_documents_documents_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_documents" ADD CONSTRAINT "pages_blocks_documents_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_documents_locales" ADD CONSTRAINT "pages_blocks_documents_documents_locales_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents_documents_locales" ADD CONSTRAINT "pages_blocks_documents_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_documents_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_documents" ADD CONSTRAINT "pages_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_guide_points" ADD CONSTRAINT "pages_blocks_guide_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_guide"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_guide_points_locales" ADD CONSTRAINT "pages_blocks_guide_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_guide_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_guide" ADD CONSTRAINT "pages_blocks_guide_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_guide" ADD CONSTRAINT "pages_blocks_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_guide_locales" ADD CONSTRAINT "pages_blocks_guide_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_guide"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_documents" ADD CONSTRAINT "_pages_v_blocks_documents_documents_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_documents" ADD CONSTRAINT "_pages_v_blocks_documents_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_documents_locales" ADD CONSTRAINT "_pages_v_blocks_documents_documents_locales_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents_documents_locales" ADD CONSTRAINT "_pages_v_blocks_documents_documents_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_documents_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_documents" ADD CONSTRAINT "_pages_v_blocks_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_guide_points" ADD CONSTRAINT "_pages_v_blocks_guide_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_guide"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_guide_points_locales" ADD CONSTRAINT "_pages_v_blocks_guide_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_guide_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_guide" ADD CONSTRAINT "_pages_v_blocks_guide_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_guide" ADD CONSTRAINT "_pages_v_blocks_guide_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_guide_locales" ADD CONSTRAINT "_pages_v_blocks_guide_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_guide"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_documents_documents_order_idx" ON "pages_blocks_documents_documents" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_documents_parent_id_idx" ON "pages_blocks_documents_documents" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_documents_image_idx" ON "pages_blocks_documents_documents" USING btree ("image_id");
  CREATE INDEX "pages_blocks_documents_documents_file_idx" ON "pages_blocks_documents_documents_locales" USING btree ("file_id","_locale");
  CREATE UNIQUE INDEX "pages_blocks_documents_documents_locales_locale_parent_id_un" ON "pages_blocks_documents_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_documents_order_idx" ON "pages_blocks_documents" USING btree ("_order");
  CREATE INDEX "pages_blocks_documents_parent_id_idx" ON "pages_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_documents_path_idx" ON "pages_blocks_documents" USING btree ("_path");
  CREATE INDEX "pages_blocks_guide_points_order_idx" ON "pages_blocks_guide_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_guide_points_parent_id_idx" ON "pages_blocks_guide_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_guide_points_locales_locale_parent_id_unique" ON "pages_blocks_guide_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_guide_order_idx" ON "pages_blocks_guide" USING btree ("_order");
  CREATE INDEX "pages_blocks_guide_parent_id_idx" ON "pages_blocks_guide" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_guide_path_idx" ON "pages_blocks_guide" USING btree ("_path");
  CREATE INDEX "pages_blocks_guide_image_idx" ON "pages_blocks_guide" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_guide_locales_locale_parent_id_unique" ON "pages_blocks_guide_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_documents_order_idx" ON "_pages_v_blocks_documents_documents" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_documents_parent_id_idx" ON "_pages_v_blocks_documents_documents" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_documents_image_idx" ON "_pages_v_blocks_documents_documents" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_documents_documents_file_idx" ON "_pages_v_blocks_documents_documents_locales" USING btree ("file_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_blocks_documents_documents_locales_locale_parent_id" ON "_pages_v_blocks_documents_documents_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_order_idx" ON "_pages_v_blocks_documents" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_documents_parent_id_idx" ON "_pages_v_blocks_documents" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_documents_path_idx" ON "_pages_v_blocks_documents" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_guide_points_order_idx" ON "_pages_v_blocks_guide_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_guide_points_parent_id_idx" ON "_pages_v_blocks_guide_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_guide_points_locales_locale_parent_id_unique" ON "_pages_v_blocks_guide_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_guide_order_idx" ON "_pages_v_blocks_guide" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_guide_parent_id_idx" ON "_pages_v_blocks_guide" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_guide_path_idx" ON "_pages_v_blocks_guide" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_guide_image_idx" ON "_pages_v_blocks_guide" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_guide_locales_locale_parent_id_unique" ON "_pages_v_blocks_guide_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_documents_documents" CASCADE;
  DROP TABLE "pages_blocks_documents_documents_locales" CASCADE;
  DROP TABLE "pages_blocks_documents" CASCADE;
  DROP TABLE "pages_blocks_guide_points" CASCADE;
  DROP TABLE "pages_blocks_guide_points_locales" CASCADE;
  DROP TABLE "pages_blocks_guide" CASCADE;
  DROP TABLE "pages_blocks_guide_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_documents_documents" CASCADE;
  DROP TABLE "_pages_v_blocks_documents_documents_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_documents" CASCADE;
  DROP TABLE "_pages_v_blocks_guide_points" CASCADE;
  DROP TABLE "_pages_v_blocks_guide_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_guide" CASCADE;
  DROP TABLE "_pages_v_blocks_guide_locales" CASCADE;`)
}
