import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_aircraft_v_version_offerings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_aircraft_v_version_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_aircraft_v_version_provenance_merged_from" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_aircraft_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_aircraft_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_yachts_v_version_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_yachts_v_version_photos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_yachts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_yachts_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_empty_legs_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_aircraft_v_version_offerings" CASCADE;
  DROP TABLE "_aircraft_v_version_images" CASCADE;
  DROP TABLE "_aircraft_v_version_provenance_merged_from" CASCADE;
  DROP TABLE "_aircraft_v" CASCADE;
  DROP TABLE "_aircraft_v_locales" CASCADE;
  DROP TABLE "_yachts_v_version_photos" CASCADE;
  DROP TABLE "_yachts_v_version_photos_locales" CASCADE;
  DROP TABLE "_yachts_v" CASCADE;
  DROP TABLE "_yachts_v_locales" CASCADE;
  DROP TABLE "_empty_legs_v" CASCADE;
  DROP INDEX "aircraft__status_idx";
  DROP INDEX "yachts__status_idx";
  DROP INDEX "empty_legs__status_idx";
  ALTER TABLE "aircraft_images" ALTER COLUMN "type" SET NOT NULL;
  ALTER TABLE "aircraft_provenance_merged_from" ALTER COLUMN "table" SET NOT NULL;
  ALTER TABLE "aircraft" ALTER COLUMN "registration_display" SET NOT NULL;
  ALTER TABLE "aircraft" ALTER COLUMN "provenance_origin" SET NOT NULL;
  ALTER TABLE "yachts" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "yachts" ALTER COLUMN "listing_type" SET NOT NULL;
  ALTER TABLE "yachts" ALTER COLUMN "provenance_origin" SET NOT NULL;
  ALTER TABLE "empty_legs" ALTER COLUMN "departure_at" SET NOT NULL;
  ALTER TABLE "empty_legs" ALTER COLUMN "provenance_origin" SET NOT NULL;
  ALTER TABLE "aircraft" DROP COLUMN "_status";
  ALTER TABLE "yachts" DROP COLUMN "_status";
  ALTER TABLE "empty_legs" DROP COLUMN "_status";
  DROP TYPE "public"."enum_aircraft_status";
  DROP TYPE "public"."enum__aircraft_v_version_offerings";
  DROP TYPE "public"."enum__aircraft_v_version_images_type";
  DROP TYPE "public"."enum__aircraft_v_version_availability";
  DROP TYPE "public"."enum__aircraft_v_version_provenance_origin";
  DROP TYPE "public"."enum__aircraft_v_version_status";
  DROP TYPE "public"."enum__aircraft_v_published_locale";
  DROP TYPE "public"."enum_yachts_status";
  DROP TYPE "public"."enum__yachts_v_version_listing_type";
  DROP TYPE "public"."enum__yachts_v_version_charter_currency";
  DROP TYPE "public"."enum__yachts_v_version_sale_currency";
  DROP TYPE "public"."enum__yachts_v_version_provenance_origin";
  DROP TYPE "public"."enum__yachts_v_version_status";
  DROP TYPE "public"."enum__yachts_v_published_locale";
  DROP TYPE "public"."enum_empty_legs_status";
  DROP TYPE "public"."enum__empty_legs_v_version_currency";
  DROP TYPE "public"."enum__empty_legs_v_version_provenance_origin";
  DROP TYPE "public"."enum__empty_legs_v_version_status";
  DROP TYPE "public"."enum__empty_legs_v_published_locale";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_aircraft_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__aircraft_v_version_offerings" AS ENUM('charter', 'sale', 'lease', 'cargo');
  CREATE TYPE "public"."enum__aircraft_v_version_images_type" AS ENUM('exterior', 'cabin', 'cockpit');
  CREATE TYPE "public"."enum__aircraft_v_version_availability" AS ENUM('available', 'unavailable');
  CREATE TYPE "public"."enum__aircraft_v_version_provenance_origin" AS ENUM('aircrafts-catalog', 'vehicles-legacy', 'manual');
  CREATE TYPE "public"."enum__aircraft_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__aircraft_v_published_locale" AS ENUM('en', 'ru', 'uk');
  CREATE TYPE "public"."enum_yachts_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__yachts_v_version_listing_type" AS ENUM('charter', 'sale');
  CREATE TYPE "public"."enum__yachts_v_version_charter_currency" AS ENUM('AED', 'USD', 'EUR');
  CREATE TYPE "public"."enum__yachts_v_version_sale_currency" AS ENUM('AED', 'USD', 'EUR');
  CREATE TYPE "public"."enum__yachts_v_version_provenance_origin" AS ENUM('new-yachts-charter', 'yachts-sale', 'manual');
  CREATE TYPE "public"."enum__yachts_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__yachts_v_published_locale" AS ENUM('en', 'ru', 'uk');
  CREATE TYPE "public"."enum_empty_legs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__empty_legs_v_version_currency" AS ENUM('USD', 'EUR', 'AED');
  CREATE TYPE "public"."enum__empty_legs_v_version_provenance_origin" AS ENUM('empty-legs-legacy', 'manual');
  CREATE TYPE "public"."enum__empty_legs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__empty_legs_v_published_locale" AS ENUM('en', 'ru', 'uk');
  CREATE TABLE "_aircraft_v_version_offerings" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__aircraft_v_version_offerings",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_aircraft_v_version_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__aircraft_v_version_images_type" DEFAULT 'exterior',
  	"media_id" integer,
  	"external_url" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_aircraft_v_version_provenance_merged_from" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"table" varchar,
  	"_uuid" numeric
  );
  
  CREATE TABLE "_aircraft_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_registration_display" varchar,
  	"version_registration" varchar,
  	"version_slug" varchar,
  	"version_availability" "enum__aircraft_v_version_availability" DEFAULT 'available',
  	"version_type_name" varchar,
  	"version_type_slug" varchar,
  	"version_type_category" varchar,
  	"version_type_manufacturer" varchar,
  	"version_type_model" varchar,
  	"version_specification_passengers" numeric,
  	"version_specification_type_passengers" numeric,
  	"version_specification_range_maximum" numeric,
  	"version_specification_speed_typical" numeric,
  	"version_specification_cabin_height" numeric,
  	"version_specification_cabin_length" numeric,
  	"version_specification_cabin_width" numeric,
  	"version_specification_year_of_production" numeric,
  	"version_specification_serial_number" varchar,
  	"version_specification_hours_flown" numeric,
  	"version_specification_cycles" numeric,
  	"version_specification_interior_refit" varchar,
  	"version_specification_exterior_refit" varchar,
  	"version_specification_luggage_volume" varchar,
  	"version_specification_sleeping_places" numeric,
  	"version_specification_divan_seats" numeric,
  	"version_specification_beds" numeric,
  	"version_amenities_cabin_crew" boolean,
  	"version_amenities_lavatory" boolean,
  	"version_amenities_shower" boolean,
  	"version_amenities_hot_meal" boolean,
  	"version_amenities_wireless_internet" boolean,
  	"version_amenities_satellite_phone" boolean,
  	"version_amenities_pets_allowed" boolean,
  	"version_amenities_refurbishment" boolean,
  	"version_operator_company_name" varchar,
  	"version_operator_company_slug" varchar,
  	"version_operator_technical_operator" varchar,
  	"version_base_airport_id" integer,
  	"version_view360_url" varchar,
  	"version_brochure_url" varchar,
  	"version_brochure_name" varchar,
  	"version_legacy_attributes" jsonb,
  	"version_provenance_origin" "enum__aircraft_v_version_provenance_origin" DEFAULT 'manual',
  	"version_provenance_legacy_aircraft_id" numeric,
  	"version_provenance_legacy_vehicle_id" numeric,
  	"version_provenance_legacy_tail_number" varchar,
  	"version_provenance_legacy_slug" varchar,
  	"version_provenance_import_run_id" varchar,
  	"version_provenance_imported_at" timestamp(3) with time zone,
  	"version_provenance_verified_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__aircraft_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__aircraft_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_aircraft_v_locales" (
  	"version_description" varchar,
  	"version_special_equipment" varchar,
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
  
  CREATE TABLE "_empty_legs_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_route" varchar,
  	"version_departure_airport_id" integer,
  	"version_departure_icao" varchar,
  	"version_arrival_airport_id" integer,
  	"version_arrival_icao" varchar,
  	"version_departure_at" timestamp(3) with time zone,
  	"version_arrival_at" timestamp(3) with time zone,
  	"version_price" numeric,
  	"version_currency" "enum__empty_legs_v_version_currency" DEFAULT 'USD',
  	"version_seats" numeric,
  	"version_order" numeric,
  	"version_aircraft_document_id" integer,
  	"version_aircraft_type" varchar,
  	"version_aircraft_category" varchar,
  	"version_aircraft_company" varchar,
  	"version_aircraft_safety" varchar,
  	"version_legacy_attributes" jsonb,
  	"version_provenance_origin" "enum__empty_legs_v_version_provenance_origin" DEFAULT 'manual',
  	"version_provenance_legacy_id" numeric,
  	"version_provenance_import_run_id" varchar,
  	"version_provenance_imported_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__empty_legs_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__empty_legs_v_published_locale",
  	"latest" boolean
  );
  
  ALTER TABLE "aircraft_images" ALTER COLUMN "type" DROP NOT NULL;
  ALTER TABLE "aircraft_provenance_merged_from" ALTER COLUMN "table" DROP NOT NULL;
  ALTER TABLE "aircraft" ALTER COLUMN "registration_display" DROP NOT NULL;
  ALTER TABLE "aircraft" ALTER COLUMN "provenance_origin" DROP NOT NULL;
  ALTER TABLE "yachts" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "yachts" ALTER COLUMN "listing_type" DROP NOT NULL;
  ALTER TABLE "yachts" ALTER COLUMN "provenance_origin" DROP NOT NULL;
  ALTER TABLE "empty_legs" ALTER COLUMN "departure_at" DROP NOT NULL;
  ALTER TABLE "empty_legs" ALTER COLUMN "provenance_origin" DROP NOT NULL;
  ALTER TABLE "aircraft" ADD COLUMN "_status" "enum_aircraft_status" DEFAULT 'draft';
  ALTER TABLE "yachts" ADD COLUMN "_status" "enum_yachts_status" DEFAULT 'draft';
  ALTER TABLE "empty_legs" ADD COLUMN "_status" "enum_empty_legs_status" DEFAULT 'draft';
  ALTER TABLE "_aircraft_v_version_offerings" ADD CONSTRAINT "_aircraft_v_version_offerings_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_aircraft_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aircraft_v_version_images" ADD CONSTRAINT "_aircraft_v_version_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_aircraft_v_version_images" ADD CONSTRAINT "_aircraft_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_aircraft_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aircraft_v_version_provenance_merged_from" ADD CONSTRAINT "_aircraft_v_version_provenance_merged_from_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_aircraft_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aircraft_v" ADD CONSTRAINT "_aircraft_v_parent_id_aircraft_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_aircraft_v" ADD CONSTRAINT "_aircraft_v_version_base_airport_id_airports_id_fk" FOREIGN KEY ("version_base_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_aircraft_v_locales" ADD CONSTRAINT "_aircraft_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_aircraft_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_yachts_v_version_photos" ADD CONSTRAINT "_yachts_v_version_photos_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_yachts_v_version_photos" ADD CONSTRAINT "_yachts_v_version_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_yachts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_yachts_v_version_photos_locales" ADD CONSTRAINT "_yachts_v_version_photos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_yachts_v_version_photos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_yachts_v" ADD CONSTRAINT "_yachts_v_parent_id_yachts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."yachts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_yachts_v" ADD CONSTRAINT "_yachts_v_version_contact_id_contacts_id_fk" FOREIGN KEY ("version_contact_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_yachts_v" ADD CONSTRAINT "_yachts_v_version_captain_id_contacts_id_fk" FOREIGN KEY ("version_captain_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_yachts_v_locales" ADD CONSTRAINT "_yachts_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_yachts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_parent_id_empty_legs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."empty_legs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_version_departure_airport_id_airports_id_fk" FOREIGN KEY ("version_departure_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_version_arrival_airport_id_airports_id_fk" FOREIGN KEY ("version_arrival_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_version_aircraft_document_id_aircraft_id_fk" FOREIGN KEY ("version_aircraft_document_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "_aircraft_v_version_offerings_order_idx" ON "_aircraft_v_version_offerings" USING btree ("order");
  CREATE INDEX "_aircraft_v_version_offerings_parent_idx" ON "_aircraft_v_version_offerings" USING btree ("parent_id");
  CREATE INDEX "_aircraft_v_version_images_order_idx" ON "_aircraft_v_version_images" USING btree ("_order");
  CREATE INDEX "_aircraft_v_version_images_parent_id_idx" ON "_aircraft_v_version_images" USING btree ("_parent_id");
  CREATE INDEX "_aircraft_v_version_images_media_idx" ON "_aircraft_v_version_images" USING btree ("media_id");
  CREATE INDEX "_aircraft_v_version_provenance_merged_from_order_idx" ON "_aircraft_v_version_provenance_merged_from" USING btree ("_order");
  CREATE INDEX "_aircraft_v_version_provenance_merged_from_parent_id_idx" ON "_aircraft_v_version_provenance_merged_from" USING btree ("_parent_id");
  CREATE INDEX "_aircraft_v_parent_idx" ON "_aircraft_v" USING btree ("parent_id");
  CREATE INDEX "_aircraft_v_version_version_registration_idx" ON "_aircraft_v" USING btree ("version_registration");
  CREATE INDEX "_aircraft_v_version_version_slug_idx" ON "_aircraft_v" USING btree ("version_slug");
  CREATE INDEX "_aircraft_v_version_type_version_type_name_idx" ON "_aircraft_v" USING btree ("version_type_name");
  CREATE INDEX "_aircraft_v_version_type_version_type_category_idx" ON "_aircraft_v" USING btree ("version_type_category");
  CREATE INDEX "_aircraft_v_version_type_version_type_model_idx" ON "_aircraft_v" USING btree ("version_type_model");
  CREATE INDEX "_aircraft_v_version_specification_version_specification__idx" ON "_aircraft_v" USING btree ("version_specification_passengers");
  CREATE INDEX "_aircraft_v_version_specification_version_specificatio_1_idx" ON "_aircraft_v" USING btree ("version_specification_range_maximum");
  CREATE INDEX "_aircraft_v_version_specification_version_specificatio_2_idx" ON "_aircraft_v" USING btree ("version_specification_cabin_height");
  CREATE INDEX "_aircraft_v_version_specification_version_specificatio_3_idx" ON "_aircraft_v" USING btree ("version_specification_year_of_production");
  CREATE INDEX "_aircraft_v_version_version_base_airport_idx" ON "_aircraft_v" USING btree ("version_base_airport_id");
  CREATE INDEX "_aircraft_v_version_provenance_version_provenance_origin_idx" ON "_aircraft_v" USING btree ("version_provenance_origin");
  CREATE INDEX "_aircraft_v_version_provenance_version_provenance_legacy_idx" ON "_aircraft_v" USING btree ("version_provenance_legacy_aircraft_id");
  CREATE INDEX "_aircraft_v_version_provenance_version_provenance_lega_1_idx" ON "_aircraft_v" USING btree ("version_provenance_legacy_vehicle_id");
  CREATE INDEX "_aircraft_v_version_provenance_version_provenance_lega_2_idx" ON "_aircraft_v" USING btree ("version_provenance_legacy_slug");
  CREATE INDEX "_aircraft_v_version_provenance_version_provenance_import_idx" ON "_aircraft_v" USING btree ("version_provenance_import_run_id");
  CREATE INDEX "_aircraft_v_version_version_updated_at_idx" ON "_aircraft_v" USING btree ("version_updated_at");
  CREATE INDEX "_aircraft_v_version_version_created_at_idx" ON "_aircraft_v" USING btree ("version_created_at");
  CREATE INDEX "_aircraft_v_version_version__status_idx" ON "_aircraft_v" USING btree ("version__status");
  CREATE INDEX "_aircraft_v_created_at_idx" ON "_aircraft_v" USING btree ("created_at");
  CREATE INDEX "_aircraft_v_updated_at_idx" ON "_aircraft_v" USING btree ("updated_at");
  CREATE INDEX "_aircraft_v_snapshot_idx" ON "_aircraft_v" USING btree ("snapshot");
  CREATE INDEX "_aircraft_v_published_locale_idx" ON "_aircraft_v" USING btree ("published_locale");
  CREATE INDEX "_aircraft_v_latest_idx" ON "_aircraft_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_aircraft_v_locales_locale_parent_id_unique" ON "_aircraft_v_locales" USING btree ("_locale","_parent_id");
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
  CREATE INDEX "_empty_legs_v_parent_idx" ON "_empty_legs_v" USING btree ("parent_id");
  CREATE INDEX "_empty_legs_v_version_version_departure_airport_idx" ON "_empty_legs_v" USING btree ("version_departure_airport_id");
  CREATE INDEX "_empty_legs_v_version_version_departure_icao_idx" ON "_empty_legs_v" USING btree ("version_departure_icao");
  CREATE INDEX "_empty_legs_v_version_version_arrival_airport_idx" ON "_empty_legs_v" USING btree ("version_arrival_airport_id");
  CREATE INDEX "_empty_legs_v_version_version_arrival_icao_idx" ON "_empty_legs_v" USING btree ("version_arrival_icao");
  CREATE INDEX "_empty_legs_v_version_version_departure_at_idx" ON "_empty_legs_v" USING btree ("version_departure_at");
  CREATE INDEX "_empty_legs_v_version_version_price_idx" ON "_empty_legs_v" USING btree ("version_price");
  CREATE INDEX "_empty_legs_v_version_version_order_idx" ON "_empty_legs_v" USING btree ("version_order");
  CREATE INDEX "_empty_legs_v_version_aircraft_version_aircraft_document_idx" ON "_empty_legs_v" USING btree ("version_aircraft_document_id");
  CREATE INDEX "_empty_legs_v_version_provenance_version_provenance_orig_idx" ON "_empty_legs_v" USING btree ("version_provenance_origin");
  CREATE INDEX "_empty_legs_v_version_provenance_version_provenance_lega_idx" ON "_empty_legs_v" USING btree ("version_provenance_legacy_id");
  CREATE INDEX "_empty_legs_v_version_provenance_version_provenance_impo_idx" ON "_empty_legs_v" USING btree ("version_provenance_import_run_id");
  CREATE INDEX "_empty_legs_v_version_version_updated_at_idx" ON "_empty_legs_v" USING btree ("version_updated_at");
  CREATE INDEX "_empty_legs_v_version_version_created_at_idx" ON "_empty_legs_v" USING btree ("version_created_at");
  CREATE INDEX "_empty_legs_v_version_version__status_idx" ON "_empty_legs_v" USING btree ("version__status");
  CREATE INDEX "_empty_legs_v_created_at_idx" ON "_empty_legs_v" USING btree ("created_at");
  CREATE INDEX "_empty_legs_v_updated_at_idx" ON "_empty_legs_v" USING btree ("updated_at");
  CREATE INDEX "_empty_legs_v_snapshot_idx" ON "_empty_legs_v" USING btree ("snapshot");
  CREATE INDEX "_empty_legs_v_published_locale_idx" ON "_empty_legs_v" USING btree ("published_locale");
  CREATE INDEX "_empty_legs_v_latest_idx" ON "_empty_legs_v" USING btree ("latest");
  CREATE INDEX "aircraft__status_idx" ON "aircraft" USING btree ("_status");
  CREATE INDEX "yachts__status_idx" ON "yachts" USING btree ("_status");
  CREATE INDEX "empty_legs__status_idx" ON "empty_legs" USING btree ("_status");`)
}
