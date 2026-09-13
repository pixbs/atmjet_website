import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'ru', 'uk');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('en', 'ru', 'uk');
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
  CREATE TYPE "public"."enum_contacts_provenance_origin" AS ENUM('contact-legacy', 'manual');
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
  CREATE TYPE "public"."enum_empty_legs_currency" AS ENUM('USD', 'EUR', 'AED');
  CREATE TYPE "public"."enum_empty_legs_provenance_origin" AS ENUM('empty-legs-legacy', 'manual');
  CREATE TYPE "public"."enum_empty_legs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__empty_legs_v_version_currency" AS ENUM('USD', 'EUR', 'AED');
  CREATE TYPE "public"."enum__empty_legs_v_version_provenance_origin" AS ENUM('empty-legs-legacy', 'manual');
  CREATE TYPE "public"."enum__empty_legs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__empty_legs_v_published_locale" AS ENUM('en', 'ru', 'uk');
  CREATE TYPE "public"."enum_leads_delivery_channel" AS ENUM('telegram', 'crm');
  CREATE TYPE "public"."enum_leads_delivery_status" AS ENUM('pending', 'sent', 'failed');
  CREATE TYPE "public"."enum_leads_form_type" AS ENUM('booking-dialog', 'contact-us-inline', 'flight-request', 'aircraft-detail', 'yacht-detail');
  CREATE TYPE "public"."enum_leads_locale" AS ENUM('en', 'ru', 'uk');
  CREATE TYPE "public"."enum_redirects_to_type" AS ENUM('reference', 'custom');
  CREATE TYPE "public"."enum_redirects_type" AS ENUM('301', '302', '303', '307', '308');
  CREATE TYPE "public"."enum_redirects_locale" AS ENUM('en', 'ru', 'uk');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"external_url" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_gallery_url" varchar,
  	"sizes_gallery_width" numeric,
  	"sizes_gallery_height" numeric,
  	"sizes_gallery_mime_type" varchar,
  	"sizes_gallery_filesize" numeric,
  	"sizes_gallery_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "media_locales" (
  	"alt" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"meta_title" varchar,
  	"meta_description" varchar,
  	"meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "airports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"icao" varchar,
  	"iata" varchar,
  	"passengers_per_year" numeric,
  	"iso_code" varchar,
  	"gmt_offset" varchar,
  	"latitude" numeric,
  	"longitude" numeric,
  	"wikidata" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "airports_locales" (
  	"name" varchar,
  	"city" varchar,
  	"country" varchar,
  	"aliases" varchar,
  	"type" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
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
  
  CREATE TABLE "contacts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"phone" varchar,
  	"email" varchar,
  	"photo_id" integer,
  	"provenance_origin" "enum_contacts_provenance_origin" DEFAULT 'manual' NOT NULL,
  	"provenance_legacy_contact_id" numeric,
  	"provenance_import_run_id" varchar,
  	"provenance_imported_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
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
  
  CREATE TABLE "empty_legs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"route" varchar,
  	"departure_airport_id" integer,
  	"departure_icao" varchar,
  	"arrival_airport_id" integer,
  	"arrival_icao" varchar,
  	"departure_at" timestamp(3) with time zone,
  	"arrival_at" timestamp(3) with time zone,
  	"price" numeric,
  	"currency" "enum_empty_legs_currency" DEFAULT 'USD',
  	"seats" numeric,
  	"order" numeric,
  	"aircraft_document_id" integer,
  	"aircraft_type" varchar,
  	"aircraft_category" varchar,
  	"aircraft_company" varchar,
  	"aircraft_safety" varchar,
  	"legacy_attributes" jsonb,
  	"provenance_origin" "enum_empty_legs_provenance_origin" DEFAULT 'manual',
  	"provenance_legacy_id" numeric,
  	"provenance_import_run_id" varchar,
  	"provenance_imported_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_empty_legs_status" DEFAULT 'draft'
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
  
  CREATE TABLE "leads_directions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" varchar,
  	"to" varchar,
  	"date" varchar,
  	"return_date" varchar,
  	"passengers" numeric,
  	"guests" numeric,
  	"hours" numeric
  );
  
  CREATE TABLE "leads_delivery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"channel" "enum_leads_delivery_channel" NOT NULL,
  	"status" "enum_leads_delivery_status" DEFAULT 'pending' NOT NULL,
  	"attempts" numeric DEFAULT 0,
  	"last_attempt_at" timestamp(3) with time zone,
  	"delivered_at" timestamp(3) with time zone,
  	"last_error" varchar
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"form_type" "enum_leads_form_type" NOT NULL,
  	"source" varchar,
  	"locale" "enum_leads_locale",
  	"page_path" varchar,
  	"page_url" varchar,
  	"page_referrer" varchar,
  	"utm_source" varchar,
  	"utm_medium" varchar,
  	"utm_campaign" varchar,
  	"utm_term" varchar,
  	"utm_content" varchar,
  	"user_agent" varchar,
  	"delivery_status" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "leads_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to_type" "enum_redirects_to_type" DEFAULT 'reference',
  	"to_url" varchar,
  	"type" "enum_redirects_type" DEFAULT '308',
  	"match_sub_paths" boolean DEFAULT false,
  	"locale" "enum_redirects_locale",
  	"note" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"pages_id" integer,
  	"airports_id" integer,
  	"aircraft_id" integer,
  	"contacts_id" integer,
  	"yachts_id" integer,
  	"empty_legs_id" integer,
  	"leads_id" integer,
  	"redirects_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_locales" ADD CONSTRAINT "media_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "airports_locales" ADD CONSTRAINT "airports_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "empty_legs" ADD CONSTRAINT "empty_legs_departure_airport_id_airports_id_fk" FOREIGN KEY ("departure_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "empty_legs" ADD CONSTRAINT "empty_legs_arrival_airport_id_airports_id_fk" FOREIGN KEY ("arrival_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "empty_legs" ADD CONSTRAINT "empty_legs_aircraft_document_id_aircraft_id_fk" FOREIGN KEY ("aircraft_document_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_parent_id_empty_legs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."empty_legs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_version_departure_airport_id_airports_id_fk" FOREIGN KEY ("version_departure_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_version_arrival_airport_id_airports_id_fk" FOREIGN KEY ("version_arrival_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_version_aircraft_document_id_aircraft_id_fk" FOREIGN KEY ("version_aircraft_document_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "leads_directions" ADD CONSTRAINT "leads_directions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_delivery" ADD CONSTRAINT "leads_delivery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_texts" ADD CONSTRAINT "leads_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "redirects_rels" ADD CONSTRAINT "redirects_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_airports_fk" FOREIGN KEY ("airports_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_aircraft_fk" FOREIGN KEY ("aircraft_id") REFERENCES "public"."aircraft"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_yachts_fk" FOREIGN KEY ("yachts_id") REFERENCES "public"."yachts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_empty_legs_fk" FOREIGN KEY ("empty_legs_id") REFERENCES "public"."empty_legs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_gallery_sizes_gallery_filename_idx" ON "media" USING btree ("sizes_gallery_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE UNIQUE INDEX "media_locales_locale_parent_id_unique" ON "media_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_meta_meta_image_idx" ON "pages_locales" USING btree ("meta_image_id","_locale");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "_pages_v_version_meta_version_meta_image_idx" ON "_pages_v_locales" USING btree ("version_meta_image_id","_locale");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "airports_icao_idx" ON "airports" USING btree ("icao");
  CREATE INDEX "airports_iata_idx" ON "airports" USING btree ("iata");
  CREATE INDEX "airports_passengers_per_year_idx" ON "airports" USING btree ("passengers_per_year");
  CREATE INDEX "airports_updated_at_idx" ON "airports" USING btree ("updated_at");
  CREATE INDEX "airports_created_at_idx" ON "airports" USING btree ("created_at");
  CREATE INDEX "airports_name_idx" ON "airports_locales" USING btree ("name","_locale");
  CREATE INDEX "airports_city_idx" ON "airports_locales" USING btree ("city","_locale");
  CREATE INDEX "airports_country_idx" ON "airports_locales" USING btree ("country","_locale");
  CREATE INDEX "airports_aliases_idx" ON "airports_locales" USING btree ("aliases","_locale");
  CREATE UNIQUE INDEX "airports_locales_locale_parent_id_unique" ON "airports_locales" USING btree ("_locale","_parent_id");
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
  CREATE INDEX "contacts_name_idx" ON "contacts" USING btree ("name");
  CREATE INDEX "contacts_photo_idx" ON "contacts" USING btree ("photo_id");
  CREATE INDEX "contacts_provenance_provenance_origin_idx" ON "contacts" USING btree ("provenance_origin");
  CREATE INDEX "contacts_provenance_provenance_legacy_contact_id_idx" ON "contacts" USING btree ("provenance_legacy_contact_id");
  CREATE INDEX "contacts_provenance_provenance_import_run_id_idx" ON "contacts" USING btree ("provenance_import_run_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
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
  CREATE INDEX "empty_legs_departure_airport_idx" ON "empty_legs" USING btree ("departure_airport_id");
  CREATE INDEX "empty_legs_departure_icao_idx" ON "empty_legs" USING btree ("departure_icao");
  CREATE INDEX "empty_legs_arrival_airport_idx" ON "empty_legs" USING btree ("arrival_airport_id");
  CREATE INDEX "empty_legs_arrival_icao_idx" ON "empty_legs" USING btree ("arrival_icao");
  CREATE INDEX "empty_legs_departure_at_idx" ON "empty_legs" USING btree ("departure_at");
  CREATE INDEX "empty_legs_price_idx" ON "empty_legs" USING btree ("price");
  CREATE INDEX "empty_legs_order_idx" ON "empty_legs" USING btree ("order");
  CREATE INDEX "empty_legs_aircraft_aircraft_document_idx" ON "empty_legs" USING btree ("aircraft_document_id");
  CREATE INDEX "empty_legs_provenance_provenance_origin_idx" ON "empty_legs" USING btree ("provenance_origin");
  CREATE INDEX "empty_legs_provenance_provenance_legacy_id_idx" ON "empty_legs" USING btree ("provenance_legacy_id");
  CREATE INDEX "empty_legs_provenance_provenance_import_run_id_idx" ON "empty_legs" USING btree ("provenance_import_run_id");
  CREATE INDEX "empty_legs_updated_at_idx" ON "empty_legs" USING btree ("updated_at");
  CREATE INDEX "empty_legs_created_at_idx" ON "empty_legs" USING btree ("created_at");
  CREATE INDEX "empty_legs__status_idx" ON "empty_legs" USING btree ("_status");
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
  CREATE INDEX "leads_directions_order_idx" ON "leads_directions" USING btree ("_order");
  CREATE INDEX "leads_directions_parent_id_idx" ON "leads_directions" USING btree ("_parent_id");
  CREATE INDEX "leads_delivery_order_idx" ON "leads_delivery" USING btree ("_order");
  CREATE INDEX "leads_delivery_parent_id_idx" ON "leads_delivery" USING btree ("_parent_id");
  CREATE INDEX "leads_email_idx" ON "leads" USING btree ("email");
  CREATE INDEX "leads_form_type_idx" ON "leads" USING btree ("form_type");
  CREATE INDEX "leads_source_idx" ON "leads" USING btree ("source");
  CREATE INDEX "leads_locale_idx" ON "leads" USING btree ("locale");
  CREATE INDEX "leads_utm_utm_source_idx" ON "leads" USING btree ("utm_source");
  CREATE INDEX "leads_utm_utm_campaign_idx" ON "leads" USING btree ("utm_campaign");
  CREATE INDEX "leads_delivery_status_idx" ON "leads" USING btree ("delivery_status");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  CREATE INDEX "leads_texts_order_parent" ON "leads_texts" USING btree ("order","parent_id");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  CREATE INDEX "redirects_rels_order_idx" ON "redirects_rels" USING btree ("order");
  CREATE INDEX "redirects_rels_parent_idx" ON "redirects_rels" USING btree ("parent_id");
  CREATE INDEX "redirects_rels_path_idx" ON "redirects_rels" USING btree ("path");
  CREATE INDEX "redirects_rels_pages_id_idx" ON "redirects_rels" USING btree ("pages_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_airports_id_idx" ON "payload_locked_documents_rels" USING btree ("airports_id");
  CREATE INDEX "payload_locked_documents_rels_aircraft_id_idx" ON "payload_locked_documents_rels" USING btree ("aircraft_id");
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");
  CREATE INDEX "payload_locked_documents_rels_yachts_id_idx" ON "payload_locked_documents_rels" USING btree ("yachts_id");
  CREATE INDEX "payload_locked_documents_rels_empty_legs_id_idx" ON "payload_locked_documents_rels" USING btree ("empty_legs_id");
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "media_locales" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  DROP TABLE "airports" CASCADE;
  DROP TABLE "airports_locales" CASCADE;
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
  DROP TABLE "contacts" CASCADE;
  DROP TABLE "yachts_photos" CASCADE;
  DROP TABLE "yachts_photos_locales" CASCADE;
  DROP TABLE "yachts" CASCADE;
  DROP TABLE "yachts_locales" CASCADE;
  DROP TABLE "_yachts_v_version_photos" CASCADE;
  DROP TABLE "_yachts_v_version_photos_locales" CASCADE;
  DROP TABLE "_yachts_v" CASCADE;
  DROP TABLE "_yachts_v_locales" CASCADE;
  DROP TABLE "empty_legs" CASCADE;
  DROP TABLE "_empty_legs_v" CASCADE;
  DROP TABLE "leads_directions" CASCADE;
  DROP TABLE "leads_delivery" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "leads_texts" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "redirects_rels" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";
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
  DROP TYPE "public"."enum__aircraft_v_published_locale";
  DROP TYPE "public"."enum_contacts_provenance_origin";
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
  DROP TYPE "public"."enum__yachts_v_published_locale";
  DROP TYPE "public"."enum_empty_legs_currency";
  DROP TYPE "public"."enum_empty_legs_provenance_origin";
  DROP TYPE "public"."enum_empty_legs_status";
  DROP TYPE "public"."enum__empty_legs_v_version_currency";
  DROP TYPE "public"."enum__empty_legs_v_version_provenance_origin";
  DROP TYPE "public"."enum__empty_legs_v_version_status";
  DROP TYPE "public"."enum__empty_legs_v_published_locale";
  DROP TYPE "public"."enum_leads_delivery_channel";
  DROP TYPE "public"."enum_leads_delivery_status";
  DROP TYPE "public"."enum_leads_form_type";
  DROP TYPE "public"."enum_leads_locale";
  DROP TYPE "public"."enum_redirects_to_type";
  DROP TYPE "public"."enum_redirects_type";
  DROP TYPE "public"."enum_redirects_locale";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
