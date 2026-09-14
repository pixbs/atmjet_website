import { describe, expect, it } from 'vitest'

import { navLinks, navPageIds, type NavRow } from '@/lib/nav'

/**
 * Turning the rows an editor keeps into the links the chrome renders (issue #88). The legacy
 * menus hard-coded their hrefs (`docs/legacy-inventory.md` section 3.3), so none of this could
 * go wrong there and none of it could be fixed either: a renamed page left a dead link behind.
 */
const ROWS: NavRow[] = [
  { label: 'Home', page: 1 },
  { label: 'Partners', page: 2 },
]

const SLUGS = new Map([
  [1, ''],
  [2, 'partners'],
])

describe('navPageIds', () => {
  it('lists the pages a menu points at, in the order the menu lists them', () => {
    expect(navPageIds(ROWS)).toEqual([1, 2])
  })

  it('reads the id of a page Payload has already resolved', () => {
    // `depth: 1` hands back the document rather than its id, and both shapes are the same menu.
    expect(navPageIds([{ label: 'Partners', page: { id: 7 } }])).toEqual([7])
  })

  it('skips a row whose page was deleted', () => {
    // The relationship is optional so that deleting a page clears the links to it rather than
    // failing the delete (src/fields/nav.ts).
    expect(navPageIds([{ label: 'Gone', page: null }, ...ROWS])).toEqual([1, 2])
  })

  it('has nothing to list for a menu an editor has emptied', () => {
    expect(navPageIds(undefined)).toEqual([])
  })
})

describe('navLinks', () => {
  it('sends the page with the empty slug to the root of the locale', () => {
    // The legacy Home link was `/` with no locale prefix at all (section 13, entry 8), which is
    // why it depended on the middleware guessing the language.
    expect(navLinks(ROWS, SLUGS)).toEqual([
      { label: 'Home', href: '/' },
      { label: 'Partners', href: '/partners' },
    ])
  })

  it('keeps the wording of the locale it was read in', () => {
    const russian: NavRow[] = [{ label: 'Партнеры', page: 2 }]

    expect(navLinks(russian, SLUGS)).toEqual([{ label: 'Партнеры', href: '/partners' }])
  })

  it('leaves out a link whose page is gone rather than rendering a dead one', () => {
    const rows: NavRow[] = [...ROWS, { label: 'Deleted', page: 99 }]

    expect(navLinks(rows, SLUGS).map((link) => link.label)).toEqual(['Home', 'Partners'])
  })

  it('leaves out a link to a page a visitor may not read', () => {
    // The slugs come from a query that honours access control, so a draft page is simply absent.
    expect(navLinks([{ label: 'Draft', page: 3 }], SLUGS)).toEqual([])
  })
})
