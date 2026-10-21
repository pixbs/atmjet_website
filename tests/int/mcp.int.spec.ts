import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { createAdmin, createContact, createUser, createYacht } from '../factories'
import { call, issueKey } from '../helpers/mcp'
import { createRegistry, uniqueSuffix, type TestRegistry } from '../helpers/payload'

/**
 * The MCP endpoint agents enter content through (issue #71): only an admin issues a key, a key
 * offers only the tools ticked on it, and it stops working once its owner is no longer an admin.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

async function listTools(apiKey?: string): Promise<{ status: number; tools: string[] }> {
  const { status, result } = await call<{ tools: { name: string }[] }>('tools/list', {}, apiKey)

  return { status, tools: result?.tools.map((tool) => tool.name) ?? [] }
}

describe('MCP API keys', () => {
  it('cannot be issued anonymously or by an editor', async () => {
    const editor = await createUser(registry)
    const data = { user: editor.id, enableAPIKey: true, apiKey: `mcp-${uniqueSuffix()}` }

    await expect(
      registry.payload.create({ collection: 'payload-mcp-api-keys', data, overrideAccess: false }),
    ).rejects.toThrow()

    await expect(
      registry.payload.create({
        collection: 'payload-mcp-api-keys',
        data,
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('are not listed to an editor', async () => {
    const editor = await createUser(registry)

    await expect(
      registry.payload.find({
        collection: 'payload-mcp-api-keys',
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })
})

describe('the MCP endpoint', () => {
  it('refuses a request without a key or with one nobody issued', async () => {
    expect((await listTools()).status).toBe(401)
    expect((await listTools(`mcp-${uniqueSuffix()}`)).status).toBe(401)
  })

  it("offers an admin's key only the tools ticked on it", async () => {
    const { apiKey } = await issueKey(registry, await createAdmin(registry))

    expect(await listTools(apiKey)).toEqual({ status: 200, tools: ['findPages'] })
  })

  it("never hands a yacht's contact to the model, at any depth", async () => {
    const owner = await createAdmin(registry)
    const contact = await createContact(registry)
    const yacht = await createYacht(registry, { contact: contact.id, captain: contact.id })
    const { apiKey } = await issueKey(registry, owner, { yachts: { find: true } })

    const { result } = await call<{ content: { text: string }[] }>(
      'tools/call',
      { name: 'findYachts', arguments: { id: yacht.id, depth: 2 } },
      apiKey,
    )
    const answer = JSON.stringify(result?.content)

    expect(answer).toContain(yacht.name)
    expect(answer).not.toContain(contact.email)
    expect(answer).not.toContain(contact.phone)

    // The same admin still sees the person in the admin, so only the endpoint withholds it.
    const inAdmin = await registry.payload.findByID({
      collection: 'yachts',
      id: yacht.id,
      depth: 1,
      overrideAccess: false,
      user: owner,
    })
    expect(JSON.stringify(inAdmin.contact)).toContain(contact.email)
  })

  it('deletes the keys of a person who is deleted, so a leaver can still be removed', async () => {
    const leaver = await createAdmin(registry)
    const { id, apiKey } = await issueKey(registry, leaver)

    await registry.payload.delete({
      collection: 'users',
      id: leaver.id,
      overrideAccess: false,
      user: await createAdmin(registry),
    })

    const left = await registry.payload.count({
      collection: 'payload-mcp-api-keys',
      where: { id: { equals: id } },
    })
    expect(left.totalDocs).toBe(0)
    expect((await listTools(apiKey)).status).toBe(401)
  })

  it('stops accepting a key once its owner is no longer an admin', async () => {
    const owner = await createAdmin(registry)
    const { apiKey } = await issueKey(registry, owner)

    await registry.payload.update({
      collection: 'users',
      id: owner.id,
      data: { roles: ['editor'] },
      overrideAccess: true,
    })

    expect((await listTools(apiKey)).status).toBe(401)
  })
})

// Issue #464: a row id keeps a row's localized fields attached to it, so a write in one language must carry it.
describe('editing one language through MCP', () => {
  it("changes a yacht's photo captions in Russian and leaves the English ones", async () => {
    const yacht = await createYacht(registry, {
      photos: [
        { externalUrl: 'https://example.test/bow.jpg', alt: 'Bow at anchor' },
        { externalUrl: 'https://example.test/deck.jpg', alt: 'Sun deck' },
      ],
    })
    const { apiKey } = await issueKey(registry, await createAdmin(registry), {
      yachts: { update: true },
    })
    const russian = ['Нос на якоре', 'Солнечная палуба']

    const { result } = await call<{ isError?: boolean }>(
      'tools/call',
      {
        name: 'updateYachts',
        arguments: {
          id: yacht.id,
          locale: 'ru',
          photos: (yacht.photos ?? []).map((photo, index) => ({
            id: photo.id,
            externalUrl: photo.externalUrl,
            alt: russian[index],
          })),
        },
      },
      apiKey,
    )
    expect(result).toBeDefined()
    expect(result?.isError).not.toBe(true)

    const captions = async (locale: 'en' | 'ru') =>
      (
        await registry.payload.findByID({
          collection: 'yachts',
          id: yacht.id,
          locale,
          fallbackLocale: false,
          depth: 0,
        })
      ).photos?.map((photo) => photo.alt)

    expect(await captions('en')).toEqual(['Bow at anchor', 'Sun deck'])
    expect(await captions('ru')).toEqual(russian)
  })
})
