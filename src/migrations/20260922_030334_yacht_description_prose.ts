import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * The yacht description becomes rich text (issue #72, E4.13), as the FAQ answer did before it.
 * The legacy wrote a paragraph per line of the column (`docs/legacy-inventory.md` section 11.2),
 * so the conversion is a paragraph per line rather than the line breaks the answers carried —
 * and it is the same shape the page draws either way.
 *
 * The node shapes are written out here rather than imported: a migration has to keep working
 * when the code that generated it has moved on.
 */
const TABLE = 'yachts_locales'

const text = (line: string) => ({
  type: 'text',
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text: line,
  version: 1,
})

/** One paragraph per line, which is how the page draws a description. */
function paragraphs(value: string) {
  return {
    root: {
      type: 'root',
      children: value
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '')
        .map((line) => ({
          type: 'paragraph',
          children: [text(line)],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        })),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/** The lines of an editor value, which is what the column held before this migration. */
function lines(value: unknown): string {
  const root = (value as { root?: { children?: unknown[] } } | null)?.root
  const written = (root?.children ?? []) as { children?: { type: string; text?: string }[] }[]

  return written
    .map((paragraph) =>
      (paragraph.children ?? [])
        .map((node) => (node.type === 'linebreak' ? '\n' : (node.text ?? '')))
        .join(''),
    )
    .join('\n')
}

interface Row {
  id: string
  value: string
}

const rowsOf = (result: unknown): Row[] => ((result as { rows?: Row[] }).rows ?? []) as Row[]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // `to_jsonb` first, because a column of plain sentences is not valid JSON and the cast would
  // refuse it; what it leaves behind is a JSON string, which the loop then replaces.
  await db.execute(
    sql.raw(
      `ALTER TABLE "${TABLE}" ALTER COLUMN "description" SET DATA TYPE jsonb USING to_jsonb("description")`,
    ),
  )

  const written = rowsOf(
    await db.execute(
      sql.raw(`SELECT "id", "description" #>> '{}' AS "value" FROM "${TABLE}"
               WHERE "description" IS NOT NULL AND jsonb_typeof("description") = 'string'`),
    ),
  )

  for (const row of written)
    await db.execute(
      sql`UPDATE ${sql.raw(`"${TABLE}"`)} SET "description" = ${JSON.stringify(paragraphs(row.value))}::jsonb WHERE "id" = ${row.id}`,
    )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  const written = rowsOf(
    await db.execute(
      sql.raw(
        `SELECT "id", "description" AS "value" FROM "${TABLE}" WHERE "description" IS NOT NULL`,
      ),
    ),
  )

  for (const row of written)
    await db.execute(
      sql`UPDATE ${sql.raw(`"${TABLE}"`)} SET "description" = to_jsonb(${lines(row.value)}::text) WHERE "id" = ${row.id}`,
    )

  await db.execute(
    sql.raw(
      `ALTER TABLE "${TABLE}" ALTER COLUMN "description" SET DATA TYPE varchar USING "description" #>> '{}'`,
    ),
  )
}
