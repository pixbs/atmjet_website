import type { CollectionConfig } from 'payload'

import { admin, hasRole } from '@/access'

/**
 * The ledger an import resumes on (issue #76,
 * `docs/adr/0002-database-migration-strategy.md` section 6): one document per legacy row an
 * importer has written, keyed by the table it came from and its id there, so a run interrupted
 * halfway carries on instead of doing the same work again.
 *
 * Operational rather than content: `scripts/migrate` writes it, nobody edits it, and nobody
 * without an administrator's session may read what the legacy tables were called.
 */
export const MigrationRuns: CollectionConfig = {
  slug: 'migration-runs',
  admin: {
    useAsTitle: 'sourceKey',
    defaultColumns: ['sourceKey', 'target', 'action', 'runId'],
    group: 'Operations',
    description: 'What the imports have written so far. Written by scripts/migrate, not by hand.',
    hidden: ({ user }) => !hasRole(user, 'admin'),
  },
  access: { read: admin, create: admin, update: admin, delete: admin },
  fields: [
    {
      name: 'sourceKey',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '`<table>:<id>`, the pair a resumed run looks the row up by.' },
    },
    { name: 'sourceTable', type: 'text', required: true, index: true },
    { name: 'sourceId', type: 'text', required: true },
    {
      name: 'target',
      type: 'text',
      required: true,
      admin: { description: 'The collection the row became a document in.' },
    },
    { name: 'documentId', type: 'text', required: true },
    {
      name: 'action',
      type: 'select',
      required: true,
      options: ['created', 'updated'],
    },
    {
      name: 'runId',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'The run that wrote it, as the document provenance records it.' },
    },
  ],
}
