import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The cookie question and what the answer to it decides (issue #91,
 * `docs/legacy-inventory.md` section 3.7).
 *
 * The legacy site asked and then ignored the answer: the tag manager loaded from the layout on
 * every visit whichever button was clicked (section 13, entry 71). Everything here is that fix.
 */
// A visitor who has not been asked yet, which every other spec is spared (see playwright.config.ts).
test.use({ storageState: { cookies: [], origins: [] } })

const BANNER = '[data-section="cookie-banner"]'
const MODAL = '[data-section="cookie-modal"]'
const TAG = 'script[src*="googletagmanager.com"]'

/** The tag can only be proved where the deployment has one to load. */
const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? ''

const banner = (page: Page) => page.locator(BANNER)

async function open(page: Page) {
  await page.goto(pathFor('/styleguide', 'en'))
  await expect(banner(page)).toBeVisible()
}

test.describe('the cookie question', () => {
  test('is asked until it is answered, and not after', async ({ page }) => {
    await open(page)

    await banner(page).getByRole('button', { name: 'Accept all' }).click()
    await expect(banner(page)).toHaveCount(0)

    await page.reload()
    await expect(banner(page)).toHaveCount(0)
  })

  test('keeps the answer beyond the session the legacy lost it with', async ({ page }) => {
    await open(page)
    await banner(page).getByRole('button', { name: 'Reject all' }).click()

    // The legacy banner wrote session cookies, so a visitor who answered there was asked again
    // on their next visit (section 13, entry 71).
    const cookies = await page.context().cookies()
    const answered = cookies.find((cookie) => cookie.name === 'cookie-consent')
    expect(answered?.value).toBe('true')
    expect(answered?.expires).toBeGreaterThan(Date.now() / 1000 + 60 * 60 * 24 * 300)
  })

  test('opens the settings and closes them again without answering', async ({ page }) => {
    await open(page)
    await banner(page).getByRole('button', { name: 'Customize' }).click()
    await expect(page.locator(MODAL)).toBeVisible()

    // The legacy panel could not be closed from the keyboard at all.
    await page.keyboard.press('Escape')
    await expect(page.locator(MODAL)).toHaveCount(0)
    await expect(banner(page)).toBeVisible()
  })

  test('writes what was ticked in the settings', async ({ page }) => {
    await open(page)
    await banner(page).getByRole('button', { name: 'Customize' }).click()
    await page.locator(MODAL).getByLabel('Marketing cookies').check()
    await page.locator(MODAL).getByRole('button', { name: 'Accept', exact: true }).click()

    await expect(page.locator(MODAL)).toHaveCount(0)
    const cookies = await page.context().cookies()
    expect(cookies.find((cookie) => cookie.name === 'marketing-consent')?.value).toBe('true')
    expect(cookies.find((cookie) => cookie.name === 'personal-consent')?.value).toBe('false')
  })
})

test.describe('the tag manager', () => {
  test.skip(gtmId === '', 'this deployment has no tag to load')

  test('is not loaded before the visitor has answered', async ({ page }) => {
    await open(page)

    await expect(page.locator(TAG)).toHaveCount(0)
  })

  test('is loaded once the visitor has agreed, and again on the next page', async ({ page }) => {
    await open(page)
    await banner(page).getByRole('button', { name: 'Accept all' }).click()

    await expect(page.locator(TAG)).toHaveCount(1)

    await page.reload()
    await expect(page.locator(TAG)).toHaveCount(1)
  })

  test('stays away when the visitor has refused, however often they come back', async ({
    page,
  }) => {
    await open(page)
    await banner(page).getByRole('button', { name: 'Reject all' }).click()

    await expect(page.locator(TAG)).toHaveCount(0)

    await page.reload()
    await expect(banner(page)).toHaveCount(0)
    await expect(page.locator(TAG)).toHaveCount(0)
  })
})
