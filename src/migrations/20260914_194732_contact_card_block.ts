import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_contact_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_source" varchar DEFAULT 'Contact_us_aircraft',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_card_locales" (
  	"title" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_contact_card" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"cta_source" varchar DEFAULT 'Contact_us_aircraft',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_card_locales" (
  	"title" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_contact_card" ADD CONSTRAINT "pages_blocks_contact_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_card" ADD CONSTRAINT "pages_blocks_contact_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_card_locales" ADD CONSTRAINT "pages_blocks_contact_card_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_card"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_card" ADD CONSTRAINT "_pages_v_blocks_contact_card_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_card" ADD CONSTRAINT "_pages_v_blocks_contact_card_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_card_locales" ADD CONSTRAINT "_pages_v_blocks_contact_card_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_card"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_contact_card_order_idx" ON "pages_blocks_contact_card" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_card_parent_id_idx" ON "pages_blocks_contact_card" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_card_path_idx" ON "pages_blocks_contact_card" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_card_image_idx" ON "pages_blocks_contact_card" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_contact_card_locales_locale_parent_id_unique" ON "pages_blocks_contact_card_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_card_order_idx" ON "_pages_v_blocks_contact_card" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_card_parent_id_idx" ON "_pages_v_blocks_contact_card" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_card_path_idx" ON "_pages_v_blocks_contact_card" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_card_image_idx" ON "_pages_v_blocks_contact_card" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_contact_card_locales_locale_parent_id_unique" ON "_pages_v_blocks_contact_card_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_contact_card" CASCADE;
  DROP TABLE "pages_blocks_contact_card_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_card" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_card_locales" CASCADE;`)
}
