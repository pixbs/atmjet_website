import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_make_booking_variant" AS ENUM('plain', 'card');
  CREATE TYPE "public"."enum__pages_v_blocks_make_booking_variant" AS ENUM('plain', 'card');
  CREATE TABLE "pages_blocks_make_booking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_make_booking_variant" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_make_booking_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_transfer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_transfer_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_make_booking" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_make_booking_variant" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_make_booking_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_transfer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_transfer_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_make_booking" ADD CONSTRAINT "pages_blocks_make_booking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_make_booking_locales" ADD CONSTRAINT "pages_blocks_make_booking_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_make_booking"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_transfer" ADD CONSTRAINT "pages_blocks_transfer_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_transfer" ADD CONSTRAINT "pages_blocks_transfer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_transfer_locales" ADD CONSTRAINT "pages_blocks_transfer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_transfer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_make_booking" ADD CONSTRAINT "_pages_v_blocks_make_booking_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_make_booking_locales" ADD CONSTRAINT "_pages_v_blocks_make_booking_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_make_booking"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_transfer" ADD CONSTRAINT "_pages_v_blocks_transfer_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_transfer" ADD CONSTRAINT "_pages_v_blocks_transfer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_transfer_locales" ADD CONSTRAINT "_pages_v_blocks_transfer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_transfer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_make_booking_order_idx" ON "pages_blocks_make_booking" USING btree ("_order");
  CREATE INDEX "pages_blocks_make_booking_parent_id_idx" ON "pages_blocks_make_booking" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_make_booking_path_idx" ON "pages_blocks_make_booking" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_make_booking_locales_locale_parent_id_unique" ON "pages_blocks_make_booking_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_transfer_order_idx" ON "pages_blocks_transfer" USING btree ("_order");
  CREATE INDEX "pages_blocks_transfer_parent_id_idx" ON "pages_blocks_transfer" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_transfer_path_idx" ON "pages_blocks_transfer" USING btree ("_path");
  CREATE INDEX "pages_blocks_transfer_image_idx" ON "pages_blocks_transfer" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_transfer_locales_locale_parent_id_unique" ON "pages_blocks_transfer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_make_booking_order_idx" ON "_pages_v_blocks_make_booking" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_make_booking_parent_id_idx" ON "_pages_v_blocks_make_booking" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_make_booking_path_idx" ON "_pages_v_blocks_make_booking" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_make_booking_locales_locale_parent_id_unique" ON "_pages_v_blocks_make_booking_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_transfer_order_idx" ON "_pages_v_blocks_transfer" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_transfer_parent_id_idx" ON "_pages_v_blocks_transfer" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_transfer_path_idx" ON "_pages_v_blocks_transfer" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_transfer_image_idx" ON "_pages_v_blocks_transfer" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_transfer_locales_locale_parent_id_unique" ON "_pages_v_blocks_transfer_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_make_booking" CASCADE;
  DROP TABLE "pages_blocks_make_booking_locales" CASCADE;
  DROP TABLE "pages_blocks_transfer" CASCADE;
  DROP TABLE "pages_blocks_transfer_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_make_booking" CASCADE;
  DROP TABLE "_pages_v_blocks_make_booking_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_transfer" CASCADE;
  DROP TABLE "_pages_v_blocks_transfer_locales" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_make_booking_variant";
  DROP TYPE "public"."enum__pages_v_blocks_make_booking_variant";`)
}
