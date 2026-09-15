import { expect, test, type Locator } from '@playwright/test'

import { pathFor } from './routes'

/**
 * Where a page takes its text colour from (issue #300, `docs/legacy-inventory.md` section 10.1).
 *
 * The legacy stylesheet set the colour on `:root` and left its `body` rule pointing at variables
 * it never defined, so every element that carried no colour of its own inherited the page grey;
 * white was something markup asked for, one element at a time. A colour on `<body>` beats that
 * for the whole page, which is what drew the overline of the sales hero white where the live
 * site draws it `rgb(162, 171, 173)`.
 */
const PARITY_GREY = 'rgb(162, 171, 173)'
const WHITE = 'rgb(255, 255, 255)'

const colourOf = (locator: Locator) =>
  locator.first().evaluate((node) => getComputedStyle(node).color)

test.describe('the colour of body copy', () => {
  test('is the page grey wherever the legacy left it to be inherited', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))
    const hero = page.locator('[data-section="hero-sales"]')

    // The legacy overline is `<p class="text-sm uppercase">`: no colour of its own.
    await expect(colourOf(hero.locator('p.uppercase'))).resolves.toBe(PARITY_GREY)
    await expect(colourOf(page.locator('body'))).resolves.toBe(PARITY_GREY)
  })

  test('is white where the legacy markup asked for white', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))

    // The sentence under the figures is `text-gray-900` there, which is white on the inverted
    // ramp, and the parity layer paints every heading white.
    await expect(colourOf(page.locator('[data-section="hero-sales"] p.text-white'))).resolves.toBe(
      WHITE,
    )
    await expect(colourOf(page.locator('[data-section="advantages"] h2'))).resolves.toBe(WHITE)
  })
})
