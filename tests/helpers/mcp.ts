/**
 * The MCP endpoint driven the way a client drives it (issue #71), shared by the suites that call
 * it: the one that owns the globals writes them through it too (issue #464).
 */
import { handleEndpoints } from 'payload'

import config from '@/payload.config'
import type { createUser } from '../factories'
import { uniqueSuffix, type TestRegistry } from './payload'

type Person = Awaited<ReturnType<typeof createUser>>

type Grants = {
  pages?: { find: boolean }
  yachts?: { find?: boolean; update?: boolean }
  siteSettings?: { update: boolean }
}

/** Issues a key as `owner` that may only do what `grants` ticks, and returns its secret. */
export async function issueKey(
  registry: TestRegistry,
  owner: Person,
  grants: Grants = { pages: { find: true } },
) {
  const apiKey = `mcp-${uniqueSuffix()}`
  const key = await registry.payload.create({
    collection: 'payload-mcp-api-keys',
    data: { user: owner.id, enableAPIKey: true, apiKey, ...grants },
    overrideAccess: false,
    user: owner,
  })
  registry.track('payload-mcp-api-keys', key.id)

  return { id: key.id, apiKey }
}

/** Sends one JSON-RPC call the way an MCP client does. */
export async function call<T>(method: string, params: object, apiKey?: string) {
  const response = await handleEndpoints({
    config,
    request: new Request('http://localhost:3000/api/mcp', {
      method: 'POST',
      headers: {
        accept: 'application/json, text/event-stream',
        'content-type': 'application/json',
        ...(apiKey === undefined ? {} : { authorization: `Bearer ${apiKey}` }),
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
    }),
  })
  if (response.status !== 200) return { status: response.status }

  // Streamable HTTP answers with one server-sent event carrying the JSON-RPC result.
  const event = (await response.text()).split('\n').find((line) => line.startsWith('data: '))
  const { result } = JSON.parse(event!.slice('data: '.length)) as { result: T }

  return { status: 200, result }
}
