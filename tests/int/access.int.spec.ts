import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createMedia, createUser, mediaData, pngFile } from '../factories'
import { createRegistry, type TestRegistry } from '../helpers/payload'

/**
 * Access-control matrix (docs/adr/0004). Every collection added later extends this file with
 * anonymous, authenticated and admin expectations for read, create, update and delete.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('access control', () => {
  it('lets anonymous requests read media', async () => {
    const result = await registry.payload.find({ collection: 'media', overrideAccess: false })

    expect(Array.isArray(result.docs)).toBe(true)
  })

  it('does not let anonymous requests upload media', async () => {
    await expect(
      registry.payload.create({
        collection: 'media',
        data: mediaData(),
        file: pngFile(),
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('lets an authenticated editor upload media', async () => {
    const user = await createUser(registry)
    const media = await registry.payload.create({
      collection: 'media',
      data: mediaData(),
      file: pngFile(),
      overrideAccess: false,
      user,
    })
    registry.track('media', media.id)

    expect(media.id).toBeDefined()
  })

  it('does not let anonymous requests edit media', async () => {
    const media = await createMedia(registry)

    await expect(
      registry.payload.update({
        collection: 'media',
        id: media.id,
        data: { alt: 'rewritten by nobody' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('lets an authenticated editor edit media', async () => {
    const media = await createMedia(registry)
    const user = await createUser(registry)

    const updated = await registry.payload.update({
      collection: 'media',
      id: media.id,
      data: { alt: 'rewritten by an editor' },
      overrideAccess: false,
      user,
    })

    expect(updated.alt).toBe('rewritten by an editor')
  })

  it('does not let anonymous requests delete media', async () => {
    const media = await createMedia(registry)

    await expect(
      registry.payload.delete({ collection: 'media', id: media.id, overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('does not expose users to anonymous requests', async () => {
    await expect(
      registry.payload.find({ collection: 'users', overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('lets an authenticated user read users', async () => {
    const user = await createUser(registry)
    const result = await registry.payload.find({ collection: 'users', overrideAccess: false, user })

    expect(result.docs.some((doc) => doc.id === user.id)).toBe(true)
  })

  it('does not let anonymous requests create users', async () => {
    await expect(
      registry.payload.create({
        collection: 'users',
        data: { email: 'nobody@example.test', password: 'x' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })
})
