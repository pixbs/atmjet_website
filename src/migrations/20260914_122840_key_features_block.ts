import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_key_features_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer
  );
  
  CREATE TABLE "pages_blocks_key_features_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_key_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_key_features_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_key_features_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_key_features_cards_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_key_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_key_features_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_key_features_cards" ADD CONSTRAINT "pages_blocks_key_features_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_key_features_cards" ADD CONSTRAINT "pages_blocks_key_features_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_key_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_key_features_cards_locales" ADD CONSTRAINT "pages_blocks_key_features_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_key_features_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_key_features" ADD CONSTRAINT "pages_blocks_key_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_key_features_locales" ADD CONSTRAINT "pages_blocks_key_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_key_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_key_features_cards" ADD CONSTRAINT "_pages_v_blocks_key_features_cards_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_key_features_cards" ADD CONSTRAINT "_pages_v_blocks_key_features_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_key_features"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_key_features_cards_locales" ADD CONSTRAINT "_pages_v_blocks_key_features_cards_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_key_features_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_key_features" ADD CONSTRAINT "_pages_v_blocks_key_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_key_features_locales" ADD CONSTRAINT "_pages_v_blocks_key_features_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_key_features"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_key_features_cards_order_idx" ON "pages_blocks_key_features_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_key_features_cards_parent_id_idx" ON "pages_blocks_key_features_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_key_features_cards_image_idx" ON "pages_blocks_key_features_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX "pages_blocks_key_features_cards_locales_locale_parent_id_uni" ON "pages_blocks_key_features_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_key_features_order_idx" ON "pages_blocks_key_features" USING btree ("_order");
  CREATE INDEX "pages_blocks_key_features_parent_id_idx" ON "pages_blocks_key_features" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_key_features_path_idx" ON "pages_blocks_key_features" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_key_features_locales_locale_parent_id_unique" ON "pages_blocks_key_features_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_key_features_cards_order_idx" ON "_pages_v_blocks_key_features_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_key_features_cards_parent_id_idx" ON "_pages_v_blocks_key_features_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_key_features_cards_image_idx" ON "_pages_v_blocks_key_features_cards" USING btree ("image_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_key_features_cards_locales_locale_parent_id_" ON "_pages_v_blocks_key_features_cards_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_key_features_order_idx" ON "_pages_v_blocks_key_features" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_key_features_parent_id_idx" ON "_pages_v_blocks_key_features" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_key_features_path_idx" ON "_pages_v_blocks_key_features" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_key_features_locales_locale_parent_id_unique" ON "_pages_v_blocks_key_features_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_key_features_cards" CASCADE;
  DROP TABLE "pages_blocks_key_features_cards_locales" CASCADE;
  DROP TABLE "pages_blocks_key_features" CASCADE;
  DROP TABLE "pages_blocks_key_features_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_key_features_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_key_features_cards_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_key_features" CASCADE;
  DROP TABLE "_pages_v_blocks_key_features_locales" CASCADE;`)
}
