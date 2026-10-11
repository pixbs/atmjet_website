import { expect, test } from '@playwright/test'

import { ENABLED_LOCALES, pathFor, type Locale } from './routes'

/**
 * The privacy policy (issue #57): the page the legacy cookie banner linked to, which answered
 * 404 there (`docs/legacy-inventory.md` section 13, entry 71).
 */
// A visitor who has not been asked yet, so the banner and its link are on the page.
test.use({ storageState: { cookies: [], origins: [] } })

const BANNER = '[data-section="cookie-banner"]'

/** The link's words and a phrase of the policy, in each language the site serves. */
const POLICY: Record<Locale, { link: string; heading: string; words: string }> = {
  en: {
    link: 'Privacy Policy',
    heading: 'Privacy Policy',
    words: 'Federal Decree-Law No. 45 of 2021',
  },
  ru: {
    link: 'Политикой конфиденциальности',
    heading: 'Политика конфиденциальности',
    words: 'Федеральным декретом-законом ОАЭ № 45',
  },
  uk: {
    link: 'Політикою конфіденційності',
    heading: 'Політика конфіденційності',
    words: 'Федерального декрету-закону ОАЕ № 45',
  },
}

for (const locale of ENABLED_LOCALES) {
  const policy = POLICY[locale]

  test.describe(`[${locale}] the privacy policy`, () => {
    test('is where the cookie banner links, and answers 200', async ({ page, request }) => {
      await page.goto(pathFor('/styleguide', locale))
      const link = page.locator(BANNER).getByRole('link', { name: policy.link })

      const href = await link.getAttribute('href')
      expect(href).toBe(pathFor('/privacy', locale))
      expect((await request.get(href ?? '')).status()).toBe(200)

      await link.click()
      await expect(page).toHaveURL(pathFor('/privacy', locale))
      await expect(page.getByRole('heading', { level: 1, name: policy.heading })).toBeVisible()
    })

    test('is rendered on the server', async ({ request }) => {
      const response = await request.get(pathFor('/privacy', locale))
      expect(response.status()).toBe(200)

      const html = await response.text()
      expect(html).toContain(`<h1>${policy.heading}</h1>`)
      expect(html).toContain(policy.words)
      expect(html).toContain('href="mailto:info@atmjet.com"')
    })
  })
}
