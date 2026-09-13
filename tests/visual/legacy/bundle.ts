/**
 * Access to the legacy baseline bundle (issue #37) for the parity harness (issue #38).
 * The manifest is committed; the images are downloaded from the legacy/v1 release into
 * tests/visual/legacy/bundle (ignored by git) with scripts/baselines/download-legacy-bundle.sh.
 */
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { routeSlug, type StateName, type ViewportName } from '../../../scripts/baselines/matrix'

export interface LegacyEntry {
  id: string
  route: string
  locale: string
  viewport: ViewportName
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

export interface LegacyManifest {
  capturedAt: string
  baseUrl: string
  legacyCommit: string
  entries: LegacyEntry[]
}

const LEGACY_DIR = path.resolve(process.cwd(), 'tests/visual/legacy')
export const MANIFEST_PATH = path.join(LEGACY_DIR, 'manifest.json')
export const BUNDLE_DIR = path.join(LEGACY_DIR, 'bundle')

export interface LegacyQuery {
  /** manifest id, for example `home--en--desktop--default` */
  id: string
  /** index of the top-level section clip; omitted for the page or state capture itself */
  section?: number
}

export function legacyId(
  route: string,
  locale: string,
  viewport: ViewportName,
  state: StateName = 'default',
  param?: string,
): string {
  const suffix = param ? `--${param.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : ''
  return `${routeSlug(route)}--${locale}--${viewport}--${state}${suffix}`
}

export function findLegacyEntry(
  manifest: LegacyManifest,
  query: LegacyQuery,
): LegacyEntry | undefined {
  return manifest.entries.find(
    (entry) =>
      entry.id === query.id &&
      entry.status === 'captured' &&
      (query.section === undefined
        ? entry.kind !== 'section' || entry.sectionIndex === undefined
        : entry.kind === 'section' && entry.sectionIndex === query.section),
  )
}

export function loadLegacyManifest(manifestPath = MANIFEST_PATH): LegacyManifest | null {
  if (!existsSync(manifestPath)) return null
  return JSON.parse(readFileSync(manifestPath, 'utf8')) as LegacyManifest
}

export function legacyImagePath(entry: LegacyEntry, bundleDir = BUNDLE_DIR): string | null {
  if (!entry.file) return null
  const file = path.join(bundleDir, entry.file)
  return existsSync(file) ? file : null
}

export function bundleAvailable(manifestPath = MANIFEST_PATH, bundleDir = BUNDLE_DIR): boolean {
  return existsSync(manifestPath) && existsSync(path.join(bundleDir, 'manifest.json'))
}
