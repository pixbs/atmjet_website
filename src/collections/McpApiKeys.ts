import type { MCPPluginConfig } from '@payloadcms/plugin-mcp'
import type { CollectionConfig } from 'payload'
import { UnauthorizedError } from 'payload'

import { admin, hasRole } from '@/access'

type OverrideAuth = NonNullable<MCPPluginConfig['overrideAuth']>

/** The plugin lets any signed-in user issue keys; here only an admin may (issue #71). */
export function mcpApiKeysOverride(collection: CollectionConfig): CollectionConfig {
  return {
    ...collection,
    access: { read: admin, create: admin, update: admin, delete: admin, unlock: admin },
  }
}

/** A key stops working once its owner is no longer an admin, not only when it is deleted. */
export const adminKeysOnly: OverrideAuth = async (_req, getDefaultMcpAccessSettings) => {
  const settings = await getDefaultMcpAccessSettings()
  if (!hasRole(settings.user, 'admin')) throw new UnauthorizedError()

  return settings
}
