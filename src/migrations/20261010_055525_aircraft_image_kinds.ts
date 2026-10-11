import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_aircraft_images_type" ADD VALUE 'notail';
  ALTER TYPE "public"."enum_aircraft_images_type" ADD VALUE 'plan';
  ALTER TYPE "public"."enum_aircraft_images_type" ADD VALUE 'other';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "aircraft_images" ALTER COLUMN "type" SET DATA TYPE text;
  ALTER TABLE "aircraft_images" ALTER COLUMN "type" SET DEFAULT 'exterior'::text;
  DROP TYPE "public"."enum_aircraft_images_type";
  CREATE TYPE "public"."enum_aircraft_images_type" AS ENUM('exterior', 'cabin', 'cockpit');
  ALTER TABLE "aircraft_images" ALTER COLUMN "type" SET DEFAULT 'exterior'::"public"."enum_aircraft_images_type";
  ALTER TABLE "aircraft_images" ALTER COLUMN "type" SET DATA TYPE "public"."enum_aircraft_images_type" USING "type"::"public"."enum_aircraft_images_type";`)
}
