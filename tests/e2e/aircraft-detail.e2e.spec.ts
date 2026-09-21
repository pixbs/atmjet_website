import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * One aircraft (issues #138, #136 and #137, `docs/legacy-inventory.md` section 4, route
 * `/[locale]/aircraft/[id]`): what the slug resolves to, which of the two layouts it is drawn
 * in, what each one says, and where the request the card takes ends up.
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

  test('says what the legacy said about the aircraft, from the catalogue', async ({ page }) => {
    await page.goto(pathFor('/aircraft/MOUSE', 'en'))
    const card = page.locator(`${SPECS} .md\\:sticky`).first()

    await expect(card.getByRole('heading', { level: 2 })).toHaveText(
      'Bombardier Global 6000 M-OUSE',
    )
    // The sentences the legacy built from the row rather than the description column, which it
    // never rendered here (section 4): the operator, the year, the base and the seats.
    await expect(card).toContainText('Operated by ATM JET')
    await expect(card).toContainText('built in 2021')
    await expect(card).toContainText('based at OMDB')
    await expect(card).toContainText('capacity of 13 people')
    // In the paragraphs the catalogue's line breaks make, not one run of text.
    await expect(card.locator('p')).toHaveCount(4)
  })

  test('stacks the photographs beside the figures, the newest first', async ({ page }) => {
    await page.goto(pathFor('/aircraft/MOUSE', 'en'))

    // The legacy reversed the whole set here, having drawn them the other way round above.
    await expect(page.locator(`${SPECS} img`)).toHaveCount(2)
  })
})

/**
 * The layout the legacy fell back to for an aircraft its catalogue held no photograph of
 * (issue #137, `docs/legacy-inventory.md` section 4, `aircraft/[id]/old.tsx`): the model with
 * the same sentences under it, the invitation to book, and the card of ten rows.
 *
 * `G-ATMB` is the one the fixture leaves unphotographed; `M-OUSE` is photographed, so the two
 * together are the switch the image count makes.
 */
test.describe('an aircraft nobody has photographed', () => {
  const BASIC = '[data-section="aircraft-basic"]'
  const ROWS = '[data-section="aircraft-context"] .card > div'

  test('is drawn in the basic layout, and one that is photographed is not', async ({ request }) => {
    const basic = await (await request.get(pathFor('/aircraft/GATMB', 'en'))).text()
    const rich = await (await request.get(pathFor('/aircraft/MOUSE', 'en'))).text()

    // The choice is the image count's, and it is made on the server: neither page carries the
    // other's sections at all.
    expect(basic).toContain('data-section="aircraft-basic"')
    expect(basic).not.toContain('data-section="aircraft-detail"')
    expect(basic).not.toContain('data-section="aircraft-specs"')
    expect(rich).toContain('data-section="aircraft-detail"')
    expect(rich).not.toContain('data-section="aircraft-basic"')
  })

  test('is headed by the model alone, and says the same sentences about itself', async ({
    page,
  }) => {
    await page.goto(pathFor('/aircraft/GATMB', 'en'))

    // The legacy headed this page with the model, where the rich layout carries the
    // registration beside it.
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dassault Falcon 7X')

    const said = page.locator(`${BASIC} p`)

    await expect(said).toContainText('flies under the tail number G-ATMB')
    await expect(said).toContainText('Operated by ATM JET')
    await expect(said).toContainText('based at LFPB')
  })

  test('lists the ten rows the legacy card carried, in its order', async ({ page }) => {
    await page.goto(pathFor('/aircraft/GATMB', 'en'))

    await expect(page.locator(`${ROWS} p:first-child`)).toHaveText([
      'Number:',
      'Operator:',
      'Year:',
      'Max pax:',
      'Home base:',
      'Home city:',
      'Home country:',
      'Manufacturer:',
      'Interior refit:',
      'Exterior refit:',
    ])
    await expect(page.locator(`${ROWS} p:last-child`)).toHaveText([
      'G-ATMB',
      'ATM JET',
      '2014',
      '12',
      'LFPB',
      'Paris',
      'France',
      'Dassault',
      '2019',
      '2018',
    ])
  })

  test('offers the flight request the legacy put under the sentences', async ({ page }) => {
    // The rich layout asks for the aircraft through the card beside its gallery; this page has
    // the booking invitation instead, as the legacy fallback did.
    await page.goto(pathFor('/aircraft/GATMB', 'en'))

    await expect(page.locator('[data-section="make-booking"]')).toBeVisible()
  })

  test('says the rows in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor('/aircraft/GATMB', 'ru'))).text()

    expect(html).toContain('Место стоянки:')
    expect(html).toContain('Производитель:')
    // The airport is localized in the catalogue, so the city follows the page too.
    expect(html).toContain('Париж')
  })
})
