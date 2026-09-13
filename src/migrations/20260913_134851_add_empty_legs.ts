import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_empty_legs_currency" AS ENUM('USD', 'EUR', 'AED');
  CREATE TYPE "public"."enum_empty_legs_provenance_origin" AS ENUM('empty-legs-legacy', 'manual');
  CREATE TYPE "public"."enum_empty_legs_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__empty_legs_v_version_currency" AS ENUM('USD', 'EUR', 'AED');
  CREATE TYPE "public"."enum__empty_legs_v_version_provenance_origin" AS ENUM('empty-legs-legacy', 'manual');
  CREATE TYPE "public"."enum__empty_legs_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__empty_legs_v_published_locale" AS ENUM('en', 'ru', 'uk');
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
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "empty_legs_id" integer;
  ALTER TABLE "empty_legs" ADD CONSTRAINT "empty_legs_departure_airport_id_airports_id_fk" FOREIGN KEY ("departure_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "empty_legs" ADD CONSTRAINT "empty_legs_arrival_airport_id_airports_id_fk" FOREIGN KEY ("arrival_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "empty_legs" ADD CONSTRAINT "empty_legs_aircraft_document_id_aircraft_id_fk" FOREIGN KEY ("aircraft_document_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_parent_id_empty_legs_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."empty_legs"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_version_departure_airport_id_airports_id_fk" FOREIGN KEY ("version_departure_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_version_arrival_airport_id_airports_id_fk" FOREIGN KEY ("version_arrival_airport_id") REFERENCES "public"."airports"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_empty_legs_v" ADD CONSTRAINT "_empty_legs_v_version_aircraft_document_id_aircraft_id_fk" FOREIGN KEY ("version_aircraft_document_id") REFERENCES "public"."aircraft"("id") ON DELETE set null ON UPDATE no action;
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
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_empty_legs_fk" FOREIGN KEY ("empty_legs_id") REFERENCES "public"."empty_legs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_empty_legs_id_idx" ON "payload_locked_documents_rels" USING btree ("empty_legs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "empty_legs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_empty_legs_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "empty_legs" CASCADE;
  DROP TABLE "_empty_legs_v" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_empty_legs_fk";
  
  DROP INDEX "payload_locked_documents_rels_empty_legs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "empty_legs_id";
  DROP TYPE "public"."enum_empty_legs_currency";
  DROP TYPE "public"."enum_empty_legs_provenance_origin";
  DROP TYPE "public"."enum_empty_legs_status";
  DROP TYPE "public"."enum__empty_legs_v_version_currency";
  DROP TYPE "public"."enum__empty_legs_v_version_provenance_origin";
  DROP TYPE "public"."enum__empty_legs_v_version_status";
  DROP TYPE "public"."enum__empty_legs_v_published_locale";`)
}
