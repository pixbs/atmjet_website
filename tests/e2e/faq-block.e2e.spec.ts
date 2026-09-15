import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The FAQ as a block (issue #123, `docs/legacy-inventory.md` section 5), on the home page, the
 * one page the legacy drew it on. The questions and answers come from the document and are in
 * the markup before any script runs; the accordion decides which answer is showing.
 *
 * The legacy title was a `<p>` with an `onClick`: no way in from the keyboard and nothing for a
 * screen reader to announce. The ported accordion answers as a button (issue #106).
 */
const SECTION = '[data-section="faq"]'

test.describe('the FAQ section', () => {
  test('is in the HTML the server sends, questions and answers alike', async ({ request }) => {
    const html = await (await request.get(pathFor('/', 'en'))).text()

    expect(html).toContain('data-section="faq"')
    expect(html).toContain('How soon can we fly?')
    expect(html).toContain('Three hours from the call, once the crew and the slot are held.')
  })

  test('opens on its first question, as the legacy list did', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    const section = page.locator(SECTION)

    await expect(section.getByRole('button', { name: 'How soon can we fly?' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(section.getByText('Three hours from the call')).toBeVisible()
  })

  test('shows one answer at a time', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    const section = page.locator(SECTION)

    await section.getByRole('button', { name: 'Can we change the route?' }).click()

    await expect(section.getByText('Up to the moment the flight plan is filed')).toBeVisible()
    await expect(section.getByText('Three hours from the call')).toHaveCount(0)
  })

  test('keeps the line breaks an answer was written with', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    const section = page.locator(SECTION)

    await section.getByRole('button', { name: 'What does the price include?' }).click()
    const answer = section.locator('p', { hasText: 'The aircraft, the crew' })

    // Two lines, so two spans: the legacy split its answers on the newline too.
    await expect(answer.locator('span')).toHaveCount(2)
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/', 'ru'))).text()

    expect(html).toContain('Как скоро вылет?')
    expect(html).not.toContain('How soon can we fly?')
  })
})
