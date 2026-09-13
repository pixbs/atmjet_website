import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { ROLES } from '@/access'
import { createAdmin, createMedia, createUser, mediaData, pngFile, userData } from '../factories'
import { createRegistry, type TestRegistry } from '../helpers/payload'

/**
 * The access-control matrix (issue #70, `docs/access-matrix.md`). Every cell of that table has
 * a test here, plus a guard that fails when a collection is added without declaring access.
 *
 * The legacy admin is the reason this is exhaustive: it left the yacht routes unauthenticated
 * and stored passwords in plain text (`docs/legacy-inventory.md` section 14).
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

describe('every collection declares its access', () => {
  it('leaves no operation to a framework default', async () => {
    const config = await registry.payload.config
    const missing: string[] = []

    for (const collection of config.collections) {
      for (const operation of ['read', 'create', 'update', 'delete'] as const) {
        if (typeof collection.access?.[operation] !== 'function') {
          missing.push(`${collection.slug}.${operation}`)
        }
      }
    }

    // Adding a collection without access control fails here rather than in production.
    expect(missing).toEqual([])
  })

  it('offers only the roles the matrix documents', () => {
    expect(ROLES).toEqual(['admin', 'editor'])
  })
})

describe('media access', () => {
  it('is readable by anyone, signed in or not', async () => {
    await createMedia(registry)
    const anonymous = await registry.payload.find({ collection: 'media', overrideAccess: false })

    expect(anonymous.totalDocs).toBeGreaterThan(0)
  })

  it('cannot be uploaded, changed or removed anonymously', async () => {
    const existing = await createMedia(registry)

    await expect(
      registry.payload.create({
        collection: 'media',
        data: mediaData(),
        file: pngFile(),
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await expect(
      registry.payload.update({
        collection: 'media',
        id: existing.id,
        data: { alt: 'rewritten by nobody' },
        overrideAccess: false,
      }),
    ).rejects.toThrow()

    await expect(
      registry.payload.delete({ collection: 'media', id: existing.id, overrideAccess: false }),
    ).rejects.toThrow()
  })

  for (const role of ['editor', 'admin'] as const) {
    it(`can be uploaded, changed and removed by an ${role}`, async () => {
      const user = await createUser(registry, { roles: [role] })

      const created = await registry.payload.create({
        collection: 'media',
        data: mediaData(),
        file: pngFile(),
        overrideAccess: false,
        user,
      })
      registry.track('media', created.id)

      const updated = await registry.payload.update({
        collection: 'media',
        id: created.id,
        data: { alt: `rewritten by an ${role}` },
        overrideAccess: false,
        user,
      })
      expect(updated.alt).toBe(`rewritten by an ${role}`)

      await expect(
        registry.payload.delete({
          collection: 'media',
          id: created.id,
          overrideAccess: false,
          user,
        }),
      ).resolves.toBeTruthy()
    })
  }

  it('has no roleless account to worry about, because a role is required', async () => {
    // Access is granted by role, so an account without one would be a signed-in user the
    // matrix says nothing about. The field is required precisely so that cannot exist.
    await expect(
      registry.payload.create({
        collection: 'users',
        data: userData({ roles: [] }),
        overrideAccess: true,
      }),
    ).rejects.toThrow(/Roles/i)
  })
})

describe('users access', () => {
  it('is not listable anonymously', async () => {
    await expect(
      registry.payload.find({ collection: 'users', overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('shows an editor themselves and nobody else', async () => {
    const editor = await createUser(registry)
    await createUser(registry)

    const result = await registry.payload.find({
      collection: 'users',
      overrideAccess: false,
      user: editor,
    })

    expect(result.docs.map((doc) => doc.id)).toEqual([editor.id])
  })

  it('shows an admin everyone', async () => {
    const owner = await createAdmin(registry)
    const other = await createUser(registry)

    const result = await registry.payload.find({
      collection: 'users',
      overrideAccess: false,
      user: owner,
      limit: 0,
    })

    expect(result.docs.map((doc) => doc.id)).toEqual(expect.arrayContaining([owner.id, other.id]))
  })

  it('cannot be created anonymously or by an editor', async () => {
    const editor = await createUser(registry)

    await expect(
      registry.payload.create({ collection: 'users', data: userData(), overrideAccess: false }),
    ).rejects.toThrow()

    await expect(
      registry.payload.create({
        collection: 'users',
        data: userData(),
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('can be created by an admin', async () => {
    const owner = await createAdmin(registry)

    const created = await registry.payload.create({
      collection: 'users',
      data: userData(),
      overrideAccess: false,
      user: owner,
    })
    registry.track('users', created.id)

    expect(created.id).toBeDefined()
  })

  it('lets an editor edit themselves but not a colleague', async () => {
    const editor = await createUser(registry)
    const colleague = await createUser(registry)

    await expect(
      registry.payload.update({
        collection: 'users',
        id: editor.id,
        data: { email: `renamed-${editor.id}@example.test` },
        overrideAccess: false,
        user: editor,
      }),
    ).resolves.toBeTruthy()

    await expect(
      registry.payload.update({
        collection: 'users',
        id: colleague.id,
        data: { email: `hijacked-${colleague.id}@example.test` },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('cannot be deleted anonymously or by an editor, only by an admin', async () => {
    const editor = await createUser(registry)
    const target = await createUser(registry)
    const owner = await createAdmin(registry)

    await expect(
      registry.payload.delete({ collection: 'users', id: target.id, overrideAccess: false }),
    ).rejects.toThrow()

    await expect(
      registry.payload.delete({
        collection: 'users',
        id: target.id,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()

    await expect(
      registry.payload.delete({
        collection: 'users',
        id: target.id,
        overrideAccess: false,
        user: owner,
      }),
    ).resolves.toBeTruthy()
  })
})

describe('privilege escalation', () => {
  it('does not let an editor promote themselves', async () => {
    const editor = await createUser(registry)

    const updated = await registry.payload.update({
      collection: 'users',
      id: editor.id,
      data: { roles: ['admin'] },
      overrideAccess: false,
      user: editor,
    })

    // Payload drops a field the user may not write rather than failing the whole request, so
    // the check is that the role did not change.
    expect(updated.roles).toEqual(['editor'])
  })

  it('lets an admin change the roles of someone else', async () => {
    const owner = await createAdmin(registry)
    const editor = await createUser(registry)

    const updated = await registry.payload.update({
      collection: 'users',
      id: editor.id,
      data: { roles: ['admin'] },
      overrideAccess: false,
      user: owner,
    })

    expect(updated.roles).toEqual(['admin'])
  })
})

describe('hardening', () => {
  it('pins CORS and CSRF to this deployment instead of allowing any origin', async () => {
    const config = await registry.payload.config

    expect(config.serverURL).toBeTruthy()

    // `cors` may be '*' or an object form; an allowlist is the whole point, so assert the shape
    // before the contents.
    expect(Array.isArray(config.cors)).toBe(true)

    // Payload appends serverURL to the list itself, so compare the set of allowed origins
    // rather than the array: what matters is that this deployment is the only one on it.
    expect(new Set(config.cors as string[])).toEqual(new Set([config.serverURL]))
    expect(new Set(config.csrf)).toEqual(new Set([config.serverURL]))
  })

  it('lets any signed-in user into the admin panel and nobody else', async () => {
    const config = await registry.payload.config
    const users = config.collections.find((collection) => collection.slug === 'users')
    const canUseAdminPanel = users?.access.admin

    expect(typeof canUseAdminPanel).toBe('function')
    expect(await canUseAdminPanel!({ req: { user: { id: 1, roles: ['editor'] } } } as never)).toBe(
      true,
    )
    expect(await canUseAdminPanel!({ req: { user: null } } as never)).toBe(false)
  })

  it('slows password guessing down and issues no API keys', async () => {
    const config = await registry.payload.config
    const users = config.collections.find((collection) => collection.slug === 'users')

    expect(users?.auth.maxLoginAttempts).toBe(5)
    expect(users?.auth.lockTime).toBe(10 * 60 * 1000)
    expect(users?.auth.useAPIKey).toBe(false)
  })
})
