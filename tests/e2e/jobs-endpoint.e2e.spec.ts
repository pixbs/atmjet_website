import { expect, test } from '@playwright/test'

/**
 * The queue that sends leads to Telegram is drained through a URL (issue #155), because a Vercel
 * cron can only call one. A stranger must not be able to call it: the jobs it runs read leads,
 * which are somebody's name, telephone number and itinerary.
 */
test('the queue cannot be drained by a stranger', async ({ request }) => {
  const response = await request.get('/api/payload-jobs/run')

  expect(response.status()).toBe(401)
})
