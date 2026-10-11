import { handleEndpoints } from 'payload'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import config from '@/payload.config'
import { createAdmin, createUser } from '../factories'
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

type Person = Awaited<ReturnType<typeof createUser>>

/** Issues a key as `owner` that may only find pages, and returns its secret. */
async function issueKey(owner: Person): Promise<string> {
  const apiKey = `mcp-${uniqueSuffix()}`
  const key = await registry.payload.create({
    collection: 'payload-mcp-api-keys',
    data: { user: owner.id, enableAPIKey: true, apiKey, pages: { find: true } },
    overrideAccess: false,
    user: owner,
  })
  registry.track('payload-mcp-api-keys', key.id)

  return apiKey
}

/** Asks the endpoint for its tools the way an MCP client does. */
async function listTools(apiKey?: string): Promise<{ status: number; tools: string[] }> {
  const response = await handleEndpoints({
    config,
    request: new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/json',
        ...(apiKey === undefined ? {} : { authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list', params: {} }),
    }),
  })
  if (response.status !== 200) return { status: response.status, tools: [] }

  // Streamable HTTP answers with one server-sent event carrying the JSON-RPC result.
  const event = (await response.text()).split('\n').find((line) => line.startsWith('data: '))
  const { result } = JSON.parse(event!.slice('data: '.length)) as {
    result: { tools: { name: string }[] }
  }

  return { status: 200, tools: result.tools.map((tool) => tool.name) }
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
    const apiKey = await issueKey(await createAdmin(registry))

    expect(await listTools(apiKey)).toEqual({ status: 200, tools: ['findPages'] })
  })

  it('stops accepting a key once its owner is no longer an admin', async () => {
    const owner = await createAdmin(registry)
    const apiKey = await issueKey(owner)

    await registry.payload.update({
      collection: 'users',
      id: owner.id,
      data: { roles: ['editor'] },
      overrideAccess: true,
    })

    expect((await listTools(apiKey)).status).toBe(401)
  })
})
