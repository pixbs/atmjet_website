import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

import { airportSearchText } from '../lib/airports'

/** Airports written per statement: one `UPDATE … FROM (VALUES …)`, two parameters per row. */
const BATCH = 1000

const LOCALIZED = ['city', 'name', 'country', 'aliases'] as const

type Row = { id: number; icao: string | null; iata: string | null; locale: string | null } & Record<
  (typeof LOCALIZED)[number],
  string | null
>

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "airports" ADD COLUMN "search" varchar;`)

  // The imported airports get the text the collection hook gives every later write (#443); one
  // read of both tables, because Payload's find in every language takes minutes for 27,000.
  const { rows } = await db.execute<Row>(sql`
    SELECT a.id, a.icao, a.iata, l._locale AS locale, l.city, l.name, l.country, l.aliases
    FROM "airports" a LEFT JOIN "airports_locales" l ON l._parent_id = a.id`)
  const airports = new Map<number, Record<string, unknown>>()
  for (const row of rows) {
    const airport = airports.get(row.id) ?? { icao: row.icao, iata: row.iata }
    airports.set(row.id, airport)
    if (row.locale !== null)
      for (const field of LOCALIZED)
        airport[field] = { ...(airport[field] as object), [row.locale]: row[field] }
  }

  const entries = [...airports]
  for (let start = 0; start < entries.length; start += BATCH) {
    const values = entries
      .slice(start, start + BATCH)
      .map(([id, airport]) => sql`(${id}::integer, ${airportSearchText(airport)})`)
    await db.execute(sql`
      UPDATE "airports" SET "search" = v.search
      FROM (VALUES ${sql.join(values, sql`, `)}) AS v (id, search)
      WHERE "airports"."id" = v.id`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "airports" DROP COLUMN "search";`)
}
