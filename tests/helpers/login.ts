import { expect, type Page } from '@playwright/test'

export interface LoginOptions {
  page: Page
  user: {
    email: string
    password: string
  }
}

/** Logs the user into the admin panel through the login page (paths resolve against baseURL). */
export async function login({ page, user }: LoginOptions): Promise<void> {
  await page.goto('/admin/login')

  await page.fill('#field-email', user.email)
  await page.fill('#field-password', user.password)
  await page.click('button[type="submit"]')

  await page.waitForURL(/\/admin\/?$/)

  await expect(page.locator('span[title="Dashboard"]')).toBeVisible()
}
