/**
 * Records the legacy production site as the visual parity contract (issue #37, ADR-0004).
 *
 *   bun run scripts/baselines/capture-legacy.ts --base-url https://atmjet.com --out legacy-baselines
 *
 * Options: --locales en,ru  --viewports mobile,desktop  --routes /,/aircraft  --states default,menu-open
 *          --no-detail (skip the aircraft and yacht detail pages found on the site)
 *          --no-locale-prefix (for smoke tests against a site without locale routing)  --dry-run
 *
 * Every job is best effort: a failure is recorded in manifest.json and never stops the run.
 * Agent sessions cannot reach the production host; the legacy-baselines workflow runs this on a runner.
 */
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { parseArgs } from 'node:util'
import {
  chromium,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from '@playwright/test'
import {
  LOCALES,
  STATES,
  VIEWPORTS,
  buildMatrix,
  routeSlug,
  type Job,
  type StateName,
  type Viewport,
} from './matrix'

interface ManifestEntry {
  id: string
  route: string
  locale: string
  viewport: string
  state: StateName
  param?: string
  url: string
  kind: 'full-page' | 'viewport' | 'section'
  file?: string
  sectionIndex?: number
  label?: string
  width?: number
  height?: number
  bytes?: number
  sha256?: string
  status: 'captured' | 'failed'
  error?: string
}

interface Manifest {
  capturedAt: string
  baseUrl: string
  legacyCommit: string
  userAgent: string
  viewports: Viewport[]
  entries: ManifestEntry[]
}

const LEGACY_COMMIT = '8b8f375892e030f570cbe9f500f208df589e8976'
const PRELOADER_MS = 5200
const SETTLE_MS = 800
const MAX_SECTIONS = 40

const { values } = parseArgs({
  options: {
    'base-url': { type: 'string', default: 'https://atmjet.com' },
    out: { type: 'string', default: 'legacy-baselines' },
    locales: { type: 'string' },
    viewports: { type: 'string' },
    routes: { type: 'string' },
    states: { type: 'string' },
    'no-detail': { type: 'boolean', default: false },
    'no-locale-prefix': { type: 'boolean', default: false },
    'dry-run': { type: 'boolean', default: false },
  },
})

const baseUrl = (values['base-url'] as string).replace(/\/+$/, '')
const outDir = path.resolve(values.out as string)
const list = (value: string | undefined) =>
  value
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : undefined

const viewportNames = list(values.viewports)
const viewports = viewportNames
  ? VIEWPORTS.filter((v) => viewportNames.includes(v.name))
  : VIEWPORTS
const states = (list(values.states) as StateName[] | undefined)?.filter((s) => STATES.includes(s))

async function discoverDetailRoutes(): Promise<string[]> {
  const routes: string[] = []
  try {
    const xml = await (await fetch(`${baseUrl}/aircraft/sitemap.xml`)).text()
    const slugs = [...xml.matchAll(/<loc>[^<]*\/aircraft\/([^<\/]+)<\/loc>/g)].map((m) => m[1])
    routes.push(...slugs.slice(0, 3).map((slug) => `/aircraft/${slug}`))
  } catch (error) {
    console.warn(`aircraft sitemap not readable: ${String(error)}`)
  }
  try {
    const html = await (await fetch(`${baseUrl}/en/yachts`)).text()
    const slugs = [
      ...new Set([...html.matchAll(/href="\/en\/yachts\/([^"?#]+)"/g)].map((m) => m[1])),
    ]
    routes.push(...slugs.slice(0, 2).map((slug) => `/yachts/${slug}`))
  } catch (error) {
    console.warn(`yacht listing not readable: ${String(error)}`)
  }
  return routes
}

function pngSize(buffer: Buffer): { width: number; height: number } {
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

function describe(
  file: string,
): Pick<ManifestEntry, 'file' | 'width' | 'height' | 'bytes' | 'sha256'> {
  const buffer = readFileSync(file)
  return {
    file: path.relative(outDir, file),
    ...pngSize(buffer),
    bytes: statSync(file).size,
    sha256: createHash('sha256').update(buffer).digest('hex'),
  }
}

async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(200, window.innerHeight)
    const height = document.documentElement.scrollHeight
    for (let y = 0; y < height; y += step) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 120))
    }
    window.scrollTo(0, 0)
    await new Promise((resolve) => setTimeout(resolve, 400))
  })
  await page.waitForTimeout(SETTLE_MS)
}

async function settle(page: Page, job: Job): Promise<void> {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(job.route === '/' ? PRELOADER_MS : SETTLE_MS)
}

async function prepareState(page: Page, job: Job): Promise<Locator | undefined> {
  switch (job.state) {
    case 'cookie-banner':
      await page
        .locator('section.fixed.inset-0.top-auto')
        .first()
        .waitFor({ state: 'visible', timeout: 10_000 })
      return undefined
    case 'menu-open':
      await page.locator('button[aria-label="Open/Close menu button"]').first().click()
      await page.waitForTimeout(700)
      return undefined
    case 'dialog':
      await page
        .locator('section.fixed.inset-0.z-50')
        .first()
        .waitFor({ state: 'visible', timeout: 10_000 })
      await page.waitForTimeout(500)
      return undefined
    case 'round-trip': {
      const form = page.locator('form').first()
      await form.locator('div.rounded-full button').nth(1).click()
      await page.waitForTimeout(500)
      return form.locator('xpath=ancestor::section[1]')
    }
    case 'faq-open': {
      const faq = page.locator('section', { has: page.locator('p.cursor-pointer') }).first()
      await faq.locator('p.cursor-pointer').nth(1).click()
      await page.waitForTimeout(800)
      return faq
    }
    default:
      return undefined
  }
}

async function captureJob(context: BrowserContext, job: Job): Promise<ManifestEntry[]> {
  const base: Omit<ManifestEntry, 'kind' | 'status'> = {
    id: job.id,
    route: job.route,
    locale: job.locale,
    viewport: job.viewport.name,
    state: job.state,
    param: job.param,
    url: job.url,
  }
  const page = await context.newPage()
  const entries: ManifestEntry[] = []
  try {
    await page
      .goto(job.url, { waitUntil: 'networkidle', timeout: 60_000 })
      .catch(() => page.goto(job.url, { waitUntil: 'load', timeout: 60_000 }))
    await settle(page, job)
    const mask = [page.locator('video')]
    const target = await prepareState(page, job)

    if (job.kind === 'full-page') {
      await scrollThrough(page)
      const file = path.join(outDir, 'pages', `${job.id}.png`)
      await page.screenshot({
        path: file,
        fullPage: true,
        animations: 'disabled',
        caret: 'hide',
        mask,
      })
      entries.push({ ...base, kind: 'full-page', status: 'captured', ...describe(file) })

      const sections = page.locator('section:not(section section)')
      const count = Math.min(await sections.count(), MAX_SECTIONS)
      for (let index = 0; index < count; index += 1) {
        const section = sections.nth(index)
        const box = await section.boundingBox()
        if (!box || box.height < 20 || box.width < 20) continue
        const label =
          (
            await section
              .locator('h1, h2, h3')
              .first()
              .textContent()
              .catch(() => null)
          )
            ?.trim()
            .slice(0, 80) || undefined
        const clip = path.join(
          outDir,
          'sections',
          `${job.id}--${String(index).padStart(2, '0')}.png`,
        )
        try {
          await section.screenshot({ path: clip, animations: 'disabled', caret: 'hide', mask })
          entries.push({
            ...base,
            kind: 'section',
            sectionIndex: index,
            label,
            status: 'captured',
            ...describe(clip),
          })
        } catch (error) {
          entries.push({
            ...base,
            kind: 'section',
            sectionIndex: index,
            label,
            status: 'failed',
            error: String(error).slice(0, 300),
          })
        }
      }
    } else if (job.kind === 'section' && target) {
      const file = path.join(outDir, 'states', `${job.id}.png`)
      await target.screenshot({ path: file, animations: 'disabled', caret: 'hide', mask })
      entries.push({ ...base, kind: 'section', status: 'captured', ...describe(file) })
    } else {
      const file = path.join(outDir, 'states', `${job.id}.png`)
      await page.screenshot({
        path: file,
        fullPage: false,
        animations: 'disabled',
        caret: 'hide',
        mask,
      })
      entries.push({ ...base, kind: 'viewport', status: 'captured', ...describe(file) })
    }
  } catch (error) {
    entries.push({ ...base, kind: job.kind, status: 'failed', error: String(error).slice(0, 300) })
  } finally {
    await page.close()
  }
  return entries
}

async function main(): Promise<void> {
  const detailRoutes = values['no-detail'] || values['dry-run'] ? [] : await discoverDetailRoutes()
  const jobs = buildMatrix({
    baseUrl,
    locales: list(values.locales) ?? LOCALES,
    viewports,
    routes: list(values.routes),
    detailRoutes,
    states,
    localePrefix: !values['no-locale-prefix'],
  })

  if (values['dry-run']) {
    for (const job of jobs) console.log(`${job.id}\t${job.kind}\t${job.url}`)
    console.log(`${jobs.length} jobs`)
    return
  }

  for (const dir of ['pages', 'sections', 'states'])
    mkdirSync(path.join(outDir, dir), { recursive: true })
  const browser: Browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
  })
  const host = new URL(baseUrl).hostname
  const contexts = new Map<string, BrowserContext>()
  const manifest: Manifest = {
    capturedAt: new Date().toISOString(),
    baseUrl,
    legacyCommit: LEGACY_COMMIT,
    userAgent: '',
    viewports,
    entries: [],
  }

  try {
    for (const [index, job] of jobs.entries()) {
      const key = `${job.locale}|${job.viewport.name}|${job.consentCookie}`
      let context = contexts.get(key)
      if (!context) {
        context = await browser.newContext({
          viewport: { width: job.viewport.width, height: job.viewport.height },
          deviceScaleFactor: 1,
          locale: job.locale === 'ru' ? 'ru-RU' : 'en-US',
          timezoneId: 'Asia/Dubai',
          reducedMotion: 'reduce',
        })
        if (job.consentCookie) {
          await context.addCookies([
            { name: 'cookie-consent', value: 'true', domain: host, path: '/' },
            { name: 'marketing-consent', value: 'false', domain: host, path: '/' },
            { name: 'personal-consent', value: 'false', domain: host, path: '/' },
          ])
        }
        context.setDefaultTimeout(10_000)
        contexts.set(key, context)
        if (!manifest.userAgent) {
          const probe = await context.newPage()
          manifest.userAgent = await probe.evaluate(() => navigator.userAgent)
          await probe.close()
        }
      }
      const entries = await captureJob(context, job)
      manifest.entries.push(...entries)
      const failed = entries.filter((entry) => entry.status === 'failed').length
      console.log(
        `[${index + 1}/${jobs.length}] ${job.id}: ${entries.length - failed} captured${failed ? `, ${failed} failed` : ''}`,
      )
    }
  } finally {
    await browser.close()
  }

  writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  writeFileSync(
    path.join(outDir, 'README.md'),
    [
      '# Legacy visual baselines',
      '',
      `Captured from ${baseUrl} on ${manifest.capturedAt} (legacy commit ${LEGACY_COMMIT}, issue #37).`,
      '',
      '- `pages/`: full-page screenshots per route, locale, viewport (`<route>--<locale>--<viewport>--default.png`).',
      '- `sections/`: one clip per top-level `<section>` of those pages, in document order.',
      '- `states/`: viewport or section captures of interactive states (cookie banner, open menu, booking dialog per source, round trip form, FAQ).',
      '- `manifest.json`: every entry with dimensions, size, sha256 and status; failed entries carry the error.',
      '',
    ].join('\n'),
  )
  const captured = manifest.entries.filter((entry) => entry.status === 'captured')
  const bytes = captured.reduce((sum, entry) => sum + (entry.bytes ?? 0), 0)
  console.log(
    `${captured.length} captured, ${manifest.entries.length - captured.length} failed, ${(bytes / 1024 / 1024).toFixed(1)} MB in ${outDir}`,
  )
  console.log(`routes: ${[...new Set(jobs.map((job) => routeSlug(job.route)))].join(', ')}`)
}

await main()
