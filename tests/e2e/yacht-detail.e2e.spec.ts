import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * One charter yacht (issue #140, `docs/legacy-inventory.md` section 4, route
 * `/[locale]/yachts/[id]`): what the slug resolves to, what the page draws, and where the
 * request the card takes ends up.
 *
 * Four defects of the legacy page are what most of these assert: the substring lookup, the
 * gallery that could not open a yacht with one photograph, the berth that was shown and never
 * sent, and the guests field that opened on a number of hours (section 13, entries 44 to 47).
 */
const DETAIL = '[data-section="yacht-detail"]'

/** A seeded yacht: two photographs, a berth, a price and a four-hour minimum. */
const SERENITY = '/yachts/azimut-serenity'

/** The one with a single photograph, which is what entry 45 crashed on. */
const BLUEWATER = '/yachts/sunseeker-bluewater'

test.describe('a yacht page', () => {
  test('is rendered on the server, with the yacht named in its heading', async ({ request }) => {
    const response = await request.get(pathFor(SERENITY, 'en'))
    const html = await response.text()

    expect(response.status()).toBe(200)
    expect(html).toContain('data-section="yacht-detail"')
    // The maker and the name in quotation marks, as the legacy heading read.
    expect(html).toContain('Azimut &quot;Serenity&quot;')
    expect(html).toContain('data-section="yacht-request"')
  })

  test('is the one the listing card leads to', async ({ page }) => {
    await page.goto(pathFor('/yachts', 'en'))
    const href = await page
      .locator('[data-section="yachts-listing"] a[href*="/yachts/"]')
      .first()
      .getAttribute('href')

    await page.goto(href ?? '')

    await expect(page.locator(DETAIL)).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('answers to its whole slug and not to a piece of one', async ({ request }) => {
    // The legacy lookup was `ILIKE '%id%'` with no order, so a fragment of a slug opened
    // whichever row the table handed over first (section 13, entry 44).
    const whole = await request.get(pathFor(SERENITY, 'en'))
    const fragment = await request.get(pathFor('/yachts/serenity', 'en'), { maxRedirects: 0 })

    expect(whole.status()).toBe(200)
    expect(fragment.status()).toBe(307)
  })

  test('sends a slug no yacht answers to back to the listing', async ({ request }) => {
    // The legacy page called `redirect('/yachts')` without a locale, so it answered only
    // through the middleware; this carries one (section 3.3).
    const response = await request.get(pathFor('/yachts/nothing-here', 'en'), { maxRedirects: 0 })

    expect(response.status()).toBe(307)
    expect(response.headers()['location']).toBe(pathFor('/yachts', 'en'))
  })

  test('opens on a yacht with one photograph, where the legacy gallery threw', async ({ page }) => {
    await page.goto(pathFor(BLUEWATER, 'en'))

    await expect(page.locator(DETAIL)).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Bluewater')
  })

  test('says it in the language of the page', async ({ request }) => {
    const html = await (await request.get(pathFor(SERENITY, 'ru'))).text()

    expect(html).toContain('Заказать Serenity')
    expect(html).toContain('Откуда')
  })
})

test.describe('the request a yacht page takes', () => {
  test('shows the berth without letting it be edited', async ({ page }) => {
    await page.goto(pathFor(SERENITY, 'en'))
    const from = page.getByLabel('From')

    await expect(from).toHaveValue('Dubai Marina')
    // Read-only rather than disabled: a disabled control is not submitted, which is how the
    // legacy message lost the berth it was showing (section 13, entry 47).
    await expect(from).toHaveJSProperty('readOnly', true)
    await expect(from).toBeEnabled()
  })

  test('opens the guests field on one guest, not on a number of hours', async ({ page }) => {
    // The legacy `defaultValue={minHours || 1}` on the guests field was a copy-paste from the
    // field beside it, so a yacht with a four-hour minimum opened asking for four guests
    // (section 13, entry 46).
    await page.goto(pathFor(SERENITY, 'en'))

    await expect(page.getByLabel('Guests')).toHaveValue('1')
    await expect(page.getByLabel('Hours')).toHaveValue('4')
  })

  test('opens the booking dialog naming the page it came from', async ({ page }) => {
    await page.goto(pathFor(SERENITY, 'en'))

    await page.getByRole('button', { name: 'Request Serenity' }).click()

    // And which yacht, which the legacy lead never said either (issue #153).
    await expect(page).toHaveURL(
      /showBooking=Yachts_detail%3Aazimut-serenity|showBooking=Yachts_detail:azimut-serenity/,
    )
    await expect(page.locator('[data-section="booking-dialog"]')).toBeVisible()
  })

  test('hands the berth, the hours and the guests to the dialog', async ({ page }) => {
    await page.goto(pathFor(SERENITY, 'en'))

    await page.getByLabel('Date').fill('2026-10-01')
    await page.getByLabel('Guests').fill('6')
    await page.getByRole('button', { name: 'Request Serenity' }).click()

    await expect(page).toHaveURL(/direction=/)
    const url = decodeURIComponent(page.url())
    expect(url).toContain('"from":"Dubai Marina"')
    expect(url).toContain('"date":"2026-10-01"')
    expect(url).toContain('"hours":4')
    expect(url).toContain('"guests":6')
  })
})

/**
 * What the page carries under the request card (issue #140, section 4, `/yachts/[id]` item 3):
 * the six figures, what a charter includes, the description and the photographs the legacy
 * stacked beside it.
 */
test.describe('what a yacht page says about herself', () => {
  const SPECS = '[data-section="yacht-specs"]'

  test('draws the six figures the legacy card drew, in its order', async ({ page }) => {
    await page.goto(pathFor(SERENITY, 'en'))
    const labels = await page.locator(`${SPECS} p`).allInnerTexts()

    expect(labels.slice(0, 6)).toEqual([
      'pax day/night',
      'length ft/m',
      'cabins',
      'bathrooms',
      'min rental hours',
      'refit',
    ])
  })

  test('prints the figures the legacy composed out of two columns', async ({ page }) => {
    await page.goto(pathFor(SERENITY, 'en'))
    const card = page.locator(SPECS).getByRole('heading', { level: 3 })

    // `guestsDay / guestsNight`, and the feet with the metres worked out from them.
    await expect(card.nth(0)).toHaveText('20 / 8')
    await expect(card.nth(1)).toHaveText('78 / 24')
  })

  test('counts the hours in the language of the page', async ({ request }) => {
    // The legacy wrote `${minHours} hours` on the Russian page too (section 13, entry 49).
    const html = await (await request.get(pathFor(SERENITY, 'ru'))).text()

    expect(html).toContain('4 часа')
    expect(html).toContain('мин. часов аренды')
  })

  test('says what the price includes', async ({ page }) => {
    await page.goto(pathFor(SERENITY, 'en'))

    await expect(page.locator(SPECS)).toContainText('Included in the price:')
    await expect(page.locator(SPECS)).toContainText('Crew, fuel, soft drinks and a tender.')
  })

  test('keeps the description in the paragraphs an editor typed', async ({ page }) => {
    // The legacy split it on full stops and dropped whatever followed the last one (entry 50).
    await page.goto(pathFor(SERENITY, 'en'))
    const about = page.locator(SPECS).locator('p')

    await expect(page.locator(SPECS)).toContainText('she leaves from the pontoon she is moored at.')
    expect(await about.filter({ hasText: 'flybridge' }).count()).toBe(1)
  })

  test('stacks the photographs the gallery and the band did not take', async ({ page }) => {
    // `photos.slice(2, -1).slice(2)`: the fifth to the second from last, which of six is one.
    await page.goto(pathFor(SERENITY, 'en'))

    await expect(page.locator(`${SPECS} img`)).toHaveCount(2)
  })

  test('draws the section for a yacht with a single photograph too', async ({ page }) => {
    await page.goto(pathFor(BLUEWATER, 'en'))

    await expect(page.locator(SPECS)).toBeVisible()
    // The one photograph is both the last and the only: the stack beside the description is empty.
    await expect(page.locator(`${SPECS} img`)).toHaveCount(1)
  })
})

test.describe('what a search engine is told about a yacht', () => {
  test('names her, points at her own URL and offers her photograph', async ({ page }) => {
    await page.goto(pathFor(SERENITY, 'en'))

    await expect(page).toHaveTitle(/Azimut "Serenity"/)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      new RegExp(`${SERENITY}$`),
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1)
  })
})
