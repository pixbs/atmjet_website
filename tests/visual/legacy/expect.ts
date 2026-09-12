/**
 * `expectLegacyParity`: compares a page or an element of the rewrite against the legacy baseline
 * bundle (issue #38). Skips with a clear message when the bundle is not available.
 */
import { readFileSync } from 'node:fs'
import { test, type Locator, type Page } from '@playwright/test'
import {
  BUNDLE_DIR,
  MANIFEST_PATH,
  bundleAvailable,
  findLegacyEntry,
  legacyImagePath,
  loadLegacyManifest,
  type LegacyQuery,
} from './bundle'
import { compareImages, type CompareOptions, type CompareResult } from './compare'

export interface ParityOptions extends CompareOptions {
  /** elements to mask before the capture (videos, counters, dates) */
  mask?: Locator[]
  /** full-page capture for pages (default true) */
  fullPage?: boolean
}

function isPage(target: Page | Locator): target is Page {
  return typeof (target as Page).goto === 'function'
}

export async function expectLegacyParity(
  target: Page | Locator,
  query: LegacyQuery,
  options: ParityOptions = {},
): Promise<CompareResult> {
  const info = test.info()
  test.skip(
    !bundleAvailable(),
    `legacy bundle not available (expected ${MANIFEST_PATH} and ${BUNDLE_DIR}); run scripts/baselines/download-legacy-bundle.sh`,
  )

  const manifest = loadLegacyManifest()!
  const entry = findLegacyEntry(manifest, query)
  if (!entry)
    throw new Error(`no captured legacy entry for ${JSON.stringify(query)} in ${MANIFEST_PATH}`)
  const expectedPath = legacyImagePath(entry)
  if (!expectedPath)
    throw new Error(
      `legacy image missing for ${entry.id}: ${entry.file} (re-run scripts/baselines/download-legacy-bundle.sh)`,
    )

  const page = isPage(target) ? target : target.page()
  await page.evaluate(() => document.fonts.ready)
  const mask = options.mask ?? [page.locator('video')]
  const actual = isPage(target)
    ? await target.screenshot({
        fullPage: options.fullPage ?? true,
        animations: 'disabled',
        caret: 'hide',
        mask,
      })
    : await target.screenshot({ animations: 'disabled', caret: 'hide', mask })
  const expected = readFileSync(expectedPath)
  const result = compareImages(actual, expected, options)

  const label =
    query.section === undefined
      ? entry.id
      : `${entry.id}--${String(query.section).padStart(2, '0')}`
  if (!result.pass) {
    await info.attach(`${label}-actual.png`, { body: actual, contentType: 'image/png' })
    await info.attach(`${label}-expected.png`, { body: expected, contentType: 'image/png' })
    if (result.diff)
      await info.attach(`${label}-diff.png`, { body: result.diff, contentType: 'image/png' })
    throw new Error(
      `legacy parity failed for ${label}: ${result.reason} (legacy captured ${manifest.capturedAt} from ${manifest.baseUrl})`,
    )
  }
  return result
}
