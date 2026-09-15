import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_personal_manager_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_personal_manager_chips_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_personal_manager" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_personal_manager_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_personal_manager_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_personal_manager_chips_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_personal_manager" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_personal_manager_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_personal_manager_chips" ADD CONSTRAINT "pages_blocks_personal_manager_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_personal_manager"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_personal_manager_chips_locales" ADD CONSTRAINT "pages_blocks_personal_manager_chips_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_personal_manager_chips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_personal_manager" ADD CONSTRAINT "pages_blocks_personal_manager_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_personal_manager" ADD CONSTRAINT "pages_blocks_personal_manager_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_personal_manager_locales" ADD CONSTRAINT "pages_blocks_personal_manager_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_personal_manager"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_personal_manager_chips" ADD CONSTRAINT "_pages_v_blocks_personal_manager_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_personal_manager"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_personal_manager_chips_locales" ADD CONSTRAINT "_pages_v_blocks_personal_manager_chips_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_personal_manager_chips"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_personal_manager" ADD CONSTRAINT "_pages_v_blocks_personal_manager_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_personal_manager" ADD CONSTRAINT "_pages_v_blocks_personal_manager_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_personal_manager_locales" ADD CONSTRAINT "_pages_v_blocks_personal_manager_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_personal_manager"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_personal_manager_chips_order_idx" ON "pages_blocks_personal_manager_chips" USING btree ("_order");
  CREATE INDEX "pages_blocks_personal_manager_chips_parent_id_idx" ON "pages_blocks_personal_manager_chips" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_personal_manager_chips_locales_locale_parent_id" ON "pages_blocks_personal_manager_chips_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_personal_manager_order_idx" ON "pages_blocks_personal_manager" USING btree ("_order");
  CREATE INDEX "pages_blocks_personal_manager_parent_id_idx" ON "pages_blocks_personal_manager" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_personal_manager_path_idx" ON "pages_blocks_personal_manager" USING btree ("_path");
  CREATE INDEX "pages_blocks_personal_manager_image_idx" ON "pages_blocks_personal_manager" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_personal_manager_locales_locale_parent_id_uniqu" ON "pages_blocks_personal_manager_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_personal_manager_chips_order_idx" ON "_pages_v_blocks_personal_manager_chips" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_personal_manager_chips_parent_id_idx" ON "_pages_v_blocks_personal_manager_chips" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_personal_manager_chips_locales_locale_parent" ON "_pages_v_blocks_personal_manager_chips_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_personal_manager_order_idx" ON "_pages_v_blocks_personal_manager" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_personal_manager_parent_id_idx" ON "_pages_v_blocks_personal_manager" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_personal_manager_path_idx" ON "_pages_v_blocks_personal_manager" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_personal_manager_image_idx" ON "_pages_v_blocks_personal_manager" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_personal_manager_locales_locale_parent_id_un" ON "_pages_v_blocks_personal_manager_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_personal_manager_chips" CASCADE;
  DROP TABLE "pages_blocks_personal_manager_chips_locales" CASCADE;
  DROP TABLE "pages_blocks_personal_manager" CASCADE;
  DROP TABLE "pages_blocks_personal_manager_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_personal_manager_chips" CASCADE;
  DROP TABLE "_pages_v_blocks_personal_manager_chips_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_personal_manager" CASCADE;
  DROP TABLE "_pages_v_blocks_personal_manager_locales" CASCADE;`)
}
