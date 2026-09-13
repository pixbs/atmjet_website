import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_yachts_listing_type" AS ENUM('charter', 'sale');
  CREATE TYPE "public"."enum_yachts_charter_currency" AS ENUM('AED', 'USD', 'EUR');
  CREATE TYPE "public"."enum_yachts_sale_currency" AS ENUM('AED', 'USD', 'EUR');
  CREATE TYPE "public"."enum_yachts_provenance_origin" AS ENUM('new-yachts-charter', 'yachts-sale', 'manual');
  CREATE TYPE "public"."enum_yachts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__yachts_v_version_listing_type" AS ENUM('charter', 'sale');
  CREATE TYPE "public"."enum__yachts_v_version_charter_currency" AS ENUM('AED', 'USD', 'EUR');
  CREATE TYPE "public"."enum__yachts_v_version_sale_currency" AS ENUM('AED', 'USD', 'EUR');
  CREATE TYPE "public"."enum__yachts_v_version_provenance_origin" AS ENUM('new-yachts-charter', 'yachts-sale', 'manual');
  CREATE TYPE "public"."enum__yachts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__yachts_v_published_locale" AS ENUM('en', 'ru', 'uk');
  CREATE TABLE "yachts_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"external_url" varchar
  );
  
  CREATE TABLE "yachts_photos_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "yachts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"listing_type" "enum_yachts_listing_type" DEFAULT 'charter',
  	"slug" varchar,
  	"length" numeric,
  	"charter_manufacturer" varchar,
  	"charter_owner" varchar,
  	"charter_customer_price" numeric,
  	"charter_business_price" numeric,
  	"charter_currency" "enum_yachts_charter_currency",
  	"charter_min_hours" numeric,
  	"charter_guests_day" numeric,
  	"charter_guests_night" numeric,
  	"charter_cabins" varchar,
  	"charter_bathrooms" varchar,
  	"charter_refit" numeric,
  	"sale_shipyard" varchar,
  	"sale_year" numeric,
  	"sale_price" numeric,
  	"sale_currency" "enum_yachts_sale_currency",
  	"sale_beam" numeric,
  	"sale_draft" numeric,
  	"sale_cabins" numeric,
  	"sale_guests" numeric,
  	"sale_crew" numeric,
  	"sale_cruising_speed" numeric,
  	"sale_max_speed" numeric,
  	"contact_id" integer,
  	"captain_id" integer,
  	"legacy_attributes" jsonb,
  	"provenance_origin" "enum_yachts_provenance_origin" DEFAULT 'manual',
  	"provenance_legacy_id" numeric,
  	"provenance_legacy_slug" varchar,
  	"provenance_import_run_id" varchar,
  	"provenance_imported_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_yachts_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "yachts_locales" (
  	"location" varchar,
  	"description" varchar,
  	"charter_included" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_yachts_v_version_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_id" integer,
  	"external_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_yachts_v_version_photos_locales" (
  	"alt" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_yachts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar,
  	"version_listing_type" "enum__yachts_v_version_listing_type" DEFAULT 'charter',
  	"version_slug" varchar,
  	"version_length" numeric,
  	"version_charter_manufacturer" varchar,
  	"version_charter_owner" varchar,
  	"version_charter_customer_price" numeric,
  	"version_charter_business_price" numeric,
  	"version_charter_currency" "enum__yachts_v_version_charter_currency",
  	"version_charter_min_hours" numeric,
  	"version_charter_guests_day" numeric,
  	"version_charter_guests_night" numeric,
  	"version_charter_cabins" varchar,
  	"version_charter_bathrooms" varchar,
  	"version_charter_refit" numeric,
  	"version_sale_shipyard" varchar,
  	"version_sale_year" numeric,
  	"version_sale_price" numeric,
  	"version_sale_currency" "enum__yachts_v_version_sale_currency",
  	"version_sale_beam" numeric,
  	"version_sale_draft" numeric,
  	"version_sale_cabins" numeric,
  	"version_sale_guests" numeric,
  	"version_sale_crew" numeric,
  	"version_sale_cruising_speed" numeric,
  	"version_sale_max_speed" numeric,
  	"version_contact_id" integer,
  	"version_captain_id" integer,
  	"version_legacy_attributes" jsonb,
  	"version_provenance_origin" "enum__yachts_v_version_provenance_origin" DEFAULT 'manual',
  	"version_provenance_legacy_id" numeric,
  	"version_provenance_legacy_slug" varchar,
  	"version_provenance_import_run_id" varchar,
  	"version_provenance_imported_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__yachts_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__yachts_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_yachts_v_locales" (
  	"version_location" varchar,
  	"version_description" varchar,
  	"version_charter_included" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "yachts_id" integer;
  ALTER TABLE "yachts_photos" ADD CONSTRAINT "yachts_photos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yachts_photos" ADD CONSTRAINT "yachts_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."yachts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yachts_photos_locales" ADD CONSTRAINT "yachts_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."yachts_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "yachts" ADD CONSTRAINT "yachts_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yachts" ADD CONSTRAINT "yachts_captain_id_contacts_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "yachts_locales" ADD CONSTRAINT "yachts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."yachts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_yachts_v_version_photos" ADD CONSTRAINT "_yachts_v_version_photos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_yachts_v_version_photos" ADD CONSTRAINT "_yachts_v_version_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_yachts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_yachts_v_version_photos_locales" ADD CONSTRAINT "_yachts_v_version_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_yachts_v_version_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_yachts_v" ADD CONSTRAINT "_yachts_v_parent_id_yachts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."yachts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_yachts_v" ADD CONSTRAINT "_yachts_v_version_contact_id_contacts_id_fk" FOREIGN KEY ("version_contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_yachts_v" ADD CONSTRAINT "_yachts_v_version_captain_id_contacts_id_fk" FOREIGN KEY ("version_captain_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_yachts_v_locales" ADD CONSTRAINT "_yachts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_yachts_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "yachts_photos_order_idx" ON "yachts_photos" USING btree ("_order");
  CREATE INDEX "yachts_photos_parent_id_idx" ON "yachts_photos" USING btree ("_parent_id");
  CREATE INDEX "yachts_photos_media_idx" ON "yachts_photos" USING btree ("media_id");
  CREATE UNIQUE INDEX "yachts_photos_locales_locale_parent_id_unique" ON "yachts_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "yachts_name_idx" ON "yachts" USING btree ("name");
  CREATE INDEX "yachts_listing_type_idx" ON "yachts" USING btree ("listing_type");
  CREATE UNIQUE INDEX "yachts_slug_idx" ON "yachts" USING btree ("slug");
  CREATE INDEX "yachts_length_idx" ON "yachts" USING btree ("length");
  CREATE INDEX "yachts_charter_charter_manufacturer_idx" ON "yachts" USING btree ("charter_manufacturer");
  CREATE INDEX "yachts_charter_charter_customer_price_idx" ON "yachts" USING btree ("charter_customer_price");
  CREATE INDEX "yachts_charter_charter_guests_day_idx" ON "yachts" USING btree ("charter_guests_day");
  CREATE INDEX "yachts_sale_sale_shipyard_idx" ON "yachts" USING btree ("sale_shipyard");
  CREATE INDEX "yachts_sale_sale_year_idx" ON "yachts" USING btree ("sale_year");
  CREATE INDEX "yachts_sale_sale_price_idx" ON "yachts" USING btree ("sale_price");
  CREATE INDEX "yachts_sale_sale_guests_idx" ON "yachts" USING btree ("sale_guests");
  CREATE INDEX "yachts_contact_idx" ON "yachts" USING btree ("contact_id");
  CREATE INDEX "yachts_captain_idx" ON "yachts" USING btree ("captain_id");
  CREATE INDEX "yachts_provenance_provenance_origin_idx" ON "yachts" USING btree ("provenance_origin");
  CREATE INDEX "yachts_provenance_provenance_legacy_id_idx" ON "yachts" USING btree ("provenance_legacy_id");
  CREATE INDEX "yachts_provenance_provenance_legacy_slug_idx" ON "yachts" USING btree ("provenance_legacy_slug");
  CREATE INDEX "yachts_provenance_provenance_import_run_id_idx" ON "yachts" USING btree ("provenance_import_run_id");
  CREATE INDEX "yachts_updated_at_idx" ON "yachts" USING btree ("updated_at");
  CREATE INDEX "yachts_created_at_idx" ON "yachts" USING btree ("created_at");
  CREATE INDEX "yachts__status_idx" ON "yachts" USING btree ("_status");
  CREATE INDEX "yachts_location_idx" ON "yachts_locales" USING btree ("location","_locale");
  CREATE UNIQUE INDEX "yachts_locales_locale_parent_id_unique" ON "yachts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_yachts_v_version_photos_order_idx" ON "_yachts_v_version_photos" USING btree ("_order");
  CREATE INDEX "_yachts_v_version_photos_parent_id_idx" ON "_yachts_v_version_photos" USING btree ("_parent_id");
  CREATE INDEX "_yachts_v_version_photos_media_idx" ON "_yachts_v_version_photos" USING btree ("media_id");
  CREATE UNIQUE INDEX "_yachts_v_version_photos_locales_locale_parent_id_unique" ON "_yachts_v_version_photos_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_yachts_v_parent_idx" ON "_yachts_v" USING btree ("parent_id");
  CREATE INDEX "_yachts_v_version_version_name_idx" ON "_yachts_v" USING btree ("version_name");
  CREATE INDEX "_yachts_v_version_version_listing_type_idx" ON "_yachts_v" USING btree ("version_listing_type");
  CREATE INDEX "_yachts_v_version_version_slug_idx" ON "_yachts_v" USING btree ("version_slug");
  CREATE INDEX "_yachts_v_version_version_length_idx" ON "_yachts_v" USING btree ("version_length");
  CREATE INDEX "_yachts_v_version_charter_version_charter_manufacturer_idx" ON "_yachts_v" USING btree ("version_charter_manufacturer");
  CREATE INDEX "_yachts_v_version_charter_version_charter_customer_price_idx" ON "_yachts_v" USING btree ("version_charter_customer_price");
  CREATE INDEX "_yachts_v_version_charter_version_charter_guests_day_idx" ON "_yachts_v" USING btree ("version_charter_guests_day");
  CREATE INDEX "_yachts_v_version_sale_version_sale_shipyard_idx" ON "_yachts_v" USING btree ("version_sale_shipyard");
  CREATE INDEX "_yachts_v_version_sale_version_sale_year_idx" ON "_yachts_v" USING btree ("version_sale_year");
  CREATE INDEX "_yachts_v_version_sale_version_sale_price_idx" ON "_yachts_v" USING btree ("version_sale_price");
  CREATE INDEX "_yachts_v_version_sale_version_sale_guests_idx" ON "_yachts_v" USING btree ("version_sale_guests");
  CREATE INDEX "_yachts_v_version_version_contact_idx" ON "_yachts_v" USING btree ("version_contact_id");
  CREATE INDEX "_yachts_v_version_version_captain_idx" ON "_yachts_v" USING btree ("version_captain_id");
  CREATE INDEX "_yachts_v_version_provenance_version_provenance_origin_idx" ON "_yachts_v" USING btree ("version_provenance_origin");
  CREATE INDEX "_yachts_v_version_provenance_version_provenance_legacy_i_idx" ON "_yachts_v" USING btree ("version_provenance_legacy_id");
  CREATE INDEX "_yachts_v_version_provenance_version_provenance_legacy_s_idx" ON "_yachts_v" USING btree ("version_provenance_legacy_slug");
  CREATE INDEX "_yachts_v_version_provenance_version_provenance_import_r_idx" ON "_yachts_v" USING btree ("version_provenance_import_run_id");
  CREATE INDEX "_yachts_v_version_version_updated_at_idx" ON "_yachts_v" USING btree ("version_updated_at");
  CREATE INDEX "_yachts_v_version_version_created_at_idx" ON "_yachts_v" USING btree ("version_created_at");
  CREATE INDEX "_yachts_v_version_version__status_idx" ON "_yachts_v" USING btree ("version__status");
  CREATE INDEX "_yachts_v_created_at_idx" ON "_yachts_v" USING btree ("created_at");
  CREATE INDEX "_yachts_v_updated_at_idx" ON "_yachts_v" USING btree ("updated_at");
  CREATE INDEX "_yachts_v_snapshot_idx" ON "_yachts_v" USING btree ("snapshot");
  CREATE INDEX "_yachts_v_published_locale_idx" ON "_yachts_v" USING btree ("published_locale");
  CREATE INDEX "_yachts_v_latest_idx" ON "_yachts_v" USING btree ("latest");
  CREATE INDEX "_yachts_v_version_version_location_idx" ON "_yachts_v_locales" USING btree ("version_location","_locale");
  CREATE UNIQUE INDEX "_yachts_v_locales_locale_parent_id_unique" ON "_yachts_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_yachts_fk" FOREIGN KEY ("yachts_id") REFERENCES "public"."yachts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_yachts_id_idx" ON "payload_locked_documents_rels" USING btree ("yachts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "yachts_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yachts_photos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yachts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "yachts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_yachts_v_version_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_yachts_v_version_photos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_yachts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_yachts_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "yachts_photos" CASCADE;
  DROP TABLE "yachts_photos_locales" CASCADE;
  DROP TABLE "yachts" CASCADE;
  DROP TABLE "yachts_locales" CASCADE;
  DROP TABLE "_yachts_v_version_photos" CASCADE;
  DROP TABLE "_yachts_v_version_photos_locales" CASCADE;
  DROP TABLE "_yachts_v" CASCADE;
  DROP TABLE "_yachts_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_yachts_fk";
  
  DROP INDEX "payload_locked_documents_rels_yachts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "yachts_id";
  DROP TYPE "public"."enum_yachts_listing_type";
  DROP TYPE "public"."enum_yachts_charter_currency";
  DROP TYPE "public"."enum_yachts_sale_currency";
  DROP TYPE "public"."enum_yachts_provenance_origin";
  DROP TYPE "public"."enum_yachts_status";
  DROP TYPE "public"."enum__yachts_v_version_listing_type";
  DROP TYPE "public"."enum__yachts_v_version_charter_currency";
  DROP TYPE "public"."enum__yachts_v_version_sale_currency";
  DROP TYPE "public"."enum__yachts_v_version_provenance_origin";
  DROP TYPE "public"."enum__yachts_v_version_status";
  DROP TYPE "public"."enum__yachts_v_published_locale";`)
}
