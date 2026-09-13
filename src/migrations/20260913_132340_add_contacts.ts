import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_contacts_provenance_origin" AS ENUM('contact-legacy', 'manual');
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
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "contacts_id" integer;
  ALTER TABLE "contacts" ADD CONSTRAINT "contacts_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "contacts_name_idx" ON "contacts" USING btree ("name");
  CREATE INDEX "contacts_photo_idx" ON "contacts" USING btree ("photo_id");
  CREATE INDEX "contacts_provenance_provenance_origin_idx" ON "contacts" USING btree ("provenance_origin");
  CREATE INDEX "contacts_provenance_provenance_legacy_contact_id_idx" ON "contacts" USING btree ("provenance_legacy_contact_id");
  CREATE INDEX "contacts_provenance_provenance_import_run_id_idx" ON "contacts" USING btree ("provenance_import_run_id");
  CREATE INDEX "contacts_updated_at_idx" ON "contacts" USING btree ("updated_at");
  CREATE INDEX "contacts_created_at_idx" ON "contacts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contacts_fk" FOREIGN KEY ("contacts_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_contacts_id_idx" ON "payload_locked_documents_rels" USING btree ("contacts_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contacts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "contacts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_contacts_fk";
  
  DROP INDEX "payload_locked_documents_rels_contacts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "contacts_id";
  DROP TYPE "public"."enum_contacts_provenance_origin";`)
}
