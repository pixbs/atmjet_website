import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * The yacht charter page (issue #139, `docs/legacy-inventory.md` section 4, route
 * `/[locale]/yachts`): the fleet in the document the server sends, ordered through the URL.
 *
 * The legacy page read the whole table and then filtered and sorted it in the browser, so the
 * order a visitor chose had no address and the boxes reset to what they opened on the moment the
 * page they had asked for arrived.
 */
const LISTING = '[data-section="yachts-listing"]'

/** The yachts the listing is showing, in the order it is showing them. */
async function shown(page: import('@playwright/test').Page, query = ''): Promise<string[]> {
  await page.goto(`${pathFor('/yachts', 'en')}${query}`)
  await page.locator(LISTING).waitFor()

  return page
    .locator(`${LISTING} a[href*="/yachts/"]`)
    .evaluateAll((cards) => cards.map((card) => card.getAttribute('href') ?? ''))
}

test.describe('the yacht charter page', () => {
  test('is rendered on the server, in the order the legacy page had', async ({ request }) => {
    const response = await request.get(pathFor('/yachts', 'en'))
    const html = await response.text()

    expect(response.status()).toBe(200)
    expect(html.indexOf('data-section="hero-yachts"')).toBeLessThan(
      html.indexOf('data-section="listing-filters"'),
    )
    expect(html.indexOf('data-section="listing-filters"')).toBeLessThan(
      html.indexOf('data-section="yachts-listing"'),
    )
    expect(html.indexOf('data-section="yachts-listing"')).toBeLessThan(
      html.indexOf('data-section="contact-us"'),
    )
    // The cards are in the document, where the legacy list was assembled after it arrived.
    expect(html).toContain('/en/yachts/')
    expect(html).toContain('AED / per hour')
  })

  test('says it in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor('/yachts', 'ru'))).text()

    expect(html).toContain('Фильтровать яхты')
    expect(html).toContain('Применить')
    expect(html).not.toContain('Filter yachts')
  })

  test('prints what the legacy card printed, in the units it printed them in', async ({ page }) => {
    await page.goto(pathFor('/yachts', 'en'))
    const card = page.locator(`${LISTING} a[href*="/yachts/"]`).first()

    // `78ft / 24m`, the hourly price in its badge, and the hours spelled for the count.
    await expect(card).toContainText(/\d+ft \/ \d+m/)
    await expect(card).toContainText(/AED \/ per hour/)
    await expect(card).toContainText(/min \d+ hours?/)
  })
})

test.describe('the order the fleet is read in', () => {
  test('turns round when the URL asks for the other direction', async ({ page }) => {
    const up = await shown(page, '?sort=price')
    const down = await shown(page, '?sort=price&direction=desc')

    expect(up.length).toBeGreaterThan(2)
    // The yacht nobody has measured is last either way round: the legacy comparison read its
    // missing price as zero and opened the list with it (section 13, entry 51).
    expect(down.slice(0, -1)).toEqual([...up.slice(0, -1)].reverse())
    expect(down.at(-1)).toBe(up.at(-1))
  })

  test('is written into the URL when the card is applied', async ({ page }) => {
    await page.goto(pathFor('/yachts', 'en'))

    await page.getByLabel('Sort by').selectOption('guests')
    await page.getByLabel('Order').selectOption('desc')
    await page.getByRole('button', { name: 'Apply' }).click()

    await expect(page).toHaveURL(/[?&]sort=guests/)
    await expect(page).toHaveURL(/[?&]direction=desc/)
    // The boxes still say what the page was rendered for, which the legacy pair never did.
    await expect(page.getByLabel('Sort by')).toHaveValue('guests')
    await expect(page.getByLabel('Order')).toHaveValue('desc')
  })

  test('leaves out of the URL what the listing opens on', async ({ page }) => {
    await page.goto(`${pathFor('/yachts', 'en')}?sort=guests`)

    await page.getByLabel('Sort by').selectOption('price')
    await page.getByRole('button', { name: 'Apply' }).click()

    // One state, one address: the form would otherwise carry every default it holds.
    await expect(page).toHaveURL(pathFor('/yachts', 'en'))
  })
})
