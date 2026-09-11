import { expect, test, type Page } from '@playwright/test'

import { login } from '../helpers/login'
import { cleanupTestUser, seedTestUser, testUser } from '../helpers/seedUser'

test.describe('Admin panel', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    await seedTestUser()

    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await cleanupTestUser()
  })

  test('opens the dashboard', async () => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(page.locator('span[title="Dashboard"]').first()).toBeVisible()
  })

  test('opens the users list view', async () => {
    await page.goto('/admin/collections/users')

    await expect(page).toHaveURL(/\/admin\/collections\/users(\?.*)?$/)
    await expect(page.locator('h1', { hasText: 'Users' }).first()).toBeVisible()
  })

  test('opens the create view', async () => {
    await page.goto('/admin/collections/users/create')

    await expect(page).toHaveURL(/\/admin\/collections\/users\/[a-zA-Z0-9-_]+/)
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })
})
