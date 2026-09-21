import type { APIRequestContext, Page } from '@playwright/test'

import { testUser } from '../helpers/seedUser'
import { expect, test } from './fixtures'
import { pathFor } from './routes'

/**
 * What a lead left on a detail page says about where it came from (issue #153,
 * `docs/legacy-inventory.md` section 7.3).
 *
 * The legacy server action wrote `showBooking=Yachts` from the aircraft page as well as from the
 * yacht one, so every lead from the catalogue arrived saying the same thing and none of them
 * said which aircraft or yacht the visitor had been reading about (section 13, entry 30). These
 * submit from both pages and read the stored lead back.
 */
const DIALOG = '[data-section="booking-dialog"]'

/** Unique, so a run finds its own lead in a table every run adds to. */
const visitor = () => `Detail visitor ${Date.now().toString(36)}`

/** Issue #157 puts a floor under how fast a form may be filled in; a person is slower than this. */
const asAVisitor = (page: Page) => page.waitForTimeout(2_500)

/** The lead the desk sees, read as the administrator the run creates. */
async function storedLead(
  request: APIRequestContext,
  name: string,
): Promise<{ source?: string; page?: { url?: string } } | undefined> {
  const login = await request.post('/api/users/login', {
    data: { email: testUser.email, password: testUser.password },
  })

  expect(login.status(), 'admin login').toBe(200)

  const { token } = (await login.json()) as { token?: string }
  const found = await request.get(`/api/leads?where[name][equals]=${encodeURIComponent(name)}`, {
    headers: { Authorization: `JWT ${token}` },
  })

  expect(found.status()).toBe(200)

  const { docs } = (await found.json()) as {
    docs: Array<{ source?: string; page?: { url?: string } }>
  }

  return docs[0]
}

/** Opens the dialog from the detail page's own request card, then sends the booking form. */
async function leaveALead(page: Page, route: string, request: string): Promise<string> {
  const name = visitor()

  await page.goto(pathFor(route, 'en'))
  await page.getByRole('button', { name: request }).click()

  const dialog = page.locator(DIALOG)
  await expect(dialog).toBeVisible()

  await dialog.getByLabel('Name').fill(name)
  await dialog.getByLabel('Email').fill('visitor@example.test')
  await dialog.getByLabel('Phone number').fill('+971504589926')
  await asAVisitor(page)
  await dialog.getByRole('button', { name: 'Send' }).click()
  await expect(dialog.getByRole('status')).toHaveText('Successfully sent')

  return name
}

test.describe('a lead left on a detail page', () => {
  test('names the aircraft page and the aircraft', async ({ page, request }) => {
    const name = await leaveALead(page, '/aircraft/MOUSE', 'Request M-OUSE')
    const lead = await storedLead(request, name)

    expect(lead, 'no lead stored').toBeTruthy()
    expect(lead?.source).toBe('Aircraft_detail:MOUSE')
    // Not the yachts, which is what the legacy lead said (section 13, entry 30).
    expect(lead?.source).not.toContain('Yachts')
    expect(lead?.page?.url).toContain('/aircraft/MOUSE')
  })

  test('names the yacht page and the yacht', async ({ page, request }) => {
    const name = await leaveALead(page, '/yachts/azimut-serenity', 'Request Serenity')
    const lead = await storedLead(request, name)

    expect(lead, 'no lead stored').toBeTruthy()
    expect(lead?.source).toBe('Yachts_detail:azimut-serenity')
    expect(lead?.page?.url).toContain('/yachts/azimut-serenity')
  })
})
