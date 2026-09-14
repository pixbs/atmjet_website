import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The photo gallery (issue #101, `docs/legacy-inventory.md` section 6): the thumbnails choose
 * which photo is shown, and the one showing is the one that is not dimmed.
 *
 * The fixture draws three of them — one photo, four, and a strip long enough to scroll — which
 * are the three shapes a detail page asks for.
 */
const STYLEGUIDE = pathFor('/styleguide', 'en')
const SECTION = '[data-section="gallery"]'
/** The fixture draws three galleries; these are the ones with one photo and with four. */
const ONE = `${SECTION} [data-gallery="1"]`
const FOUR = `${SECTION} [data-gallery="4"]`

test.describe('the gallery', () => {
  test('is in the HTML the server sends', async ({ request }) => {
    const html = await (await request.get(STYLEGUIDE)).text()

    expect(html).toContain('data-section="gallery"')
  })

  test('opens on the first photo', async ({ page }) => {
    await page.goto(STYLEGUIDE)

    await expect(page.locator(FOUR).getByRole('button').first()).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  test('shows the photo whose thumbnail is chosen, and dims the rest', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    // Four photos: enough to choose one that is not already showing.
    const thumbs = page.locator(FOUR).getByRole('button')

    await thumbs.nth(1).click()

    await expect(thumbs.nth(1)).toHaveAttribute('aria-current', 'true')
    await expect(thumbs.nth(0)).toHaveAttribute('aria-current', 'false')
    // The legacy compared each thumbnail against the prop it opened with rather than the state
    // it kept, so the dim never moved off the first one.
    await expect(thumbs.nth(0)).toHaveCSS('opacity', '0.5')
    await expect(thumbs.nth(1)).toHaveCSS('opacity', '1')
  })

  test('can be operated from the keyboard, which the legacy div could not', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const thumbs = page.locator(FOUR).getByRole('button')

    await thumbs.nth(2).press('Enter')

    await expect(thumbs.nth(2)).toHaveAttribute('aria-current', 'true')
  })

  test('draws a gallery of one photo without asking for a second', async ({ page }) => {
    await page.goto(STYLEGUIDE)
    const single = page.locator(ONE).locator('img').first()

    // `next/image` loads lazily, so the photo has to be looked at before it is there.
    await single.scrollIntoViewIfNeeded()

    // `selected={1}` on a single-photo yacht rendered `<Image src={undefined}>` and took the
    // page down (section 13, entry 45), so what is asserted is that a real file arrived.
    await expect(single).toBeVisible()
    await expect(single).toHaveJSProperty('complete', true)
    expect(await single.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0)
  })
})
