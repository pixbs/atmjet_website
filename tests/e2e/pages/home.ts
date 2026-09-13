import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test'
import { pathFor, type Locale } from '../routes'

/**
 * Page object for the home page, which is the `pages` document with the empty slug (issue #60).
 * Locators describe what a visitor sees, not the markup.
 */
export class HomePage {
  readonly heading: Locator

  constructor(
    readonly page: Page,
    readonly locale: Locale,
  ) {
    this.heading = page.getByRole('heading', { level: 1 })
  }

  get path(): string {
    return pathFor('/', this.locale)
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path)
  }

  /** The heading must be part of the HTML the server sends, not painted by the client (ADR-0007). */
  async expectServerRendered(request: APIRequestContext, text: string): Promise<void> {
    const response = await request.get(this.path)
    expect(response.status()).toBe(200)
    expect(await response.text()).toContain(text)
  }
}
