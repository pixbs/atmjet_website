import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_yachts_promo_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_yachts_promo_columns_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_yachts_promo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"invitation_image_id" integer,
  	"invitation_page_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_yachts_promo_locales" (
  	"title" varchar,
  	"description" varchar,
  	"invitation_title" varchar,
  	"invitation_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_yachts_promo_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_yachts_promo_columns_locales" (
  	"title" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_yachts_promo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"invitation_image_id" integer,
  	"invitation_page_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_yachts_promo_locales" (
  	"title" varchar,
  	"description" varchar,
  	"invitation_title" varchar,
  	"invitation_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_yachts_promo_columns" ADD CONSTRAINT "pages_blocks_yachts_promo_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_yachts_promo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_yachts_promo_columns_locales" ADD CONSTRAINT "pages_blocks_yachts_promo_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_yachts_promo_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_yachts_promo" ADD CONSTRAINT "pages_blocks_yachts_promo_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_yachts_promo" ADD CONSTRAINT "pages_blocks_yachts_promo_invitation_image_id_media_id_fk" FOREIGN KEY ("invitation_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_yachts_promo" ADD CONSTRAINT "pages_blocks_yachts_promo_invitation_page_id_pages_id_fk" FOREIGN KEY ("invitation_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_yachts_promo" ADD CONSTRAINT "pages_blocks_yachts_promo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_yachts_promo_locales" ADD CONSTRAINT "pages_blocks_yachts_promo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_yachts_promo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_yachts_promo_columns" ADD CONSTRAINT "_pages_v_blocks_yachts_promo_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_yachts_promo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_yachts_promo_columns_locales" ADD CONSTRAINT "_pages_v_blocks_yachts_promo_columns_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_yachts_promo_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_yachts_promo" ADD CONSTRAINT "_pages_v_blocks_yachts_promo_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_yachts_promo" ADD CONSTRAINT "_pages_v_blocks_yachts_promo_invitation_image_id_media_id_fk" FOREIGN KEY ("invitation_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_yachts_promo" ADD CONSTRAINT "_pages_v_blocks_yachts_promo_invitation_page_id_pages_id_fk" FOREIGN KEY ("invitation_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_yachts_promo" ADD CONSTRAINT "_pages_v_blocks_yachts_promo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_yachts_promo_locales" ADD CONSTRAINT "_pages_v_blocks_yachts_promo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_yachts_promo"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_yachts_promo_columns_order_idx" ON "pages_blocks_yachts_promo_columns" USING btree ("_order");
  CREATE INDEX "pages_blocks_yachts_promo_columns_parent_id_idx" ON "pages_blocks_yachts_promo_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_yachts_promo_columns_locales_locale_parent_id_u" ON "pages_blocks_yachts_promo_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_yachts_promo_order_idx" ON "pages_blocks_yachts_promo" USING btree ("_order");
  CREATE INDEX "pages_blocks_yachts_promo_parent_id_idx" ON "pages_blocks_yachts_promo" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_yachts_promo_path_idx" ON "pages_blocks_yachts_promo" USING btree ("_path");
  CREATE INDEX "pages_blocks_yachts_promo_image_idx" ON "pages_blocks_yachts_promo" USING btree ("image_id");
  CREATE INDEX "pages_blocks_yachts_promo_invitation_invitation_image_idx" ON "pages_blocks_yachts_promo" USING btree ("invitation_image_id");
  CREATE INDEX "pages_blocks_yachts_promo_invitation_invitation_page_idx" ON "pages_blocks_yachts_promo" USING btree ("invitation_page_id");
  CREATE UNIQUE INDEX "pages_blocks_yachts_promo_locales_locale_parent_id_unique" ON "pages_blocks_yachts_promo_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_yachts_promo_columns_order_idx" ON "_pages_v_blocks_yachts_promo_columns" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_yachts_promo_columns_parent_id_idx" ON "_pages_v_blocks_yachts_promo_columns" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_yachts_promo_columns_locales_locale_parent_i" ON "_pages_v_blocks_yachts_promo_columns_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_yachts_promo_order_idx" ON "_pages_v_blocks_yachts_promo" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_yachts_promo_parent_id_idx" ON "_pages_v_blocks_yachts_promo" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_yachts_promo_path_idx" ON "_pages_v_blocks_yachts_promo" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_yachts_promo_image_idx" ON "_pages_v_blocks_yachts_promo" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_yachts_promo_invitation_invitation_image_idx" ON "_pages_v_blocks_yachts_promo" USING btree ("invitation_image_id");
  CREATE INDEX "_pages_v_blocks_yachts_promo_invitation_invitation_page_idx" ON "_pages_v_blocks_yachts_promo" USING btree ("invitation_page_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_yachts_promo_locales_locale_parent_id_unique" ON "_pages_v_blocks_yachts_promo_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_yachts_promo_columns" CASCADE;
  DROP TABLE "pages_blocks_yachts_promo_columns_locales" CASCADE;
  DROP TABLE "pages_blocks_yachts_promo" CASCADE;
  DROP TABLE "pages_blocks_yachts_promo_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_yachts_promo_columns" CASCADE;
  DROP TABLE "_pages_v_blocks_yachts_promo_columns_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_yachts_promo" CASCADE;
  DROP TABLE "_pages_v_blocks_yachts_promo_locales" CASCADE;`)
}
