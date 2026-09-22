import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_migration_runs_action" AS ENUM('created', 'updated');
  CREATE TABLE "migration_runs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source_key" varchar NOT NULL,
  	"source_table" varchar NOT NULL,
  	"source_id" varchar NOT NULL,
  	"target" varchar NOT NULL,
  	"document_id" varchar NOT NULL,
  	"action" "enum_migration_runs_action" NOT NULL,
  	"run_id" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "migration_runs_id" integer;
  CREATE UNIQUE INDEX "migration_runs_source_key_idx" ON "migration_runs" USING btree ("source_key");
  CREATE INDEX "migration_runs_source_table_idx" ON "migration_runs" USING btree ("source_table");
  CREATE INDEX "migration_runs_run_id_idx" ON "migration_runs" USING btree ("run_id");
  CREATE INDEX "migration_runs_updated_at_idx" ON "migration_runs" USING btree ("updated_at");
  CREATE INDEX "migration_runs_created_at_idx" ON "migration_runs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_migration_runs_fk" FOREIGN KEY ("migration_runs_id") REFERENCES "public"."migration_runs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_migration_runs_id_idx" ON "payload_locked_documents_rels" USING btree ("migration_runs_id");`)
}

/**
 * The generated statements are reordered here: `DROP TABLE ... CASCADE` already takes the
 * foreign key with it, and dropping the column takes its index, so both of the statements that
 * followed would have failed on constraints and indexes that were no longer there.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "migration_runs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "migration_runs_id";
  DROP TYPE "public"."enum_migration_runs_action";`)
}
