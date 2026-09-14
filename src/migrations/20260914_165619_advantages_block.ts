import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_advantages_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_advantages_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_advantages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_advantages_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_advantages_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_advantages_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_advantages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_advantages_locales" (
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_advantages_cards" ADD CONSTRAINT "pages_blocks_advantages_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_advantages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_advantages_cards_locales" ADD CONSTRAINT "pages_blocks_advantages_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_advantages_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_advantages" ADD CONSTRAINT "pages_blocks_advantages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_advantages" ADD CONSTRAINT "pages_blocks_advantages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_advantages_locales" ADD CONSTRAINT "pages_blocks_advantages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_advantages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_advantages_cards" ADD CONSTRAINT "_pages_v_blocks_advantages_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_advantages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_advantages_cards_locales" ADD CONSTRAINT "_pages_v_blocks_advantages_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_advantages_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_advantages" ADD CONSTRAINT "_pages_v_blocks_advantages_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_advantages" ADD CONSTRAINT "_pages_v_blocks_advantages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_advantages_locales" ADD CONSTRAINT "_pages_v_blocks_advantages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_advantages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_advantages_cards_order_idx" ON "pages_blocks_advantages_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_advantages_cards_parent_id_idx" ON "pages_blocks_advantages_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_advantages_cards_locales_locale_parent_id_uniqu" ON "pages_blocks_advantages_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_advantages_order_idx" ON "pages_blocks_advantages" USING btree ("_order");
  CREATE INDEX "pages_blocks_advantages_parent_id_idx" ON "pages_blocks_advantages" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_advantages_path_idx" ON "pages_blocks_advantages" USING btree ("_path");
  CREATE INDEX "pages_blocks_advantages_image_idx" ON "pages_blocks_advantages" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_advantages_locales_locale_parent_id_unique" ON "pages_blocks_advantages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_advantages_cards_order_idx" ON "_pages_v_blocks_advantages_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_advantages_cards_parent_id_idx" ON "_pages_v_blocks_advantages_cards" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_advantages_cards_locales_locale_parent_id_un" ON "_pages_v_blocks_advantages_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_advantages_order_idx" ON "_pages_v_blocks_advantages" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_advantages_parent_id_idx" ON "_pages_v_blocks_advantages" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_advantages_path_idx" ON "_pages_v_blocks_advantages" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_advantages_image_idx" ON "_pages_v_blocks_advantages" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_advantages_locales_locale_parent_id_unique" ON "_pages_v_blocks_advantages_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_advantages_cards" CASCADE;
  DROP TABLE "pages_blocks_advantages_cards_locales" CASCADE;
  DROP TABLE "pages_blocks_advantages" CASCADE;
  DROP TABLE "pages_blocks_advantages_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_advantages_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_advantages_cards_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_advantages" CASCADE;
  DROP TABLE "_pages_v_blocks_advantages_locales" CASCADE;`)
}
