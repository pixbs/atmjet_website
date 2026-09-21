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
    expect(html).toContain('Why choose us?')
    expect(html).toContain('Global coverage')
  })

  test('comes to rest lower for each reason the page carries', async ({ page }) => {
    await page.goto(pathFor('/cargo_charter', 'en'))
    const cards = page.locator(CARDS)

    await expect(cards).toHaveCount(4)
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

    await expect(last.getByText('Guarantees')).toBeVisible()
    await expect(last.locator('img')).toHaveCount(0)
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/cargo_charter', 'ru'))).text()

    expect(html).toContain('Глобальный охват')
    expect(html).not.toContain('Global coverage')
  })
})

/**
 * The same cards with nothing around them (issue #145, `docs/legacy-inventory.md` section 4):
 * the group charters page laid them straight into the container, with no heading beside them
 * and no box clipping them, so they stick to the page rather than to a box.
 */
test.describe('the bare stack', () => {
  test('draws the cards with no heading beside them', async ({ page }) => {
    await page.goto(pathFor('/group_charters', 'en'))
    const section = page.locator(`${SECTION}[data-variant="bare"]`)

    await expect(section).toHaveCount(1)
    await expect(section.getByRole('heading', { level: 2 })).toHaveCount(0)
    await expect(section.getByRole('heading', { level: 3 })).toHaveCount(3)
  })

  test('is not clipped by a box, as the stack beside a heading is', async ({ page }) => {
    await page.goto(pathFor('/group_charters', 'en'))

    await expect(page.locator(`${SECTION}[data-variant="bare"] [data-cards="why-us"]`)).toHaveCount(
      0,
    )

    await page.goto(pathFor('/cargo_charter', 'en'))
    await expect(
      page.locator(`${SECTION}[data-variant="stacked"] [data-cards="why-us"]`),
    ).toHaveCount(1)
  })
})
