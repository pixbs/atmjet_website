import type { Thing, WithContext } from 'schema-dts'

/**
 * Renders one structured-data block (issue #173). The legacy site emitted none, so nothing
 * connected its pages to the company behind them.
 *
 * A server component with no visible output: the builders in `src/lib/structured-data.ts` decide
 * what it says.
 */
export function JsonLd({ data }: { data: WithContext<Thing> }) {
  return (
    <script
      type="application/ld+json"
      // The values are an editor's. `<` is escaped rather than trusted, because a `</script>`
      // inside one of them would otherwise end the block and let the rest through as markup.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}
