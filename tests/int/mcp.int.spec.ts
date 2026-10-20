import { randomUUID } from 'node:crypto'
import { REST_POST } from '@payloadcms/next/routes'
import type { RequiredDataFromCollectionSlug } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import type { User } from '@/payload-types'
import { createAdmin, createContact, createUser, createYacht } from '../factories'
import { createRegistry, type TestRegistry } from '../helpers/payload'

/**
 * The MCP endpoint and its keys (issue #71, `docs/access-matrix.md`): only an admin issues a key,
 * a new key grants nothing, and no key reaches the people, the leads or the contacts.
 */
let registry: TestRegistry

beforeAll(async () => {
  registry = await createRegistry()
})

afterAll(() => registry.cleanup())

type KeyData = RequiredDataFromCollectionSlug<'payload-mcp-api-keys'>

async function issueKey(issuer: User, grants: Partial<KeyData> = {}) {
  const secret = randomUUID()
  const doc = await registry.payload.create({
    collection: 'payload-mcp-api-keys',
    data: { user: issuer.id, enableAPIKey: true, apiKey: secret, ...grants },
    overrideAccess: false,
    user: issuer,
  })
  registry.track('payload-mcp-api-keys', doc.id)

  return { doc, secret }
}

type FieldNode = { type: string; name?: string; fields?: FieldNode[] }

/** Every box the key collection offers, ticked: the most a key can ever be granted. */
async function everyGrant(): Promise<Partial<KeyData>> {
  const resolved = await registry.payload.config
  const keys = resolved.collections.find((collection) => collection.slug === 'payload-mcp-api-keys')
  const grants: Record<string, Record<string, boolean>> = {}

  const visit = (fields: FieldNode[]) => {
    for (const field of fields) {
      if (field.type === 'group' && field.name) {
        const boxes = (field.fields ?? []).filter((box) => box.type === 'checkbox' && box.name)
        grants[field.name] = Object.fromEntries(boxes.map((box) => [box.name, true]))
      } else if (field.fields) {
        visit(field.fields)
      }
    }
  }
  visit((keys?.fields ?? []) as FieldNode[])

  return grants
}

const post = REST_POST(config)

async function rpc(method: string, params: Record<string, unknown>, secret?: string) {
  const response = await post(
    new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
        ...(secret && { Authorization: `Bearer ${secret}` }),
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    }),
    { params: Promise.resolve({ slug: ['mcp'] }) },
  )
  const text = await response.text()
  // The transport answers as a server-sent event; the JSON-RPC message is its `data:` line.
  const data = text.split('\n').find((line) => line.startsWith('data: '))

  return { status: response.status, body: data ? JSON.parse(data.slice(6)) : text }
}

async function toolNames(secret: string): Promise<string[]> {
  const { body } = await rpc('tools/list', {}, secret)
  // A server with no tool registered does not offer `tools/list` at all.
  if (body.error?.code === -32601) return []

  return (body.result.tools as { name: string }[]).map((tool) => tool.name)
}

describe('MCP API keys', () => {
  it('cannot be issued anonymously or by an editor', async () => {
    const editor = await createUser(registry)
    const data = { user: editor.id, enableAPIKey: true, apiKey: randomUUID() }

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

  it('is bound to the admin who issues it, whoever the request names', async () => {
    const issuer = await createAdmin(registry)
    const other = await createAdmin(registry)

    const { doc } = await issueKey(issuer, { user: other.id })

    expect(typeof doc.user === 'object' ? doc.user.id : doc.user).toBe(issuer.id)
  })

  it('is readable by its own admin alone', async () => {
    const issuer = await createAdmin(registry)
    const otherAdmin = await createAdmin(registry)
    const editor = await createUser(registry)
    const { doc } = await issueKey(issuer)
    const where = { id: { equals: doc.id } }

    const own = await registry.payload.find({
      collection: 'payload-mcp-api-keys',
      where,
      overrideAccess: false,
      user: issuer,
    })
    expect(own.totalDocs).toBe(1)

    const others = await registry.payload.find({
      collection: 'payload-mcp-api-keys',
      where,
      overrideAccess: false,
      user: otherAdmin,
    })
    expect(others.totalDocs).toBe(0)

    await expect(
      registry.payload.find({
        collection: 'payload-mcp-api-keys',
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('goes with the admin who issued it, so deleting a leaver still works', async () => {
    const leaver = await createAdmin(registry)
    const remaining = await createAdmin(registry)
    const { doc, secret } = await issueKey(leaver, { yachts: { find: true } })

    await registry.payload.delete({
      collection: 'users',
      id: leaver.id,
      overrideAccess: false,
      user: remaining,
    })

    const left = await registry.payload.count({
      collection: 'payload-mcp-api-keys',
      where: { id: { equals: doc.id } },
    })
    expect(left.totalDocs).toBe(0)
    expect((await rpc('tools/list', {}, secret)).status).toBe(401)
  })
})

describe('the MCP endpoint', () => {
  it('refuses a request without a valid key', async () => {
    expect((await rpc('tools/list', {})).status).toBe(401)
    expect((await rpc('tools/list', {}, randomUUID())).status).toBe(401)
  })

  it('offers nothing on a new key until an admin ticks a box', async () => {
    const { secret } = await issueKey(await createAdmin(registry))

    expect(await toolNames(secret)).toEqual([])
  })

  it('never reaches the people, the leads or the contacts, however generous the key', async () => {
    const { secret } = await issueKey(await createAdmin(registry), await everyGrant())
    const names = await toolNames(secret)

    expect(names).toContain('findYachts')
    expect(names.filter((name) => /users|leads|contacts|apiKeys/i.test(name))).toEqual([])
  })

  it("acts as an editor, so a yacht's contact never reaches the model", async () => {
    const contact = await createContact(registry)
    const yacht = await createYacht(registry, { contact: contact.id, captain: contact.id })
    const { secret } = await issueKey(await createAdmin(registry), { yachts: { find: true } })

    const { body } = await rpc(
      'tools/call',
      { name: 'findYachts', arguments: { id: yacht.id, depth: 2 } },
      secret,
    )
    const text = JSON.stringify(body.result.content)

    expect(text).toContain(yacht.name)
    expect(text).not.toContain(contact.email)
    expect(text).not.toContain(contact.phone)
  })
})
