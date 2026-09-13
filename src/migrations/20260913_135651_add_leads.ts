import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_delivery_channel" AS ENUM('telegram', 'crm');
  CREATE TYPE "public"."enum_leads_delivery_status" AS ENUM('pending', 'sent', 'failed');
  CREATE TYPE "public"."enum_leads_form_type" AS ENUM('booking-dialog', 'contact-us-inline', 'flight-request', 'aircraft-detail', 'yacht-detail');
  CREATE TYPE "public"."enum_leads_locale" AS ENUM('en', 'ru', 'uk');
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
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leads_id" integer;
  ALTER TABLE "leads_directions" ADD CONSTRAINT "leads_directions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_delivery" ADD CONSTRAINT "leads_delivery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "leads_texts" ADD CONSTRAINT "leads_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
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
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads_directions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads_delivery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "leads_directions" CASCADE;
  DROP TABLE "leads_delivery" CASCADE;
  DROP TABLE "leads" CASCADE;
  DROP TABLE "leads_texts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_leads_fk";
  
  DROP INDEX "payload_locked_documents_rels_leads_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "leads_id";
  DROP TYPE "public"."enum_leads_delivery_channel";
  DROP TYPE "public"."enum_leads_delivery_status";
  DROP TYPE "public"."enum_leads_form_type";
  DROP TYPE "public"."enum_leads_locale";`)
}
