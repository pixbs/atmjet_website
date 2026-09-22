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
    expect(html).toContain('How do I order a plane and what documents are needed for this?')
    expect(html).toContain('Fill out the booking form')
  })

  test('opens on its first question, as the legacy list did', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    const section = page.locator(SECTION)

    await expect(
      section.getByRole('button', {
        name: 'How do I order a plane and what documents are needed for this?',
      }),
    ).toHaveAttribute('aria-expanded', 'true')
    await expect(section.getByText('Fill out the booking form')).toBeVisible()
  })

  test('shows one answer at a time', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    const section = page.locator(SECTION)

    await section
      .getByRole('button', { name: 'Can I change the conditions of the booked flight?' })
      .click()

    await expect(section.getByText('YES, AND YOU CAN RELY ON:')).toBeVisible()
    await expect(section.getByText('Fill out the booking form')).toHaveCount(0)
  })

  test('keeps the line breaks an answer was written with', async ({ page }) => {
    await page.goto(pathFor('/', 'en'))
    const section = page.locator(SECTION)

    await section
      .getByRole('button', { name: 'How much does it cost to rent a plane, the price?' })
      .click()
    const answer = section.locator('p', { hasText: 'The cost of a private jet' })

    // The factors on a line each under the sentence that introduces them, which is how the
    // legacy answer was written: six lines, so five breaks between them. They are an editor's
    // paragraph now rather than a string split on `\n` (issue #72).
    await expect(answer.locator('br')).toHaveCount(5)
  })

  test('speaks the language of the page it is on', async ({ request }) => {
    const html = await (await request.get(pathFor('/', 'ru'))).text()

    expect(html).toContain('Сколько стоит аренда самолета, цена?')
    expect(html).not.toContain('How much does it cost to rent a plane')
  })
})
