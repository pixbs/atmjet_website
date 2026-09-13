import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor');
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );

  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");`)

  // Backfill, not part of the generated schema step. Before roles existed every authenticated
  // user could do everything, so anyone already in the table is granted `admin`: that preserves
  // exactly the access they had. Leaving them with no roles would lock them out of user
  // management the moment this deploys, and defaulting them to `editor` would silently take
  // away something they could do yesterday.
  await db.execute(sql`
    INSERT INTO "users_roles" ("order", "parent_id", "value")
    SELECT 1, "id", 'admin' FROM "users";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_roles" CASCADE;
  DROP TYPE "public"."enum_users_roles";`)
}
