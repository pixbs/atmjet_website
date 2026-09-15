import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_why_us_variant" AS ENUM('stacked', 'bare');
  CREATE TYPE "public"."enum__pages_v_blocks_why_us_variant" AS ENUM('stacked', 'bare');
  ALTER TABLE "pages_blocks_why_us" ADD COLUMN "variant" "enum_pages_blocks_why_us_variant" DEFAULT 'stacked';
  ALTER TABLE "_pages_v_blocks_why_us" ADD COLUMN "variant" "enum__pages_v_blocks_why_us_variant" DEFAULT 'stacked';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_why_us" DROP COLUMN "variant";
  ALTER TABLE "_pages_v_blocks_why_us" DROP COLUMN "variant";
  DROP TYPE "public"."enum_pages_blocks_why_us_variant";
  DROP TYPE "public"."enum__pages_v_blocks_why_us_variant";`)
}
