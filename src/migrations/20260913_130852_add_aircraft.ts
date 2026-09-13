import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_aircraft_offerings" AS ENUM('charter', 'sale', 'lease', 'cargo');
  CREATE TYPE "public"."enum_aircraft_images_type" AS ENUM('exterior', 'cabin', 'cockpit');
  CREATE TYPE "public"."enum_aircraft_availability" AS ENUM('available', 'unavailable');
  CREATE TYPE "public"."enum_aircraft_provenance_origin" AS ENUM('aircrafts-catalog', 'vehicles-legacy', 'manual');
  CREATE TYPE "public"."enum_aircraft_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__aircraft_v_version_offerings" AS ENUM('charter', 'sale', 'lease', 'cargo');
  CREATE TYPE "public"."enum__aircraft_v_version_images_type" AS ENUM('exterior', 'cabin', 'cockpit');
  CREATE TYPE "public"."enum__aircraft_v_version_availability" AS ENUM('available', 'unavailable');
  CREATE TYPE "public"."enum__aircraft_v_version_provenance_origin" AS ENUM('aircrafts-catalog', 'vehicles-legacy', 'manual');
  CREATE TYPE "public"."enum__aircraft_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__aircraft_v_published_locale" AS ENUM('en', 'ru', 'uk');
  CREATE TABLE "aircraft_offerings" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_aircraft_offerings",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "aircraft_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_aircraft_images_type" DEFAULT 'exterior',
  	"media_id" integer,
  	"external_url" varchar
  );
  
  CREATE TABLE "aircraft_provenance_merged_from" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" numeric PRIMARY KEY NOT NULL,
  	"table" varchar
  );
  
  CREATE TABLE "aircraft" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"registration_display" varchar,
  	"registration" varchar,
  	"slug" varchar,
  	"availability" "enum_aircraft_availability" DEFAULT 'available',
  	"type_name" varchar,
  	"type_slug" varchar,
  	"type_category" varchar,
  	"type_manufacturer" varchar,
  	"type_model" varchar,
  	"specification_passengers" numeric,
  	"specification_type_passengers" numeric,
  	"specification_range_maximum" numeric,
  	"specification_speed_typical" numeric,
  	"specification_cabin_height" numeric,
  	"specification_cabin_length" numeric,
  	"specification_cabin_width" numeric,
  	"specification_year_of_production" numeric,
  	"specification_serial_number" varchar,
  	"specification_hours_flown" numeric,
  	"specification_cycles" numeric,
  	"specification_interior_refit" varchar,
  	"specification_exterior_refit" varchar,
  	"specification_luggage_volume" varchar,
  	"specification_sleeping_places" numeric,
  	"specification_divan_seats" numeric,
  	"specification_beds" numeric,
  	"amenities_cabin_crew" boolean,
  	"amenities_lavatory" boolean,
  	"amenities_shower" boolean,
  	"amenities_hot_meal" boolean,
  	"amenities_wireless_internet" boolean,
  	"amenities_satellite_phone" boolean,
  	"amenities_pets_allowed" boolean,
  	"amenities_refurbishment" boolean,
  	"operator_company_name" varchar,
  	"operator_company_slug" varchar,
  	"operator_technical_operator" varchar,
  	"base_airport_id" integer,
  	"view360_url" varchar,
  	"brochure_url" varchar,
  	"brochure_name" varchar,
  	"legacy_attributes" jsonb,
  	"provenance_origin" "enum_aircraft_provenance_origin" DEFAULT 'manual',
  	"provenance_legacy_aircraft_id" numeric,
  	"provenance_legacy_vehicle_id" numeric,
  	"provenance_legacy_tail_number" varchar,
  	"provenance_legacy_slug" varchar,
  	"provenance_import_run_id" varchar,
  	"provenance_imported_at" timestamp(3) with time zone,
  	"provenance_verified_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_aircraft_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "aircraft_locales" (
  	"description" varchar,
  	"special_equipment" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
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
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "aircraft_id" integer;
  ALTER TABLE "aircraft_offerings" ADD CONSTRAINT "aircraft_offerings_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "aircraft_images" ADD CONSTRAINT "aircraft_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "aircraft_images" ADD CONSTRAINT "aircraft_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "aircraft_provenance_merged_from" ADD CONSTRAINT "aircraft_provenance_merged_from_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "aircraft" ADD CONSTRAINT "aircraft_base_airport_id_airports_id_fk" FOREIGN KEY ("base_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "aircraft_locales" ADD CONSTRAINT "aircraft_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aircraft_v_version_offerings" ADD CONSTRAINT "_aircraft_v_version_offerings_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_aircraft_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aircraft_v_version_images" ADD CONSTRAINT "_aircraft_v_version_images_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_aircraft_v_version_images" ADD CONSTRAINT "_aircraft_v_version_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_aircraft_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aircraft_v_version_provenance_merged_from" ADD CONSTRAINT "_aircraft_v_version_provenance_merged_from_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_aircraft_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_aircraft_v" ADD CONSTRAINT "_aircraft_v_parent_id_aircraft_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_aircraft_v" ADD CONSTRAINT "_aircraft_v_version_base_airport_id_airports_id_fk" FOREIGN KEY ("version_base_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_aircraft_v_locales" ADD CONSTRAINT "_aircraft_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_aircraft_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "aircraft_offerings_order_idx" ON "aircraft_offerings" USING btree ("order");
  CREATE INDEX "aircraft_offerings_parent_idx" ON "aircraft_offerings" USING btree ("parent_id");
  CREATE INDEX "aircraft_images_order_idx" ON "aircraft_images" USING btree ("_order");
  CREATE INDEX "aircraft_images_parent_id_idx" ON "aircraft_images" USING btree ("_parent_id");
  CREATE INDEX "aircraft_images_media_idx" ON "aircraft_images" USING btree ("media_id");
  CREATE INDEX "aircraft_provenance_merged_from_order_idx" ON "aircraft_provenance_merged_from" USING btree ("_order");
  CREATE INDEX "aircraft_provenance_merged_from_parent_id_idx" ON "aircraft_provenance_merged_from" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "aircraft_registration_idx" ON "aircraft" USING btree ("registration");
  CREATE UNIQUE INDEX "aircraft_slug_idx" ON "aircraft" USING btree ("slug");
  CREATE INDEX "aircraft_type_type_name_idx" ON "aircraft" USING btree ("type_name");
  CREATE INDEX "aircraft_type_type_category_idx" ON "aircraft" USING btree ("type_category");
  CREATE INDEX "aircraft_type_type_model_idx" ON "aircraft" USING btree ("type_model");
  CREATE INDEX "aircraft_specification_specification_passengers_idx" ON "aircraft" USING btree ("specification_passengers");
  CREATE INDEX "aircraft_specification_specification_range_maximum_idx" ON "aircraft" USING btree ("specification_range_maximum");
  CREATE INDEX "aircraft_specification_specification_cabin_height_idx" ON "aircraft" USING btree ("specification_cabin_height");
  CREATE INDEX "aircraft_specification_specification_year_of_production_idx" ON "aircraft" USING btree ("specification_year_of_production");
  CREATE INDEX "aircraft_base_airport_idx" ON "aircraft" USING btree ("base_airport_id");
  CREATE INDEX "aircraft_provenance_provenance_origin_idx" ON "aircraft" USING btree ("provenance_origin");
  CREATE INDEX "aircraft_provenance_provenance_legacy_aircraft_id_idx" ON "aircraft" USING btree ("provenance_legacy_aircraft_id");
  CREATE INDEX "aircraft_provenance_provenance_legacy_vehicle_id_idx" ON "aircraft" USING btree ("provenance_legacy_vehicle_id");
  CREATE INDEX "aircraft_provenance_provenance_legacy_slug_idx" ON "aircraft" USING btree ("provenance_legacy_slug");
  CREATE INDEX "aircraft_provenance_provenance_import_run_id_idx" ON "aircraft" USING btree ("provenance_import_run_id");
  CREATE INDEX "aircraft_updated_at_idx" ON "aircraft" USING btree ("updated_at");
  CREATE INDEX "aircraft_created_at_idx" ON "aircraft" USING btree ("created_at");
  CREATE INDEX "aircraft__status_idx" ON "aircraft" USING btree ("_status");
  CREATE UNIQUE INDEX "aircraft_locales_locale_parent_id_unique" ON "aircraft_locales" USING btree ("_locale","_parent_id");
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
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_aircraft_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_aircraft_id_idx" ON "payload_locked_documents_rels" USING btree ("aircraft_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "aircraft_offerings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "aircraft_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "aircraft_provenance_merged_from" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "aircraft" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "aircraft_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_aircraft_v_version_offerings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_aircraft_v_version_images" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_aircraft_v_version_provenance_merged_from" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_aircraft_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_aircraft_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "aircraft_offerings" CASCADE;
  DROP TABLE "aircraft_images" CASCADE;
  DROP TABLE "aircraft_provenance_merged_from" CASCADE;
  DROP TABLE "aircraft" CASCADE;
  DROP TABLE "aircraft_locales" CASCADE;
  DROP TABLE "_aircraft_v_version_offerings" CASCADE;
  DROP TABLE "_aircraft_v_version_images" CASCADE;
  DROP TABLE "_aircraft_v_version_provenance_merged_from" CASCADE;
  DROP TABLE "_aircraft_v" CASCADE;
  DROP TABLE "_aircraft_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_aircraft_fk";
  
  DROP INDEX "payload_locked_documents_rels_aircraft_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "aircraft_id";
  DROP TYPE "public"."enum_aircraft_offerings";
  DROP TYPE "public"."enum_aircraft_images_type";
  DROP TYPE "public"."enum_aircraft_availability";
  DROP TYPE "public"."enum_aircraft_provenance_origin";
  DROP TYPE "public"."enum_aircraft_status";
  DROP TYPE "public"."enum__aircraft_v_version_offerings";
  DROP TYPE "public"."enum__aircraft_v_version_images_type";
  DROP TYPE "public"."enum__aircraft_v_version_availability";
  DROP TYPE "public"."enum__aircraft_v_version_provenance_origin";
  DROP TYPE "public"."enum__aircraft_v_version_status";
  DROP TYPE "public"."enum__aircraft_v_published_locale";`)
}
