import { randomUUID } from 'crypto'
import type { RequiredDataFromCollectionSlug } from 'payload'

import type { User } from '@/payload-types'
import { uniqueSuffix, type TestRegistry } from '../helpers/payload'

export type McpApiKeyData = RequiredDataFromCollectionSlug<'payload-mcp-api-keys'>

/** A switched-on key acting as `owner`; it may do nothing until a capability is ticked. */
export function mcpApiKeyData(owner: User, overrides: Partial<McpApiKeyData> = {}): McpApiKeyData {
  return {
    user: owner.id,
    label: `Agent ${uniqueSuffix()}`,
    enableAPIKey: true,
    apiKey: randomUUID(),
    ...overrides,
  }
}

export function createMcpApiKey(
  registry: TestRegistry,
  owner: User,
  overrides: Partial<McpApiKeyData> = {},
) {
  return registry.create('payload-mcp-api-keys', mcpApiKeyData(owner, overrides))
}
