import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'

/**
 * Access-control matrix (docs/adr/0004). Every collection added later extends this
 * file: anonymous, authenticated and admin expectations for read/create/update/delete.
 */
let payload: Payload

beforeAll(async () => {
  payload = await getPayload({ config: await config })
})

describe('access control', () => {
  it('lets anonymous requests read media', async () => {
    const result = await payload.find({ collection: 'media', overrideAccess: false })

    expect(Array.isArray(result.docs)).toBe(true)
  })

  it('does not expose users to anonymous requests', async () => {
    await expect(payload.find({ collection: 'users', overrideAccess: false })).rejects.toThrow()
  })
})
