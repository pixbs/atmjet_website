import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The key features section as a block (issue #118, `docs/legacy-inventory.md` section 5): the
 * cards come from the document and the carousel around them is the only part that needs a
 * script, so the words are on the page before it runs.
 */
const SECTION = '[data-section="key-features"]'

test.describe('the key features section', () => {
  test('is in the HTML the server sends, every feature of it', async ({ request }) => {
    const html = await (await request.get(pathFor('/medical_aviation', 'en'))).text()

    expect(html).toContain('data-section="key-features"')
    expect(html).toContain('The aircraft is fitted for the patient, not for the route.')
    expect(html).toContain('An intensive care cabin')
    expect(html).toContain('Door to door')
  })

  test('moves the features along on the next arrow', async ({ page }) => {
    await page.goto(pathFor('/medical_aviation', 'en'))
    const section = page.locator(SECTION)
    const first = section.getByRole('heading', { name: 'An intensive care cabin' })
    await expect(first).toBeVisible()
    const before = (await first.boundingBox())?.x ?? 0

    await section.getByRole('button', { name: 'Next' }).click()

    // The legacy arrows were two unnamed buttons; nothing but a mouse could find them.
    await expect.poll(async () => (await first.boundingBox())?.x ?? before).toBeLessThan(before)
  })

  test('names its arrows in the language of the page', async ({ page }) => {
    await page.goto(pathFor('/medical_aviation', 'ru'))
    const section = page.locator(SECTION)

    await expect(section.getByRole('button', { name: 'Вперёд' })).toBeVisible()
    await expect(section.getByRole('heading', { name: 'Реанимационная кабина' })).toBeVisible()
  })
})
