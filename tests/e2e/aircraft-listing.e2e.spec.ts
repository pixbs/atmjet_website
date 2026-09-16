import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * The aircraft page (issue #135, `docs/legacy-inventory.md` section 4, route
 * `/[locale]/aircraft`): the sections in the order the legacy page had them, and the listing
 * among them sorted and read through the URL.
 *
 * The legacy list fetched its cards from the browser after mount, kept the sort in React state
 * and lost it on the way to the next batch, so no listing had an address and the first paint was
 * empty (section 13, entries 25 and 28). What is asserted here is that the URL is the state.
 */
const LISTING = '[data-section="aircraft-listing"]'

/** The aircraft the listing is showing, in the order it is showing them. */
async function shown(page: import('@playwright/test').Page, query = ''): Promise<string[]> {
  await page.goto(`${pathFor('/aircraft', 'en')}${query}`)
  await page.locator(LISTING).waitFor()

  return page
    .locator(`${LISTING} a[href*="/aircraft/"]`)
    .evaluateAll((cards) => cards.map((card) => card.getAttribute('href') ?? ''))
}

test.describe('the aircraft page', () => {
  test('is rendered on the server, in the order the legacy page had', async ({ request }) => {
    const response = await request.get(pathFor('/aircraft', 'en'))
    const html = await response.text()

    expect(response.status()).toBe(200)
    // The cards are in the document the server sent, where the legacy list was empty until the
    // browser had fetched them.
    expect(html.indexOf('data-section="hero-aircraft"')).toBeLessThan(
      html.indexOf('data-section="contact-card"'),
    )
    expect(html.indexOf('data-section="contact-card"')).toBeLessThan(
      html.indexOf('data-section="aircraft-filter"'),
    )
    expect(html.indexOf('data-section="aircraft-listing"')).toBeLessThan(
      html.indexOf('data-section="contact-us"'),
    )
    expect(html).toContain('/en/aircraft/')
  })

  test('says it in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor('/aircraft', 'ru'))).text()

    expect(html).toContain('Фильтровать самолёты')
    expect(html).toContain('Сортировать по')
    expect(html).not.toContain('Sort by')
  })
})

test.describe('the order the listing is read in', () => {
  test('turns round when the URL asks for the other direction', async ({ page }) => {
    const up = await shown(page, '?sort=range')
    const down = await shown(page, '?sort=range&direction=desc')

    expect(up.length).toBeGreaterThan(2)
    // The aircraft nobody has measured is last either way round, so it is not part of the turn:
    // the legacy list left it out of every answer altogether (section 13, entry 24).
    expect(down.slice(0, -1)).toEqual([...up.slice(0, -1)].reverse())
    expect(down.at(-1)).toBe(up.at(-1))
  })

  test('is written into the URL when a visitor picks one', async ({ page }) => {
    await page.goto(pathFor('/aircraft', 'en'))

    await page.getByLabel('Sort by').selectOption('range')

    await expect(page).toHaveURL(/[?&]sort=range/)
    // What the listing opens on is left out, so one state has one address.
    await expect(page).not.toHaveURL(/direction=/)
    await expect(page.getByLabel('Sort by')).toHaveValue('range')
  })

  test('starts again from the first batch when the order changes', async ({ page }) => {
    await page.goto(`${pathFor('/aircraft', 'en')}?perPage=1&page=2`)

    await page.getByLabel('Order').selectOption('desc')

    await expect(page).not.toHaveURL(/page=/)
  })
})

test.describe('asking for more of the listing', () => {
  test('adds a batch without losing the order', async ({ page }) => {
    await page.goto(`${pathFor('/aircraft', 'en')}?perPage=1&sort=range&direction=desc`)
    const first = await page
      .locator(`${LISTING} a[href*="/aircraft/"]`)
      .first()
      .getAttribute('href')

    // The legacy button asked for the next fifteen with no sort at all, so what arrived was in
    // id order under a heading that said otherwise (section 13, entry 25).
    await page.getByRole('link', { name: 'Show more' }).click()

    await expect(page).toHaveURL(/sort=range/)
    const cards = page.locator(`${LISTING} a[href*="/aircraft/"]`)
    await expect(cards).toHaveCount(2)
    await expect(cards.first()).toHaveAttribute('href', first ?? '')
  })

  test('is not offered once there is nothing more to read', async ({ page }) => {
    await page.goto(`${pathFor('/aircraft', 'en')}?perPage=100`)

    await expect(page.getByRole('link', { name: 'Show more' })).toHaveCount(0)
  })
})
