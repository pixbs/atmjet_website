import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_privilege_cards_icon" AS ENUM('plane', 'exchange', 'diamond');
  CREATE TYPE "public"."enum__pages_v_blocks_privilege_cards_icon" AS ENUM('plane', 'exchange', 'diamond');
  CREATE TABLE "pages_blocks_privilege_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_privilege_cards_icon" DEFAULT 'plane'
  );
  
  CREATE TABLE "pages_blocks_privilege_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_privilege" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"contact_background_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_privilege_locales" (
  	"title" varchar,
  	"gold_title" varchar,
  	"contact_title" varchar,
  	"contact_description" varchar,
  	"contact_telegram" varchar,
  	"contact_whatsapp" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_privilege_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_privilege_cards_icon" DEFAULT 'plane',
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_privilege_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_privilege" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"contact_background_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_privilege_locales" (
  	"title" varchar,
  	"gold_title" varchar,
  	"contact_title" varchar,
  	"contact_description" varchar,
  	"contact_telegram" varchar,
  	"contact_whatsapp" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_privilege_cards" ADD CONSTRAINT "pages_blocks_privilege_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_privilege"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_privilege_cards_locales" ADD CONSTRAINT "pages_blocks_privilege_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_privilege_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_privilege" ADD CONSTRAINT "pages_blocks_privilege_contact_background_id_media_id_fk" FOREIGN KEY ("contact_background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_privilege" ADD CONSTRAINT "pages_blocks_privilege_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_privilege_locales" ADD CONSTRAINT "pages_blocks_privilege_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_privilege"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_privilege_cards" ADD CONSTRAINT "_pages_v_blocks_privilege_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_privilege"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_privilege_cards_locales" ADD CONSTRAINT "_pages_v_blocks_privilege_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_privilege_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_privilege" ADD CONSTRAINT "_pages_v_blocks_privilege_contact_background_id_media_id_fk" FOREIGN KEY ("contact_background_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_privilege" ADD CONSTRAINT "_pages_v_blocks_privilege_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_privilege_locales" ADD CONSTRAINT "_pages_v_blocks_privilege_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_privilege"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_privilege_cards_order_idx" ON "pages_blocks_privilege_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_privilege_cards_parent_id_idx" ON "pages_blocks_privilege_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_privilege_cards_locales_locale_parent_id_unique" ON "pages_blocks_privilege_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_privilege_order_idx" ON "pages_blocks_privilege" USING btree ("_order");
  CREATE INDEX "pages_blocks_privilege_parent_id_idx" ON "pages_blocks_privilege" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_privilege_path_idx" ON "pages_blocks_privilege" USING btree ("_path");
  CREATE INDEX "pages_blocks_privilege_contact_contact_background_idx" ON "pages_blocks_privilege" USING btree ("contact_background_id");
  CREATE UNIQUE INDEX "pages_blocks_privilege_locales_locale_parent_id_unique" ON "pages_blocks_privilege_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_privilege_cards_order_idx" ON "_pages_v_blocks_privilege_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_privilege_cards_parent_id_idx" ON "_pages_v_blocks_privilege_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_privilege_cards_locales_locale_parent_id_uni" ON "_pages_v_blocks_privilege_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_privilege_order_idx" ON "_pages_v_blocks_privilege" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_privilege_parent_id_idx" ON "_pages_v_blocks_privilege" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_privilege_path_idx" ON "_pages_v_blocks_privilege" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_privilege_contact_contact_background_idx" ON "_pages_v_blocks_privilege" USING btree ("contact_background_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_privilege_locales_locale_parent_id_unique" ON "_pages_v_blocks_privilege_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_privilege_cards" CASCADE;
  DROP TABLE "pages_blocks_privilege_cards_locales" CASCADE;
  DROP TABLE "pages_blocks_privilege" CASCADE;
  DROP TABLE "pages_blocks_privilege_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_privilege_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_privilege_cards_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_privilege" CASCADE;
  DROP TABLE "_pages_v_blocks_privilege_locales" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_privilege_cards_icon";
  DROP TYPE "public"."enum__pages_v_blocks_privilege_cards_icon";`)
}
