import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The "why us" section as a block (issue #116, `docs/legacy-inventory.md` section 5). The card
 * itself has its own spec; what is asserted here is what the section adds: the reasons come
 * from the document, in the order an editor put them, and each rests a little lower than the
 * one above it — an offset the section counts, because it depends on how many there are.
 */
const SECTION = '[data-section="why-us"]'
const CARDS = `${SECTION} [data-cards="why-us"] > div`

test.describe('the why us section', () => {
  test('is in the HTML the server sends, heading and reasons', async ({ request }) => {
    const html = await (await request.get(pathFor('/cargo_charter', 'en'))).text()

    expect(html).toContain('data-section="why-us"')
    expect(html).toContain('What a charter with us comes with, whatever is in the hold.')
    expect(html).toContain('Years in the air')
  })

  test('comes to rest lower for each reason the page carries', async ({ page }) => {
    await page.goto(pathFor('/cargo_charter', 'en'))
    const cards = page.locator(CARDS)

    await expect(cards).toHaveCount(3)
    for (const [index, card] of (await cards.all()).entries())
      await expect(card).toHaveCSS('top', `${(index + 1) * 32}px`)
  })

  test('keeps the heading beside the stack while the reasons scroll past it', async ({ page }) => {
    await page.goto(pathFor('/cargo_charter', 'en'))
    // The first child of the section's container is the column the heading sits in.
    const column = page.locator(`${SECTION} > div > div`).first()

    // `instant` because the parity layer carries the legacy `scroll-smooth` and a measurement
    // would otherwise catch the page still moving.
    await page.locator(SECTION).evaluate((section) =>
      window.scrollTo({
        top: section.getBoundingClientRect().bottom + window.scrollY - window.innerHeight,
        behavior: 'instant',
      }),
    )

    // Come to rest at its own offset rather than carried off the top with the section.
    await expect.poll(async () => Math.round((await column.boundingBox())?.y ?? -1)).toBe(160)
  })

  test('leaves out the figure and the photograph where a reason has neither', async ({ page }) => {
    await page.goto(pathFor('/cargo_charter', 'en'))
    const last = page.locator(CARDS).last()

    await expect(last.getByText('A price agreed once')).toBeVisible()
    await expect(last.locator('img')).toHaveCount(0)
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/cargo_charter', 'ru'))).text()

    expect(html).toContain('Лет в воздухе')
    expect(html).not.toContain('Years in the air')
  })
})
