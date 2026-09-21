import { expect, forEachLocale, test } from './fixtures'
import { pathFor } from './routes'

/**
 * The two faces the site is set in (issue #51, `docs/legacy-inventory.md` section 12.2).
 *
 * The legacy site declared the display face by hand and loaded the latin subset of Inter alone,
 * so every Cyrillic page was drawn in whatever the system offered. Both faces come through
 * `next/font` now, and the owner's decision of 2026-09-13 added the Cyrillic subset. What is
 * asserted is that the browser has actually loaded them for the text on the page, not that a
 * family name is written down somewhere.
 */
const SPECIMEN = '/styleguide/type'

/** The faces the document has, as the browser reports them; a subset it never paints stays unloaded. */
function facesOf(page: import('@playwright/test').Page) {
  return page.evaluate(() =>
    [...document.fonts].map((face) => ({
      family: face.family,
      status: face.status,
      range: face.unicodeRange,
    })),
  )
}

forEachLocale((locale) => {
  test.describe('the faces a page is set in', () => {
    test('has loaded both of them by the time the page is drawn', async ({ page }) => {
      await page.goto(pathFor(SPECIMEN, locale))
      await page.evaluate(() => document.fonts.ready)

      const loaded = (await facesOf(page))
        .filter((face) => face.status === 'loaded')
        .map((face) => face.family)

      // `next/font` names the families itself; the legacy loaded neither face on this page.
      expect(
        loaded.some((family) => /^Inter$/i.test(family)),
        loaded.join(),
      ).toBe(true)
      expect(
        loaded.some((family) => /^regresso$/i.test(family)),
        loaded.join(),
      ).toBe(true)
    })

    test('loads the Cyrillic subset of Inter, which the legacy left to the system', async ({
      page,
    }) => {
      await page.goto(pathFor(SPECIMEN, locale))
      await page.evaluate(() => document.fonts.ready)

      // One `@font-face` per subset, each with its own range: the Cyrillic one is fetched only
      // when the browser has Cyrillic to paint, so its being loaded is the decision working.
      const cyrillic = (await facesOf(page)).find(
        (face) => /^Inter$/i.test(face.family) && face.range.includes('U+400'),
      )

      expect(cyrillic, 'no Inter face covers Cyrillic').toBeDefined()
      expect(cyrillic?.status).toBe('loaded')
    })

    test('sets the headings in the display face and the body in the sans', async ({ page }) => {
      await page.goto(pathFor(SPECIMEN, locale))
      await page.evaluate(() => document.fonts.ready)

      const familyOf = (selector: string) =>
        page
          .locator(selector)
          .first()
          .evaluate((node) => getComputedStyle(node).fontFamily)

      expect(await familyOf('[data-specimen="display"] p')).toMatch(/regresso/i)
      expect(await familyOf('[data-specimen="body"] p')).toMatch(/Inter/i)
    })
  })
})
