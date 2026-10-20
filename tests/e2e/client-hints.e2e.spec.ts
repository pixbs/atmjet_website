import { expect, test } from '@playwright/test'

import { pathFor } from './routes'

/**
 * The colour-scheme client hint belongs to the admin alone (issue #453): on a public page its
 * `Critical-CH` made Chrome throw the first response away and ask again.
 */
const PUBLIC_PATHS = [pathFor('/', 'en'), pathFor('/aircraft', 'en'), pathFor('/styleguide', 'en')]

test.describe('the colour-scheme client hint', () => {
  test('a public page asks for no client hint', async ({ request }) => {
    for (const path of PUBLIC_PATHS) {
      const headers = (await request.get(path)).headers()

      expect(headers['accept-ch'], path).toBeUndefined()
      expect(headers['critical-ch'], path).toBeUndefined()
      expect(headers['vary'] ?? '', path).not.toContain('Sec-CH-Prefers-Color-Scheme')
    }
  })

  test('a first visit to a public page is answered with one document request', async ({ page }) => {
    const documents: string[] = []

    page.on('request', (request) => {
      if (request.resourceType() === 'document') documents.push(request.url())
    })
    await page.goto(pathFor('/aircraft', 'en'))

    expect(documents).toHaveLength(1)
  })

  test('the admin still asks for the colour scheme', async ({ request }) => {
    for (const path of ['/admin', '/admin/login']) {
      const headers = (await request.get(path, { maxRedirects: 0 })).headers()

      expect(headers['accept-ch'], path).toBe('Sec-CH-Prefers-Color-Scheme')
      expect(headers['critical-ch'], path).toBe('Sec-CH-Prefers-Color-Scheme')
    }
  })
})
