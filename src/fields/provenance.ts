import type { Field, GroupField } from 'payload'

/**
 * Where a document came from (ADR-0002 section 8): the origin, the legacy identifiers the
 * collection keeps, and the import run that wrote it.
 */
export function provenanceGroup({
  origins,
  legacyFields,
  verified = false,
}: {
  origins: readonly string[]
  legacyFields: Field[]
  /** Aircraft alone record when a person checked the merged document. */
  verified?: boolean
}): GroupField {
  return {
    type: 'group',
    name: 'provenance',
    label: 'Provenance',
    admin: { description: 'Where this document came from (ADR-0002 section 8).' },
    fields: [
      {
        name: 'origin',
        type: 'select',
        required: true,
        defaultValue: 'manual',
        options: origins.map((origin) => ({ label: origin, value: origin })),
        index: true,
      },
      ...legacyFields,
      { name: 'importRunId', type: 'text', index: true },
      { name: 'importedAt', type: 'date' },
      ...(verified ? [{ name: 'verifiedAt', type: 'date' } as Field] : []),
    ],
  }
}
