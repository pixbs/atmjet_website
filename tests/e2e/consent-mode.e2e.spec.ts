import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * What the page tells Google Consent Mode (issue #174). The legacy site loaded the tag manager
 * with no consent signal at all and no way to send one, so every visit was measured the same
 * (`docs/legacy-inventory.md` section 13, entry 71).
 */
// A visitor who has not been asked yet, which every other spec is spared (see playwright.config.ts).
test.use({ storageState: { cookies: [], origins: [] } })

const BANNER = '[data-section="cookie-banner"]'

const banner = (page: Page) => page.locator(BANNER)

/** Each `gtag('consent', …)` call in the queue, in the order it was made. */
async function consentCommands(page: Page): Promise<string[][]> {
  return page.evaluate(() =>
    ((window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .filter((command) => command[0] === 'consent')
      .map((command) => [String(command[1]), JSON.stringify(command[2])]),
  )
}

const measurement = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage']

function signals(command: string[]): Record<string, string> {
  return JSON.parse(command[1] ?? '{}') as Record<string, string>
}

test.describe('consent mode', () => {
  test('starts every visit denied, before anything of Google can load', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await expect(banner(page)).toBeVisible()

    const commands = await consentCommands(page)
    expect(commands.map((command) => command[0])).toEqual(['default'])
    for (const signal of measurement) expect(signals(commands[0])[signal]).toBe('denied')
    // The two the settings call necessary: the answer itself is stored in one of them.
    expect(signals(commands[0]).functionality_storage).toBe('granted')
    expect(signals(commands[0]).security_storage).toBe('granted')
  })

  test('grants what the visitor agreed to, after the defaults rather than instead of them', async ({
    page,
  }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await banner(page).getByRole('button', { name: 'Accept all' }).click()

    await expect.poll(async () => (await consentCommands(page)).length).toBe(2)
    const commands = await consentCommands(page)
    expect(commands.map((command) => command[0])).toEqual(['default', 'update'])
    for (const signal of measurement) expect(signals(commands[1])[signal]).toBe('granted')
    expect(signals(commands[1]).personalization_storage).toBe('granted')
  })

  test('says so in the same words when the visitor refuses', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await banner(page).getByRole('button', { name: 'Reject all' }).click()

    await expect.poll(async () => (await consentCommands(page)).length).toBe(2)
    const commands = await consentCommands(page)
    for (const signal of measurement) expect(signals(commands[1])[signal]).toBe('denied')
  })

  test('tells Google again on the next visit, from the cookie', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await banner(page).getByRole('button', { name: 'Accept all' }).click()
    await expect.poll(async () => (await consentCommands(page)).length).toBe(2)

    await page.reload()
    await expect(banner(page)).toHaveCount(0)

    // The answer outlives the page it was given on, and the defaults still come first.
    await expect
      .poll(async () => (await consentCommands(page)).map((command) => command[0]))
      .toEqual(['default', 'update'])
    expect(signals((await consentCommands(page))[1]).analytics_storage).toBe('granted')
  })

  test('says only what was ticked in the settings', async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await banner(page).getByRole('button', { name: 'Customize' }).click()
    await page.locator('[data-section="cookie-modal"]').getByLabel('Personal Cookies').check()
    await page
      .locator('[data-section="cookie-modal"]')
      .getByRole('button', { name: 'Accept', exact: true })
      .click()

    await expect.poll(async () => (await consentCommands(page)).length).toBe(2)
    const update = signals((await consentCommands(page))[1])
    expect(update.personalization_storage).toBe('granted')
    for (const signal of measurement) expect(update[signal]).toBe('denied')
  })
})
