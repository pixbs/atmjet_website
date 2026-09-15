import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The aircraft carousel (issue #142, `docs/legacy-inventory.md` section 4): the heading over the
 * catalogue, one row of cards at a time, in the card the legacy page drew round them.
 */
const SECTION = '[data-section="catalogue-aircraft"]'

test.describe('the aircraft carousel', () => {
  test('is in the HTML the server sends, with the catalogue in it', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'en'))).text()

    expect(html).toContain('data-section="catalogue-aircraft"')
    expect(html).toContain('Most-flown business aircraft:')
    expect(html).toContain('Gulfstream G650ER')
  })

  test('names the rows in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'ru'))).text()

    expect(html).toContain('Пассажиров:')
    expect(html).not.toContain('Pax:')
  })

  test('opens the aircraft a card stands for', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))
    const card = page.locator(SECTION).getByRole('link').first()

    // The legacy card wrote a bare `/aircraft/…`, which only answers through a redirect.
    await expect(card).toHaveAttribute('href', /\/en\/aircraft\/[A-Z0-9]+$/)
  })

  test('moves between the aircraft, and loops back round', async ({ page }) => {
    await page.goto(pathFor('/sales_dept', 'en'))
    const section = page.locator(SECTION)
    const cards = section.getByRole('link')
    await section.scrollIntoViewIfNeeded()
    const first = await cards.first().boundingBox()

    await section.getByRole('button', { name: 'Next aircraft' }).click()
    await expect.poll(async () => (await cards.first().boundingBox())?.x).not.toBe(first?.x)

    // The legacy carousel looped, so the arrow is never dead.
    await expect(section.getByRole('button', { name: 'Previous aircraft' })).toBeEnabled()
  })

  test('leaves the rows of an aircraft an editor has only started empty', async ({ request }) => {
    const html = await (await request.get(pathFor('/sales_dept', 'en'))).text()

    // The fourth fixture aircraft carries a model and nothing else, and is shown last.
    expect(html).toContain('Cessna Citation XLS+')
    expect(html.indexOf('Cessna Citation XLS+')).toBeGreaterThan(html.indexOf('Gulfstream G650ER'))
  })
})
