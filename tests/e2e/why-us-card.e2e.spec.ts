import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The reasons-to-fly card (issue #102, `docs/legacy-inventory.md` section 6). What the card is
 * for is the stack: each one comes to rest a little lower than the one above it and stays there
 * while the page keeps moving, so the reasons pile up rather than scroll past.
 */
const CARDS = '[data-cards="why-us"] > div'

test.describe('the why us card', () => {
  test('is in the HTML the server sends, figures and all', async ({ request }) => {
    // The legacy card was a client component because it animated; here only the reveal and the
    // counting are, and the words are on the page before either runs.
    const html = await (await request.get(pathFor('/styleguide', 'en'))).text()

    expect(html).toContain('Years in the air')
    expect(html).toContain('20+')
    expect(html).toContain('Two decades of charters out of the Gulf, Europe and the CIS.')
  })

  test('comes to rest lower for each card in the stack', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const cards = page.locator(CARDS)

    await expect(cards).toHaveCount(5)
    for (const [index, card] of (await cards.all()).entries()) {
      await expect(card).toHaveCSS('position', 'sticky')
      await expect(card).toHaveCSS('top', `${(index + 1) * 32}px`)
    }
  })

  test('stays where it came to rest while the page keeps scrolling', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    const first = page.locator(CARDS).first()

    // Scrolled through the stack, counted from the stack rather than from the end of the page,
    // so whatever is added to the styleguide after it cannot move this test. `instant` because
    // the parity layer carries the legacy `scroll-smooth` and a measurement would catch the page
    // still moving.
    await page.locator('[data-cards="why-us"]').evaluate((stack) =>
      window.scrollTo({
        top: stack.getBoundingClientRect().bottom + window.scrollY - window.innerHeight,
        behavior: 'instant',
      }),
    )

    // Pinned at its own offset rather than carried off the top of the screen with the section.
    await expect.poll(async () => Math.round((await first.boundingBox())?.y ?? -1)).toBe(32)
  })

  test('leaves out the figure and the photograph where a section has neither', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    // The group charters page lays out the same card with the text alone.
    const last = page.locator(CARDS).last()

    await expect(last.locator('img')).toHaveCount(0)
    await expect(last.getByText('A price agreed once')).toBeVisible()
  })
})
