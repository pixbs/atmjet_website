import { expect, test, type Page } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The airport field (issues #107 and #159, `docs/legacy-inventory.md` sections 6 and 8.5): what
 * it offers, when it offers it, and that it can be operated without a mouse — which the legacy
 * one could not.
 *
 * What it offers is the seeded airports as the search endpoint ranks them, busiest first, so the
 * two airports of a city come back in that order.
 */
const SECTION = '[data-section="autocomplete"]'

const fieldOf = (page: Page) => page.locator(SECTION).getByRole('combobox', { name: 'From' })
const listOf = (page: Page) => page.locator(SECTION).getByRole('listbox')
const skeletonOf = (page: Page) => page.locator(SECTION).getByTestId('autocomplete-loading')

/** Keeps every search the field sends waiting until the test answers it, with one option. */
async function holdSearches(page: Page) {
  const waiting = new Map<string, () => void>()

  await page.route(
    (url) => url.pathname === '/api/airports/search',
    async (route) => {
      const term = new URL(route.request().url()).searchParams.get('q') ?? ''
      await new Promise<void>((answer) => waiting.set(term, answer))
      await route.fulfill({ json: { options: [`Answer to ${term}`] } })
    },
  )

  return {
    answer: async (term: string) => {
      await expect.poll(() => waiting.has(term)).toBe(true)
      waiting.get(term)?.()
    },
  }
}

test.describe('the airport autocomplete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(pathFor('/styleguide', 'en'))
    await fieldOf(page).scrollIntoViewIfNeeded()
  })

  test('offers nothing until there are two characters to search on', async ({ page }) => {
    // The legacy search returned the term itself below two characters (section 8.5).
    await fieldOf(page).fill('D')

    await expect(listOf(page)).toHaveCount(0)
  })

  test('offers the airports that match, once the typing has settled', async ({ page }) => {
    await fieldOf(page).fill('dub')

    await expect(listOf(page).getByRole('option')).toHaveCount(2)
    await expect(listOf(page).getByRole('option').first()).toHaveText(
      'Dubai (OMDB) United Arab Emirates, Dubai International',
    )
  })

  test('shows a skeleton of the list until the term typed last is answered', async ({ page }) => {
    // The legacy field showed nothing while it searched and looked broken (section 13, entry 100).
    const searches = await holdSearches(page)
    const field = fieldOf(page)

    await field.fill('dub')
    await expect(field).toHaveAttribute('aria-busy', 'true')
    await expect(skeletonOf(page)).toBeVisible()

    // Typed over before it was answered, the first search is left waiting and no longer counts.
    await field.fill('dubai')
    await searches.answer('dubai')

    await expect(listOf(page).getByRole('option')).toHaveText(['Answer to dubai'])
    await expect(field).toHaveAttribute('aria-busy', 'false')
    await expect(skeletonOf(page)).toHaveCount(0)
  })

  test('puts the airport that was clicked into the field and shuts the list', async ({ page }) => {
    const field = fieldOf(page)
    await field.fill('bourget')
    await listOf(page).getByRole('option').first().click()

    await expect(field).toHaveValue('Paris (LFPB) France, Le Bourget')
    await expect(listOf(page)).toHaveCount(0)
  })

  test('can be worked with the keyboard alone', async ({ page }) => {
    const field = fieldOf(page)
    // The legacy list was a `ul` of `li` with a click handler and nothing else.
    await field.fill('paris')
    await expect(listOf(page).getByRole('option')).toHaveCount(2)

    await field.press('ArrowDown')
    await field.press('ArrowDown')
    await expect(field).toHaveAttribute('aria-activedescendant', /.+/)
    await field.press('Enter')

    // The second of the two: the search ranks the busiest airport of a city first (issue #159).
    await expect(field).toHaveValue('Paris (LFPB) France, Le Bourget')
    await expect(listOf(page)).toHaveCount(0)
  })

  test('shuts the list on Escape, leaving what was typed', async ({ page }) => {
    const field = fieldOf(page)
    await field.fill('geneva')
    await expect(listOf(page)).toBeVisible()

    await field.press('Escape')

    await expect(listOf(page)).toHaveCount(0)
    await expect(field).toHaveValue('geneva')
  })
})
