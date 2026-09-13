import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_footer_socials" AS ENUM('telegram', 'whatsapp', 'instagram');
  CREATE TYPE "public"."enum_site_settings_enabled_locales" AS ENUM('en', 'ru', 'uk');
  CREATE TABLE "header_primary_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_id" integer
  );
  
  CREATE TABLE "header_primary_nav_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header_secondary_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_id" integer
  );
  
  CREATE TABLE "header_secondary_nav_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_source" varchar DEFAULT 'Header' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "header_locales" (
  	"cta_label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_primary_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_id" integer
  );
  
  CREATE TABLE "footer_primary_nav_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_secondary_nav" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"page_id" integer
  );
  
  CREATE TABLE "footer_secondary_nav_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_socials" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_footer_socials",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_source" varchar DEFAULT 'Footer' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"cta_label" varchar NOT NULL,
  	"legal_location" varchar NOT NULL,
  	"legal_copyright" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "site_settings_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"file_id" integer
  );
  
  CREATE TABLE "site_settings_enabled_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_enabled_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"phone" varchar DEFAULT '+971 (50) 458-99-26' NOT NULL,
  	"email" varchar DEFAULT 'info@atmjet.com' NOT NULL,
  	"telegram" varchar DEFAULT 'melentev1' NOT NULL,
  	"telegram_channel" varchar DEFAULT 'atmjet1' NOT NULL,
  	"whatsapp" varchar DEFAULT '+971 (50) 458-99-26' NOT NULL,
  	"instagram" varchar DEFAULT 'atmjet' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "header_primary_nav" ADD CONSTRAINT "header_primary_nav_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_primary_nav" ADD CONSTRAINT "header_primary_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_primary_nav_locales" ADD CONSTRAINT "header_primary_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_primary_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_secondary_nav" ADD CONSTRAINT "header_secondary_nav_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_secondary_nav" ADD CONSTRAINT "header_secondary_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_secondary_nav_locales" ADD CONSTRAINT "header_secondary_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header_secondary_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_locales" ADD CONSTRAINT "header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_primary_nav" ADD CONSTRAINT "footer_primary_nav_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_primary_nav" ADD CONSTRAINT "footer_primary_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_primary_nav_locales" ADD CONSTRAINT "footer_primary_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_primary_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_secondary_nav" ADD CONSTRAINT "footer_secondary_nav_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_secondary_nav" ADD CONSTRAINT "footer_secondary_nav_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_secondary_nav_locales" ADD CONSTRAINT "footer_secondary_nav_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_secondary_nav"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_socials" ADD CONSTRAINT "footer_socials_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_documents" ADD CONSTRAINT "site_settings_documents_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_documents" ADD CONSTRAINT "site_settings_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings_enabled_locales" ADD CONSTRAINT "site_settings_enabled_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "header_primary_nav_order_idx" ON "header_primary_nav" USING btree ("_order");
  CREATE INDEX "header_primary_nav_parent_id_idx" ON "header_primary_nav" USING btree ("_parent_id");
  CREATE INDEX "header_primary_nav_page_idx" ON "header_primary_nav" USING btree ("page_id");
  CREATE UNIQUE INDEX "header_primary_nav_locales_locale_parent_id_unique" ON "header_primary_nav_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "header_secondary_nav_order_idx" ON "header_secondary_nav" USING btree ("_order");
  CREATE INDEX "header_secondary_nav_parent_id_idx" ON "header_secondary_nav" USING btree ("_parent_id");
  CREATE INDEX "header_secondary_nav_page_idx" ON "header_secondary_nav" USING btree ("page_id");
  CREATE UNIQUE INDEX "header_secondary_nav_locales_locale_parent_id_unique" ON "header_secondary_nav_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "header_locales_locale_parent_id_unique" ON "header_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_primary_nav_order_idx" ON "footer_primary_nav" USING btree ("_order");
  CREATE INDEX "footer_primary_nav_parent_id_idx" ON "footer_primary_nav" USING btree ("_parent_id");
  CREATE INDEX "footer_primary_nav_page_idx" ON "footer_primary_nav" USING btree ("page_id");
  CREATE UNIQUE INDEX "footer_primary_nav_locales_locale_parent_id_unique" ON "footer_primary_nav_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_secondary_nav_order_idx" ON "footer_secondary_nav" USING btree ("_order");
  CREATE INDEX "footer_secondary_nav_parent_id_idx" ON "footer_secondary_nav" USING btree ("_parent_id");
  CREATE INDEX "footer_secondary_nav_page_idx" ON "footer_secondary_nav" USING btree ("page_id");
  CREATE UNIQUE INDEX "footer_secondary_nav_locales_locale_parent_id_unique" ON "footer_secondary_nav_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_socials_order_idx" ON "footer_socials" USING btree ("order");
  CREATE INDEX "footer_socials_parent_idx" ON "footer_socials" USING btree ("parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "site_settings_documents_order_idx" ON "site_settings_documents" USING btree ("_order");
  CREATE INDEX "site_settings_documents_parent_id_idx" ON "site_settings_documents" USING btree ("_parent_id");
  CREATE INDEX "site_settings_documents_locale_idx" ON "site_settings_documents" USING btree ("_locale");
  CREATE INDEX "site_settings_documents_file_idx" ON "site_settings_documents" USING btree ("file_id");
  CREATE INDEX "site_settings_enabled_locales_order_idx" ON "site_settings_enabled_locales" USING btree ("order");
  CREATE INDEX "site_settings_enabled_locales_parent_idx" ON "site_settings_enabled_locales" USING btree ("parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "header_primary_nav" CASCADE;
  DROP TABLE "header_primary_nav_locales" CASCADE;
  DROP TABLE "header_secondary_nav" CASCADE;
  DROP TABLE "header_secondary_nav_locales" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "header_locales" CASCADE;
  DROP TABLE "footer_primary_nav" CASCADE;
  DROP TABLE "footer_primary_nav_locales" CASCADE;
  DROP TABLE "footer_secondary_nav" CASCADE;
  DROP TABLE "footer_secondary_nav_locales" CASCADE;
  DROP TABLE "footer_socials" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "site_settings_documents" CASCADE;
  DROP TABLE "site_settings_enabled_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_footer_socials";
  DROP TYPE "public"."enum_site_settings_enabled_locales";`)
}
