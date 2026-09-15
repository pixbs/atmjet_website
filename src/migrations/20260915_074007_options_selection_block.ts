import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_options_selection_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_options_selection_cards_items_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_options_selection_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_options_selection_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_options_selection" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_options_selection_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_options_selection_cards_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_options_selection_cards_items_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_options_selection_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_options_selection_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_options_selection" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_options_selection_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_options_selection_cards_items" ADD CONSTRAINT "pages_blocks_options_selection_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_options_selection_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_options_selection_cards_items_locales" ADD CONSTRAINT "pages_blocks_options_selection_cards_items_locales_parent_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_options_selection_cards_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_options_selection_cards" ADD CONSTRAINT "pages_blocks_options_selection_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_options_selection_cards" ADD CONSTRAINT "pages_blocks_options_selection_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_options_selection"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_options_selection_cards_locales" ADD CONSTRAINT "pages_blocks_options_selection_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_options_selection_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_options_selection" ADD CONSTRAINT "pages_blocks_options_selection_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_options_selection_locales" ADD CONSTRAINT "pages_blocks_options_selection_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_options_selection"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_options_selection_cards_items" ADD CONSTRAINT "_pages_v_blocks_options_selection_cards_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_options_selection_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_options_selection_cards_items_locales" ADD CONSTRAINT "_pages_v_blocks_options_selection_cards_items_locales_par_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_options_selection_cards_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_options_selection_cards" ADD CONSTRAINT "_pages_v_blocks_options_selection_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_options_selection_cards" ADD CONSTRAINT "_pages_v_blocks_options_selection_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_options_selection"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_options_selection_cards_locales" ADD CONSTRAINT "_pages_v_blocks_options_selection_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_options_selection_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_options_selection" ADD CONSTRAINT "_pages_v_blocks_options_selection_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_options_selection_locales" ADD CONSTRAINT "_pages_v_blocks_options_selection_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_options_selection"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_options_selection_cards_items_order_idx" ON "pages_blocks_options_selection_cards_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_options_selection_cards_items_parent_id_idx" ON "pages_blocks_options_selection_cards_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_options_selection_cards_items_locales_locale_pa" ON "pages_blocks_options_selection_cards_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_options_selection_cards_order_idx" ON "pages_blocks_options_selection_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_options_selection_cards_parent_id_idx" ON "pages_blocks_options_selection_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_options_selection_cards_image_idx" ON "pages_blocks_options_selection_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_options_selection_cards_locales_locale_parent_i" ON "pages_blocks_options_selection_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_options_selection_order_idx" ON "pages_blocks_options_selection" USING btree ("_order");
  CREATE INDEX "pages_blocks_options_selection_parent_id_idx" ON "pages_blocks_options_selection" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_options_selection_path_idx" ON "pages_blocks_options_selection" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_options_selection_locales_locale_parent_id_uniq" ON "pages_blocks_options_selection_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_options_selection_cards_items_order_idx" ON "_pages_v_blocks_options_selection_cards_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_options_selection_cards_items_parent_id_idx" ON "_pages_v_blocks_options_selection_cards_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_options_selection_cards_items_locales_locale" ON "_pages_v_blocks_options_selection_cards_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_options_selection_cards_order_idx" ON "_pages_v_blocks_options_selection_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_options_selection_cards_parent_id_idx" ON "_pages_v_blocks_options_selection_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_options_selection_cards_image_idx" ON "_pages_v_blocks_options_selection_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_options_selection_cards_locales_locale_paren" ON "_pages_v_blocks_options_selection_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_options_selection_order_idx" ON "_pages_v_blocks_options_selection" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_options_selection_parent_id_idx" ON "_pages_v_blocks_options_selection" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_options_selection_path_idx" ON "_pages_v_blocks_options_selection" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_options_selection_locales_locale_parent_id_u" ON "_pages_v_blocks_options_selection_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_options_selection_cards_items" CASCADE;
  DROP TABLE "pages_blocks_options_selection_cards_items_locales" CASCADE;
  DROP TABLE "pages_blocks_options_selection_cards" CASCADE;
  DROP TABLE "pages_blocks_options_selection_cards_locales" CASCADE;
  DROP TABLE "pages_blocks_options_selection" CASCADE;
  DROP TABLE "pages_blocks_options_selection_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_options_selection_cards_items" CASCADE;
  DROP TABLE "_pages_v_blocks_options_selection_cards_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_options_selection_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_options_selection_cards_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_options_selection" CASCADE;
  DROP TABLE "_pages_v_blocks_options_selection_locales" CASCADE;`)
}
