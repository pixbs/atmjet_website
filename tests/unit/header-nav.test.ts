import { describe, expect, it } from 'vitest'

import { headerNavFrom } from '@/lib/header'

/**
 * What the header draws from the Header global (issue #88). A database the seed has never run on
 * holds a global nobody has saved, which is what the footer was found to break on (issue #89):
 * the groups come back present and their required words missing.
 */
const NO_PAGES = new Map<number, string>()

describe('the header drawn from its global', () => {
  it('draws no booking button from a global nobody has saved', () => {
    // What `findGlobal` returns on such a database: the group is there, its wording is not.
    const header = headerNavFrom({ cta: { source: 'Header' } }, NO_PAGES)

    expect(header.cta).toBeNull()
    expect(header.primary).toEqual([])
    expect(header.secondary).toEqual([])
  })

  it('keeps the button an editor wrote, and what it will be traced to', () => {
    const header = headerNavFrom({ cta: { label: 'Make a booking', source: 'Header' } }, NO_PAGES)

    expect(header.cta).toEqual({ label: 'Make a booking', source: 'Header' })
  })

  it('draws no button that a lead could not be traced back to', () => {
    // `source` is what the dialog puts in the query and the lead carries to Telegram
    // (`docs/legacy-inventory.md` section 3.9); a button without it opens a dialog naming nothing.
    expect(headerNavFrom({ cta: { label: 'Make a booking' } }, NO_PAGES).cta).toBeNull()
  })

  it('links only the rows whose page still exists', () => {
    const header = headerNavFrom(
      {
        primaryNav: [
          { label: 'Home', page: 1 },
          { label: 'Deleted', page: null },
        ],
      },
      new Map([[1, '']]),
    )

    expect(header.primary).toEqual([{ label: 'Home', href: '/' }])
  })
})
