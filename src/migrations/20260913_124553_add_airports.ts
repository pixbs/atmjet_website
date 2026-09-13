import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
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
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "airports_id" integer;
  ALTER TABLE "airports_locales" ADD CONSTRAINT "airports_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_airports_fk" FOREIGN KEY ("airports_id") REFERENCES "public"."airports"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_airports_id_idx" ON "payload_locked_documents_rels" USING btree ("airports_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "airports" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "airports_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "airports" CASCADE;
  DROP TABLE "airports_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_airports_fk";
  
  DROP INDEX "payload_locked_documents_rels_airports_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "airports_id";`)
}
