import type { Payload, Where } from 'payload'

import { normaliseText } from '../../src/lib/airports'
import { slugify } from '../../src/lib/slug'
import { YACHT_CURRENCIES } from '../../src/lib/yachts'
import { paragraphs } from '../seed/prose'
import { runImport, type ImportReport } from './runner'
import { tableRows } from './source'
import { payloadTarget, present, type TargetDocument } from './target'

/**
 * The charter catalogue (issue #81, `docs/adr/0002-database-migration-strategy.md` item 7):
 * `contact` into Contacts first, then `new_yachts` into Yachts as charter listings, each yacht's
 * contact and captain pointed at the contact of the same legacy id. A legacy id no contact row
 * has — the columns carry no foreign key — is left empty and returned for the run to list.
 */

export interface ContactRow {
  id: number
  name: string | null
  phone: string | null
  email: string | null
}

export interface NewYachtsRow {
  id: number
  name: string | null
  slug: string | null
  description: string | null
  description_ru: string | null
  manufacturer: string | null
  owner: string | null
  contact_id: number | null
  bussines_price: string | null
  customer_price: string | null
  currency: string | null
  captain_id: number | null
  location: string | null
  length: string | null
  guests_day: string | null
  guests_night: string | null
  cabins: string | null
  bathrooms: string | null
  refit: string | null
  min_hours: string | null
  /** Russian, whatever its name says: the site rendered it for `ru` (inventory section 8). */
  included: string | null
  included_en: string | null
  photos: string[] | null
}

/** Payload's own test for the `email` field, so a row is never refused over one. */
const EMAIL =
  /^(?!.*\.\.)[\w!#$%&'*+/=?^`{|}~-](?:[\w!#$%&'*+/=?^`{|}~.-]*[\w!#$%&'*+/=?^`{|}~-])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i

export function fromContact(
  row: ContactRow,
  context: { runId: string; importedAt: string },
): TargetDocument<'contacts'> {
  const email = normaliseText(row.email)
  const valid = email === undefined || EMAIL.test(email)

  return {
    data: present({
      // `name` is required and the legacy column is not.
      name: normaliseText(row.name) ?? `Contact ${row.id}`,
      phone: normaliseText(row.phone),
      email: valid ? email : undefined,
      legacyAttributes: valid ? undefined : { email },
      provenance: {
        origin: 'contact-legacy' as const,
        legacyContactId: row.id,
        importRunId: context.runId,
        importedAt: context.importedAt,
      },
    }),
  }
}

const contactKey = (data: TargetDocument<'contacts'>['data']): Where => ({
  'provenance.legacyContactId': { equals: data.provenance.legacyContactId },
})

/** A `numeric` column as node-postgres hands it over: a string, or nothing. */
function decimal(value: string | number | null): number | undefined {
  const number = value === null || value === '' ? Number.NaN : Number(value)

  return Number.isFinite(number) ? number : undefined
}

type Currency = (typeof YACHT_CURRENCIES)[number]

const SPELLINGS: Record<string, Currency> = {
  AED: 'AED',
  DH: 'AED',
  DHS: 'AED',
  DIRHAM: 'AED',
  DIRHAMS: 'AED',
  USD: 'USD',
  $: 'USD',
  US$: 'USD',
  DOLLAR: 'USD',
  DOLLARS: 'USD',
  EUR: 'EUR',
  '€': 'EUR',
  EURO: 'EUR',
  EUROS: 'EUR',
}

/** The free-text currency column as one of the three the site prices in, when it is one. */
export function currencyOf(value: string | null): Currency | undefined {
  return SPELLINGS[(value ?? '').trim().toUpperCase()]
}

export interface CharterContext {
  runId: string
  importedAt: string
  /** Contact document ids by legacy id, which the contacts import wrote first. */
  contacts: ReadonlyMap<number, number>
  /** Slugs already taken, by an earlier document or an earlier row of this run. */
  slugs: Set<string>
  /** The slug an earlier run gave a legacy row, which that row keeps. */
  imported: ReadonlyMap<number, string>
}

export interface Orphan {
  yacht: number
  column: 'contact_id' | 'captain_id'
  contact: number
}

/**
 * The slug the legacy row had, unless it is empty or taken: the legacy admin wrote `''` for a
 * Cyrillic name and never refused a duplicate (inventory section 8.2). Then the name, with the
 * legacy id where even that is taken, so every yacht still has a URL of its own.
 */
function slugFor(row: NewYachtsRow, taken: Set<string>, imported?: string): string {
  if (imported !== undefined) return imported

  const legacy = (row.slug ?? '').trim()
  const named = slugify(row.name) || 'yacht'
  const slug = [
    legacy.replace(/^_+|_+$/g, '') === '' ? '' : legacy,
    named,
    `${named}_${row.id}`,
  ].find((candidate) => candidate !== '' && !taken.has(candidate)) as string

  taken.add(slug)
  return slug
}

export function fromNewYacht(
  row: NewYachtsRow,
  context: CharterContext,
): { doc: TargetDocument<'yachts'>; orphans: Orphan[] } {
  const orphans: Orphan[] = []
  const person = (column: Orphan['column']) => {
    const legacyId = row[column]
    if (legacyId === null) return undefined

    const id = context.contacts.get(legacyId)
    if (id === undefined) orphans.push({ yacht: row.id, column, contact: legacyId })
    return id
  }

  const price = decimal(row.customer_price)
  const currency = currencyOf(row.currency)
  // A price with no currency the site knows is not rendered half: both stay in legacyAttributes.
  const priced = price !== undefined && currency !== undefined
  const legacyAttributes = present({
    customer_price: priced ? undefined : (row.customer_price ?? undefined),
    currency:
      priced || row.currency === null || row.currency.trim() === '' ? undefined : row.currency,
  })
  const slug = slugFor(row, context.slugs, context.imported.get(row.id))

  return {
    orphans,
    doc: {
      data: present({
        name: normaliseText(row.name) ?? slug,
        listingType: 'charter' as const,
        slug,
        location: normaliseText(row.location),
        length: decimal(row.length),
        description: row.description?.trim() ? paragraphs(row.description) : undefined,
        photos: (row.photos ?? [])
          .map((url) => url.trim())
          .filter((url) => url !== '')
          .map((externalUrl) => ({ externalUrl })),
        charter: present({
          manufacturer: normaliseText(row.manufacturer),
          owner: normaliseText(row.owner),
          customerPrice: priced ? price : undefined,
          currency: priced ? currency : undefined,
          businessPrice: decimal(row.bussines_price),
          minHours: decimal(row.min_hours),
          guestsDay: decimal(row.guests_day),
          guestsNight: decimal(row.guests_night),
          cabins: normaliseText(row.cabins),
          bathrooms: normaliseText(row.bathrooms),
          refit: decimal(row.refit),
          included: row.included_en?.trim() || undefined,
        }),
        contact: person('contact_id'),
        captain: person('captain_id'),
        legacyAttributes: Object.keys(legacyAttributes).length > 0 ? legacyAttributes : undefined,
        provenance: {
          origin: 'new-yachts-charter' as const,
          legacyId: row.id,
          legacySlug: row.slug ?? undefined,
          importRunId: context.runId,
          importedAt: context.importedAt,
        },
      }),
      translations: {
        ru: present({
          description: row.description_ru?.trim() ? paragraphs(row.description_ru) : undefined,
          charter: row.included?.trim() ? { included: row.included.trim() } : undefined,
        }),
      },
    },
  }
}

/** A yacht is the row of its own table: the two tables number their rows independently. */
const yachtKey = (data: TargetDocument<'yachts'>['data']): Where => ({
  and: [
    { 'provenance.origin': { equals: data.provenance.origin } },
    { 'provenance.legacyId': { equals: data.provenance.legacyId } },
  ],
})

export interface CharterImport {
  reports: ImportReport[]
  orphans: Orphan[]
}

export async function importCharterYachts(
  payload: Payload,
  options: { schema?: string; dryRun?: boolean; runId?: string } = {},
): Promise<CharterImport> {
  const { schema = 'legacy', dryRun = false, runId = crypto.randomUUID() } = options
  const importedAt = new Date().toISOString()
  const people = tableRows<ContactRow>(payload, { schema, table: 'contact', orderBy: 'id' })
  const contactsReport = await runImport(
    {
      source: people,
      sourceId: (row) => String(row.id),
      transform: (row) => fromContact(row, { runId, importedAt }),
    },
    payloadTarget(payload, { collection: 'contacts', table: people.table, naturalKey: contactKey }),
    { dryRun, runId },
  )

  const { docs: contacts } = await payload.find({
    collection: 'contacts',
    where: { 'provenance.legacyContactId': { exists: true } },
    select: { provenance: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const { docs: yachts } = await payload.find({
    collection: 'yachts',
    select: { slug: true, provenance: true },
    pagination: false,
    depth: 0,
    overrideAccess: true,
  })
  const context: CharterContext = {
    runId,
    importedAt,
    contacts: new Map(
      contacts.map((one) => [one.provenance?.legacyContactId as number, one.id] as const),
    ),
    slugs: new Set(yachts.map((one) => one.slug).filter((slug): slug is string => Boolean(slug))),
    imported: new Map(
      yachts
        .filter((one) => one.provenance?.origin === 'new-yachts-charter' && one.slug)
        .map((one) => [one.provenance?.legacyId as number, one.slug as string] as const),
    ),
  }
  const orphans: Orphan[] = []
  const source = tableRows<NewYachtsRow>(payload, { schema, table: 'new_yachts', orderBy: 'id' })
  const yachtsReport = await runImport(
    {
      source,
      sourceId: (row) => String(row.id),
      transform: (row) => {
        const { doc, orphans: found } = fromNewYacht(row, context)

        orphans.push(...found)
        return doc
      },
    },
    payloadTarget(payload, { collection: 'yachts', table: source.table, naturalKey: yachtKey }),
    { dryRun, runId },
  )

  return { reports: [contactsReport, yachtsReport], orphans }
}
