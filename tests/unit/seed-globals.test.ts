import type { Payload } from 'payload'
import { describe, expect, it } from 'vitest'

import { seedGlobals } from '../../scripts/seed/globals'

/**
 * What a second run of the seed does to the chrome (issue #260).
 *
 * A saved global is an editor's and is left alone. The one exception is the seed's own menu with
 * every page deleted out from under it — the shape the integration tier leaves behind, since
 * deleting a page clears the links to it — which is nobody's work and is written again.
 */

/** The pages a seeded menu points at, as `payload.find` hands them back. */
const PAGES = [
  { id: 1, slug: '' },
  { id: 2, slug: 'partners' },
  { id: 3, slug: 'business_agents' },
  { id: 4, slug: 'medical_aviation' },
  { id: 5, slug: 'empty_legs' },
  { id: 6, slug: 'cargo_charter' },
  { id: 7, slug: 'atm_jet_group' },
  { id: 8, slug: 'aircraft' },
  { id: 9, slug: 'group_charters' },
  { id: 10, slug: 'sales_dept' },
  { id: 11, slug: 'sales_yachts' },
  { id: 12, slug: 'yachts' },
]

interface Row {
  label?: string | null
  page?: number | null
}

interface Menus {
  id?: number
  primaryNav?: Row[]
  secondaryNav?: Row[]
}

/** A Payload that answers the three calls the globals seed makes, and records what it writes. */
function recordingPayload(saved: Record<string, Menus>) {
  const writes: { slug: string; data: { primaryNav: Row[]; secondaryNav: Row[] } }[] = []
  const payload = {
    find: async () => ({ docs: PAGES }),
    findGlobal: async ({ slug }: { slug: string }) => saved[slug] ?? {},
    updateGlobal: async ({ slug, data }: { slug: string; data: Menus }) => {
      writes.push({ slug, data: data as (typeof writes)[number]['data'] })
      return data
    },
  } as unknown as Payload

  return { payload, writes }
}

/** What the seed writes into a global the first time, as the database would hold it. */
async function seededMenus(slug: 'header' | 'footer'): Promise<Menus> {
  const { payload, writes } = recordingPayload({})
  await seedGlobals(payload)
  const first = writes.find((write) => write.slug === slug)!

  return { id: 1, primaryNav: first.data.primaryNav, secondaryNav: first.data.secondaryNav }
}

/** The same menu after the pages it opened have been deleted. */
const withoutPages = (menus: Menus): Menus => ({
  ...menus,
  primaryNav: menus.primaryNav?.map((row) => ({ label: row.label, page: null })),
  secondaryNav: menus.secondaryNav?.map((row) => ({ label: row.label, page: null })),
})

const rowsOf = (write: { data: { primaryNav: Row[]; secondaryNav: Row[] } }) => [
  ...write.data.primaryNav,
  ...write.data.secondaryNav,
]

describe('seeding the chrome', () => {
  it('fills in a global that has never been saved', async () => {
    const { payload, writes } = recordingPayload({})

    const outcomes = await seedGlobals(payload)

    expect(outcomes.every((outcome) => outcome.action === 'created')).toBe(true)
    expect(writes.length).toBeGreaterThan(0)
  })

  it('leaves a navigation that still opens something exactly as it is', async () => {
    const saved = await seededMenus('header')
    const { payload, writes } = recordingPayload({ header: saved, footer: saved })

    const outcomes = await seedGlobals(payload)

    expect(writes).toHaveLength(0)
    expect(outcomes.every((outcome) => outcome.action === 'unchanged')).toBe(true)
  })

  it('leaves a navigation an editor emptied, which is a menu with no rows', async () => {
    const empty = { id: 1, primaryNav: [], secondaryNav: [] }
    const { payload, writes } = recordingPayload({ header: empty, footer: empty })

    const outcomes = await seedGlobals(payload)

    expect(writes).toHaveLength(0)
    expect(outcomes.every((outcome) => outcome.action === 'unchanged')).toBe(true)
  })

  it('leaves someone else’s rows alone even once their pages are gone', async () => {
    const theirs = { id: 1, primaryNav: [{ label: 'Doomed', page: null }], secondaryNav: [] }
    const { payload, writes } = recordingPayload({ header: theirs, footer: theirs })

    const outcomes = await seedGlobals(payload)

    expect(writes).toHaveLength(0)
    expect(outcomes.every((outcome) => outcome.action === 'unchanged')).toBe(true)
  })

  it('writes its own menu again once every page it opened has been deleted', async () => {
    const header = withoutPages(await seededMenus('header'))
    const footer = withoutPages(await seededMenus('footer'))
    const { payload, writes } = recordingPayload({ header, footer })

    const outcomes = await seedGlobals(payload)

    expect(outcomes.every((outcome) => outcome.action === 'updated')).toBe(true)
    // The acceptance of issue #260: what the repair writes opens pages that exist.
    const pages = new Set(PAGES.map((page) => page.id))
    expect(writes.length).toBeGreaterThan(0)
    for (const write of writes)
      for (const row of rowsOf(write)) expect(pages.has(row.page as number)).toBe(true)
  })
})
