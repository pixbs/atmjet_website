/**
 * The medians of a Lighthouse CI collection, per page and form factor, as the table
 * `docs/performance-baseline.md` records (issue #43). Reads the reports `lhci collect` leaves in
 * `.lighthouseci/` and prints Markdown, which the workflow also appends to its run summary.
 *
 *   bun run scripts/ci/lighthouse-summary.ts [.lighthouseci]
 */
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

interface Report {
  finalDisplayedUrl: string
  configSettings: { formFactor: 'mobile' | 'desktop' }
  categories: { performance: { score: number | null } }
  audits: Record<
    string,
    {
      numericValue?: number
      details?: { items?: { resourceType?: string; transferSize?: number }[] }
    }
  >
}

export interface Measurement {
  url: string
  formFactor: string
  runs: number
  performance: number
  lcp: number
  cls: number
  tbt: number
  bytes: number
  imageBytes: number
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

const imageBytes = (report: Report) =>
  report.audits['resource-summary']?.details?.items?.find((item) => item.resourceType === 'image')
    ?.transferSize ?? 0

export function summarise(reports: Report[]): Measurement[] {
  const groups = new Map<string, Report[]>()

  for (const report of reports) {
    const key = `${report.finalDisplayedUrl}\t${report.configSettings.formFactor}`
    groups.set(key, [...(groups.get(key) ?? []), report])
  }

  return [...groups.entries()].map(([key, runs]) => {
    const [url, formFactor] = key.split('\t') as [string, string]
    const of = (audit: string) => median(runs.map((run) => run.audits[audit]?.numericValue ?? 0))

    return {
      url,
      formFactor,
      runs: runs.length,
      performance: median(
        runs.map((run) => Math.round((run.categories.performance.score ?? 0) * 100)),
      ),
      lcp: Math.round(of('largest-contentful-paint')),
      cls: Math.round(of('cumulative-layout-shift') * 1000) / 1000,
      tbt: Math.round(of('total-blocking-time')),
      bytes: Math.round(of('total-byte-weight')),
      imageBytes: Math.round(median(runs.map(imageBytes))),
    }
  })
}

export function markdown(rows: Measurement[]): string {
  const kib = (bytes: number) => `${Math.round(bytes / 1024)} KiB`

  return [
    '| Page | Form factor | Runs | Performance | LCP | CLS | TBT | Total weight | Images |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...rows
      .sort((a, b) => a.url.localeCompare(b.url) || a.formFactor.localeCompare(b.formFactor))
      .map(
        (row) =>
          `| ${new URL(row.url).pathname} | ${row.formFactor} | ${row.runs} | ${row.performance} | ${row.lcp} ms | ${row.cls} | ${row.tbt} ms | ${kib(row.bytes)} | ${kib(row.imageBytes)} |`,
      ),
  ].join('\n')
}

if (import.meta.main) {
  const directory = process.argv[2] ?? '.lighthouseci'
  const files = (await readdir(directory)).filter((file) => /^lhr-.*\.json$/.test(file))
  const reports = await Promise.all(
    files.map(
      async (file) => JSON.parse(await readFile(path.join(directory, file), 'utf8')) as Report,
    ),
  )

  console.log(markdown(summarise(reports)))
}
