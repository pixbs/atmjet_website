import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * The FAQ answer becomes rich text (issue #72, E4.13). The legacy kept the layout inside the
 * string — a `\n` where the answer broke a line (`docs/legacy-inventory.md` section 11.2) — so
 * the column cannot simply change type: every answer already written has to become the
 * paragraph an editor would have typed, and go back to its own string if this is rolled back.
 *
 * The node shapes are written out here rather than imported: a migration has to keep working
 * when the code that generated it has moved on.
 */
const TABLES = ['pages_blocks_faq_questions_locales', '_pages_v_blocks_faq_questions_locales']

/** One paragraph, with every line break of the legacy string kept as the break it was drawn as. */
function prose(value: string) {
  const lines = value.split('\n')
  const text = (line: string) => ({
    type: 'text',
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text: line,
    version: 1,
  })

  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: lines.flatMap((line, index) =>
            index === 0 ? [text(line)] : [{ type: 'linebreak', version: 1 }, text(line)],
          ),
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

/** The text of an editor value, which is what the column held before this migration. */
function lines(value: unknown): string {
  const root = (value as { root?: { children?: unknown[] } } | null)?.root
  const paragraphs = (root?.children ?? []) as { children?: { type: string; text?: string }[] }[]

  return paragraphs
    .map((paragraph) =>
      (paragraph.children ?? [])
        .map((node) => (node.type === 'linebreak' ? '\n' : (node.text ?? '')))
        .join(''),
    )
    .join('\n\n')
}

interface Row {
  id: string
  value: string
}

const rowsOf = (result: unknown): Row[] => ((result as { rows?: Row[] }).rows ?? []) as Row[]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of TABLES) {
    // `to_jsonb` first, because a column of plain sentences is not valid JSON and the cast
    // would refuse it; what it leaves behind is a JSON string, which the loop then replaces.
    await db.execute(
      sql.raw(
        `ALTER TABLE "${table}" ALTER COLUMN "answer" SET DATA TYPE jsonb USING to_jsonb("answer")`,
      ),
    )

    const written = rowsOf(
      await db.execute(
        sql.raw(`SELECT "id", "answer" #>> '{}' AS "value" FROM "${table}"
                 WHERE "answer" IS NOT NULL AND jsonb_typeof("answer") = 'string'`),
      ),
    )

    for (const row of written)
      await db.execute(
        sql`UPDATE ${sql.raw(`"${table}"`)} SET "answer" = ${JSON.stringify(prose(row.value))}::jsonb WHERE "id" = ${row.id}`,
      )
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of TABLES) {
    const written = rowsOf(
      await db.execute(
        sql.raw(`SELECT "id", "answer" AS "value" FROM "${table}" WHERE "answer" IS NOT NULL`),
      ),
    )

    for (const row of written)
      await db.execute(
        sql`UPDATE ${sql.raw(`"${table}"`)} SET "answer" = to_jsonb(${lines(row.value)}::text) WHERE "id" = ${row.id}`,
      )

    await db.execute(
      sql.raw(
        `ALTER TABLE "${table}" ALTER COLUMN "answer" SET DATA TYPE varchar USING "answer" #>> '{}'`,
      ),
    )
  }
}
