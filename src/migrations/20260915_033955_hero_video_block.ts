import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_hero_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"video" varchar,
  	"video_mobile" varchar,
  	"poster_id" integer,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_video_locales" (
  	"overline" varchar,
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_video" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"video" varchar,
  	"video_mobile" varchar,
  	"poster_id" integer,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_video_locales" (
  	"overline" varchar,
  	"title" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero_video" ADD CONSTRAINT "pages_blocks_hero_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_video" ADD CONSTRAINT "pages_blocks_hero_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_video_locales" ADD CONSTRAINT "pages_blocks_hero_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_video"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_video" ADD CONSTRAINT "_pages_v_blocks_hero_video_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_video" ADD CONSTRAINT "_pages_v_blocks_hero_video_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_video_locales" ADD CONSTRAINT "_pages_v_blocks_hero_video_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_video"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_video_order_idx" ON "pages_blocks_hero_video" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_video_parent_id_idx" ON "pages_blocks_hero_video" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_video_path_idx" ON "pages_blocks_hero_video" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_video_poster_idx" ON "pages_blocks_hero_video" USING btree ("poster_id");
  CREATE UNIQUE INDEX "pages_blocks_hero_video_locales_locale_parent_id_unique" ON "pages_blocks_hero_video_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_video_order_idx" ON "_pages_v_blocks_hero_video" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_video_parent_id_idx" ON "_pages_v_blocks_hero_video" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_video_path_idx" ON "_pages_v_blocks_hero_video" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_video_poster_idx" ON "_pages_v_blocks_hero_video" USING btree ("poster_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_video_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_video_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_hero_video" CASCADE;
  DROP TABLE "pages_blocks_hero_video_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_video" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_video_locales" CASCADE;`)
}
