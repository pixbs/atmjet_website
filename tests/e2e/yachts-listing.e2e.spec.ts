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

/**
 * The three bands the card narrows the fleet with (issue #139, `docs/legacy-inventory.md`
 * section 4). The legacy trio wrote itself into the URL and then never read itself back out, so
 * every box said "All" again the moment the page it had asked for arrived (section 13, entry 42).
 */
test.describe('narrowing the fleet', () => {
  test('keeps only what every band asked for takes', async ({ page }) => {
    const whole = await shown(page)
    const dear = await shown(page, '?price=Lux')

    expect(dear.length).toBeGreaterThan(0)
    expect(dear.length).toBeLessThan(whole.length)
    for (const yacht of dear) expect(whole).toContain(yacht)
  })

  test('means what it says by more than sixty guests', async ({ page }) => {
    // The legacy case had no `break` and fell through into `All`, so the band that promised the
    // largest yachts showed the whole fleet (section 13, entry 39).
    const whole = await shown(page)
    const largest = await shown(page, '?guests=60%2B')

    expect(largest.length).toBeLessThan(whole.length)
  })

  test('says so when a band leaves nothing, and offers the way back', async ({ page }) => {
    await page.goto(`${pathFor('/yachts', 'en')}?guests=60%2B`)

    await expect(
      page.locator(LISTING).getByRole('heading', { name: 'No yachts found' }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: 'Reset filters' })).toHaveAttribute(
      'href',
      pathFor('/yachts', 'en'),
    )
  })

  test('opens every box on what the page was served with', async ({ page }) => {
    await page.goto(`${pathFor('/yachts', 'en')}?price=Lux&guests=30`)

    await expect(page.getByLabel('Price')).toHaveValue('Lux')
    await expect(page.getByLabel('Guests')).toHaveValue('30')
    await expect(page.getByLabel('Length ft')).toHaveValue('All')
  })

  test('writes the bands a visitor chose into the URL, and no others', async ({ page }) => {
    await page.goto(pathFor('/yachts', 'en'))

    await page.getByLabel('Price').selectOption('3500')
    await page.getByRole('button', { name: 'Apply' }).click()

    await expect(page).toHaveURL(/[?&]price=3500/)
    await expect(page).not.toHaveURL(/guests=/)
    await expect(page).not.toHaveURL(/length=/)
  })
})
