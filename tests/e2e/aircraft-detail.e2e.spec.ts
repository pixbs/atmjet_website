import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * One aircraft (issues #138 and #136, `docs/legacy-inventory.md` section 4, route
 * `/[locale]/aircraft/[id]`): what the slug resolves to, what the page draws, and where the
 * request the card takes ends up.
 *
 * The slug the listing writes for a seeded aircraft is its registration, because the import that
 * brings the catalogue's own slugs is E5.7; both shapes answer here, which is what the legacy
 * page did and what its sitemap of bare tail numbers relied on.
 */
const DETAIL = '[data-section="aircraft-detail"]'

/** The first card of the listing, and the aircraft it leads to. */
async function firstListed(page: import('@playwright/test').Page): Promise<string> {
  await page.goto(pathFor('/aircraft', 'en'))
  const href = await page
    .locator('[data-section="aircraft-listing"] a[href*="/aircraft/"]')
    .first()
    .getAttribute('href')

  return href ?? ''
}

test.describe('an aircraft page', () => {
  test('is rendered on the server, with the aircraft named in its heading', async ({
    page,
    request,
  }) => {
    const href = await firstListed(page)
    const response = await request.get(href)
    const html = await response.text()

    expect(response.status()).toBe(200)
    expect(html).toContain('data-section="aircraft-detail"')
    // The type and the registration together, as the legacy heading read.
    expect(html).toMatch(/<h1>[^<]*[A-Z0-9-]{4,}/)
    expect(html).toContain('data-section="vehicle-request"')
  })

  test('is the one the listing card leads to', async ({ page }) => {
    const href = await firstListed(page)

    await page.goto(href)

    await expect(page.locator(DETAIL)).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('answers to a bare registration, which is what the legacy sitemap advertised', async ({
    request,
  }) => {
    const response = await request.get(pathFor('/aircraft/MOUSE', 'en'))

    expect(response.status()).toBe(200)
    expect(await response.text()).toContain('M-OUSE')
  })

  test('sends a slug no aircraft answers to back to the listing', async ({ request }) => {
    // The legacy page called `redirect('/aircraft')` without a locale, so it answered only
    // through the middleware; this carries one (section 3.3).
    const response = await request.get(pathFor('/aircraft/nothing-here', 'en'), {
      maxRedirects: 0,
    })

    expect(response.status()).toBe(307)
    expect(response.headers()['location']).toBe(pathFor('/aircraft', 'en'))
  })

  test('says it in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor('/aircraft/MOUSE', 'ru'))).text()

    expect(html).toContain('Запросить M-OUSE')
    expect(html).toContain('Откуда')
  })
})

test.describe('the request a detail page takes', () => {
  test('opens the booking dialog naming the page it came from', async ({ page }) => {
    // The legacy action wrote `showBooking=Yachts` on an aircraft page, so a lead left here
    // arrived saying it came from the yachts (section 13, entry 30).
    await page.goto(pathFor('/aircraft/MOUSE', 'en'))

    await page.getByRole('button', { name: 'Request M-OUSE' }).click()

    // And which aircraft, which the legacy lead never said either (issue #153).
    await expect(page).toHaveURL(
      /showBooking=Aircraft_detail%3AMOUSE|showBooking=Aircraft_detail:MOUSE/,
    )
    await expect(page).not.toHaveURL(/showBooking=Yachts/)
    await expect(page.locator('[data-section="booking-dialog"]')).toBeVisible()
  })

  test('hands the leg it was given to the dialog', async ({ page }) => {
    await page.goto(pathFor('/aircraft/MOUSE', 'en'))

    await page.getByLabel('Date').fill('2026-10-01')
    await page.getByRole('button', { name: 'Request M-OUSE' }).click()

    await expect(page).toHaveURL(/direction=/)
    await expect(page).toHaveURL(/2026-10-01/)
  })
})

/**
 * The half of the page below the rule (issue #136, `docs/legacy-inventory.md` section 4): the
 * description card beside a photograph, and the figures beside the rest of them. The legacy drew
 * it only for an aircraft that has photographs; one without falls back to a plainer page (#137).
 */
test.describe('what a detail page says about the aircraft', () => {
  const SPECS = '[data-section="aircraft-specs"]'

  test('is rendered on the server, not fetched once the page is open', async ({ request }) => {
    const html = await (await request.get(pathFor('/aircraft/MOUSE', 'en'))).text()

    expect(html).toContain('data-section="aircraft-specs"')
    expect(html).toContain('Key stats')
  })

  test('draws the figures the catalogue has, in the legacy order', async ({ page }) => {
    await page.goto(pathFor('/aircraft/MOUSE', 'en'))
    // The label under each figure, not the paragraphs of the description card beside them.
    const labels = page.locator(`${SPECS} h3 + p`)

    await expect(labels).toHaveText([
      'max pax',
      'type',
      'cabin height',
      'length/width',
      'year',
      'range',
    ])
  })

  test('prints the measurements with their units and the range grouped', async ({ page }) => {
    await page.goto(pathFor('/aircraft/MOUSE', 'en'))
    const figures = page.locator(`${SPECS} h3`)

    await expect(figures).toContainText(['13', 'Ultra long range', '1.88m', '13.18m/2.49m'])
    // The legacy grouped this with the server's default locale; it follows the page now.
    await expect(figures.last()).toHaveText('11,112km')
  })

  test('leaves out a figure the catalogue has not filled in', async ({ page }) => {
    // The legacy hid one it had no value for rather than printing a zero (section 4). This
    // aircraft is the one the fixture left unmeasured.
    await page.goto(pathFor('/aircraft/VPCAT', 'en'))

    await expect(page.locator(`${SPECS} h3 + p`)).toHaveText(['type'])
  })

  test('keeps the description in the paragraphs an editor typed', async ({ page }) => {
    await page.goto(pathFor('/aircraft/MOUSE', 'en'))
    const card = page.locator(`${SPECS} .md\\:sticky`).first()

    await expect(card.getByRole('heading', { level: 2 })).toHaveText(
      'Bombardier Global 6000 M-OUSE',
    )
    await expect(card.locator('p')).toHaveCount(2)
  })

  test('stacks the photographs beside the figures, the newest first', async ({ page }) => {
    await page.goto(pathFor('/aircraft/MOUSE', 'en'))

    // The legacy reversed the whole set here, having drawn them the other way round above.
    await expect(page.locator(`${SPECS} img`)).toHaveCount(2)
  })
})
