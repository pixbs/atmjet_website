import { describe, expect, it } from 'vitest'

import { footerNavFrom } from '@/lib/footer'

/**
 * What the footer draws from the Footer global (issue #89). The production database, which the
 * seed has never run on, holds a global nobody has saved, and prerendering every page failed on
 * it: the copyright line was read as a string that was not there.
 */
const NO_PAGES = new Map<number, string>()

describe('the footer drawn from its global', () => {
  it('draws no legal lines and no booking button from a global nobody has saved', () => {
    // What `findGlobal` returns on such a database: the groups are there, their words are not.
    const footer = footerNavFrom({ cta: {}, legal: {} }, NO_PAGES)

    expect(footer.legal).toBeNull()
    expect(footer.cta).toBeNull()
    expect(footer.primary).toEqual([])
    expect(footer.socials).toEqual([])
  })

  it('keeps the lines and the button an editor wrote', () => {
    const footer = footerNavFrom(
      {
        cta: { label: 'Make a booking', source: 'Footer' },
        legal: { location: 'Dubai +971 (50) 458-99-26', copyright: '©ATM JET, 2004-{year}' },
      },
      NO_PAGES,
    )

    expect(footer.cta).toEqual({ label: 'Make a booking', source: 'Footer' })
    expect(footer.legal).toEqual({
      location: 'Dubai +971 (50) 458-99-26',
      copyright: '©ATM JET, 2004-{year}',
    })
  })

  it('draws a copyright line that has no location beside it', () => {
    const footer = footerNavFrom({ legal: { copyright: '©ATM JET, 2004-{year}' } }, NO_PAGES)

    expect(footer.legal).toEqual({ location: '', copyright: '©ATM JET, 2004-{year}' })
  })
})
