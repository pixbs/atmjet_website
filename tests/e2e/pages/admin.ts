import { expect, type Locator, type Page } from '@playwright/test'

export interface Credentials {
  email: string
  password: string
}

/** Page object for the Payload admin panel. */
export class AdminPage {
  readonly dashboardTitle: Locator

  constructor(readonly page: Page) {
    this.dashboardTitle = page.locator('span[title="Dashboard"]').first()
  }

  async login(user: Credentials): Promise<void> {
    await this.page.goto('/admin/login')
    await this.page.fill('#field-email', user.email)
    await this.page.fill('#field-password', user.password)
    await this.page.click('button[type="submit"]')
    await this.page.waitForURL(/\/admin\/?$/)
    await expect(this.dashboardTitle).toBeVisible()
  }

  async gotoCollection(slug: string): Promise<void> {
    await this.page.goto(`/admin/collections/${slug}`)
    await expect(this.page).toHaveURL(new RegExp(`/admin/collections/${slug}(\\?.*)?$`))
  }

  async gotoCreate(slug: string): Promise<void> {
    await this.page.goto(`/admin/collections/${slug}/create`)
    await expect(this.page).toHaveURL(new RegExp(`/admin/collections/${slug}/[a-zA-Z0-9-_]+`))
  }
}
