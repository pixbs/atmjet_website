import { testUser } from '../helpers/seedUser'
import { expect, test } from './fixtures'

test.describe('Admin panel', () => {
  test.describe.configure({ mode: 'serial' })

  test.beforeEach(async ({ admin }) => {
    await admin.login(testUser)
  })

  test('opens the dashboard', async ({ admin, page }) => {
    await page.goto('/admin')

    await expect(page).toHaveURL(/\/admin\/?$/)
    await expect(admin.dashboardTitle).toBeVisible()
  })

  test('opens the users list view', async ({ admin, page }) => {
    await admin.gotoCollection('users')

    await expect(page.locator('h1', { hasText: 'Users' }).first()).toBeVisible()
  })

  test('opens the create view', async ({ admin, page }) => {
    await admin.gotoCreate('users')

    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  // Where an admin issues the key an agent enters content with (issue #71).
  test('opens the MCP API keys list view', async ({ admin, page }) => {
    await admin.gotoCollection('payload-mcp-api-keys')

    await expect(page.locator('h1', { hasText: 'API Keys' }).first()).toBeVisible()
  })
})
