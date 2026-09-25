import { execFileSync } from 'node:child_process'
import path from 'node:path'
import type { File, Payload } from 'payload'

import { DEFAULT_LOCALE } from '../../src/i18n/locales'

/**
 * The pictures the legacy pages drew from `public/images` (issue #84, `docs/legacy-inventory.md`
 * section 12.2), imported into Media from the `legacy/v1` tag so an editor can pick the legacy
 * picture for each section instead of the seed's placeholder (`docs/runbooks/content-entry.md`).
 *
 * The decision of 2026-09-13 bounds it: the 99 files no legacy code referenced stay in
 * `legacy/v1`, and the videos stay in `public/` (#175). The one file the code asked for under a
 * misspelled name, `why_us_foreignaircrafts.webp`, is imported under the name it has on disk;
 * the citizens card it was meant for carries no photograph (the decision of #149).
 *
 * A document's filename is the legacy path under `images/` with its slashes as hyphens, so the
 * six `hero.webp` files stay apart and a run finds what an earlier one wrote: that filename is
 * the manifest's key in every environment, where a Media id is not.
 */
export interface LegacyAsset {
  /** Under `public/images/` in `legacy/v1`. */
  path: string
  /** English, in the words of the section that drew it, as the legacy `alt={title}` did. */
  alt: string
}

const WHY_US = 'Why fly with ATM JET'

export const LEGACY_ASSETS: readonly LegacyAsset[] = [
  { path: 'home_page/footer.jpg', alt: 'A private jet cabin behind the footer' },
  { path: 'home_page/why_us_years.webp', alt: `${WHY_US}: years in business` },
  { path: 'home_page/why_us_clients.webp', alt: `${WHY_US}: clients` },
  { path: 'home_page/why_us_trusted_by_celeb.webp', alt: `${WHY_US}: trusted by celebrities` },
  { path: 'home_page/why_us_same_day_departure.webp', alt: `${WHY_US}: same-day departure` },
  { path: 'home_page/why_us_excellence.webp', alt: `${WHY_US}: excellence` },
  {
    path: 'home_page/key_features_tailoredp_references.webp',
    alt: 'Key features: tailored to your preferences',
  },
  {
    path: 'home_page/key_features_cuztomized_aircrafts.webp',
    alt: 'Key features: customised aircraft',
  },
  {
    path: 'home_page/key_features_payment_after_flight.webp',
    alt: 'Key features: payment after the flight',
  },
  { path: 'home_page/key_features_pay_anyway.webp', alt: 'Key features: pay any way you like' },
  { path: 'home_page/key_features_shampain.jpg', alt: 'Key features: champagne on board' },
  { path: 'home_page/For-Business-Agents-one.webp', alt: 'For business agents' },
  { path: 'home_page/2-for-business-agents.webp', alt: 'For partners' },
  { path: 'home_page/pattern.png', alt: 'Pattern behind the privileges panel' },
  { path: 'home_page/yachts.webp', alt: 'A yacht at sea' },
  { path: 'atm_jet_group/yachts.webp', alt: 'A yacht at sea' },
  ...[0, 1, 2, 3, 4, 5, 6, 7].map((n) => ({ path: `tiles/slice_${n}.webp`, alt: `Tile ${n + 1}` })),
  { path: 'home_page/transfer.webp', alt: 'Transfer to and from the aircraft' },
  { path: 'aircraft/aircraft.png', alt: 'An aircraft behind the contact card' },
  { path: 'atm_jet_group/group1.webp', alt: 'ATM JET, the group' },
  { path: 'atm_jet_group/group2.webp', alt: 'ATM JET, the group' },
  { path: 'business_agencies/hero2.webp', alt: 'Business agents' },
  { path: 'business_agencies/file1.webp', alt: 'The checklist for business agents' },
  { path: 'business_agencies/file2.webp', alt: 'The ATM JET presentation' },
  { path: 'business_agencies/insurance.webp', alt: 'Best price' },
  { path: 'business_agencies/insurance2.webp', alt: 'Insurance for partners' },
  { path: 'business_agencies/hero.webp', alt: 'Group charters' },
  { path: 'cargo_charter/hero.webp', alt: 'Cargo charter' },
  { path: 'cargo_charter/why_us_global.webp', alt: `${WHY_US}: a global reach` },
  { path: 'cargo_charter/why_us_personalized.webp', alt: `${WHY_US}: a personal service` },
  { path: 'cargo_charter/why_us_security.webp', alt: `${WHY_US}: security` },
  { path: 'cargo_charter/why_us_guarantees.webp', alt: `${WHY_US}: guarantees` },
  { path: 'citizens/hero.webp', alt: 'Flights for citizens' },
  { path: 'citizens/why_us_sanctions.webp', alt: `${WHY_US}: despite sanctions` },
  { path: 'citizens/why_us_techstops.webp', alt: `${WHY_US}: technical stops` },
  { path: 'citizens/why_us_foreignaircraft.webp', alt: `${WHY_US}: foreign aircraft` },
  { path: 'citizens/why_us_coordination.webp', alt: `${WHY_US}: coordination` },
  { path: 'citizens/why_us_anypayment.webp', alt: `${WHY_US}: any payment` },
  { path: 'empty_legs/hero.png', alt: 'Empty legs' },
  { path: 'group_charter/hero.webp', alt: 'Group charters' },
  { path: 'group_charter/card2.webp', alt: 'A group on board' },
  { path: 'medical/hero.webp', alt: 'Medical aviation' },
  ...[1, 2, 3, 4].map((n) => ({ path: `medical/slide${n}.webp`, alt: `Medical aviation ${n}` })),
  { path: 'partners/hero.webp', alt: 'Partners' },
  { path: 'partners/white-label.webp', alt: 'White label' },
  { path: 'partners/label.webp', alt: 'Your own label' },
  { path: 'partners/payment.jpg', alt: 'Payment' },
  { path: 'jets_dep/personal_manager.webp', alt: 'Personal manager' },
  { path: 'jets_dep/jetsmarket_page_firstscreen_mainpic.webp', alt: 'Aircraft sales' },
  { path: 'jets_dep/jetsmarket_page_aircrafts_services_legaldpt.webp', alt: 'Legal department' },
  {
    path: 'jets_dep/jetsmarket_page_aircrafts_services_financedpt.webp',
    alt: 'Finance department',
  },
  { path: 'jets_dep/jetsmarket_page_team_atmjet.webp', alt: 'The ATM JET team' },
  { path: 'jets_dep/jetsmarket_page_specialmanagement_50flights.webp', alt: '50 flights a month' },
  { path: 'jets_dep/jetsmarket_page_specialmanagement_experience.webp', alt: 'Experience' },
  { path: 'jets_dep/jetsmarket_page_specialmanagement_yields.webp', alt: 'Yields' },
  { path: 'yachts/yacht_page_firstscreen_mainpic.webp', alt: 'Yachts' },
  { path: 'yachts/yacht_page_over20years_management.webp', alt: 'Over 20 years: management' },
  { path: 'yachts/yacht_page_over20years_plan.webp', alt: 'Over 20 years: planning' },
  { path: 'yachts/yacht_page_over20years_database.webp', alt: 'Over 20 years: the database' },
  { path: 'yachts/yacht_page_over20years_luxury.webp', alt: 'Over 20 years: luxury' },
  { path: 'yachts/yacht_page_over20years_l.webp', alt: 'Over 20 years' },
  { path: 'yachts/yacht_page_yachtservices_legal.webp', alt: 'Yacht services: legal' },
  { path: 'yachts/yacht_page_yachtservices_finance.webp', alt: 'Yacht services: finance' },
  ...[1, 2, 3, 4, 5].map((n) => ({
    path: `yachts/image_0${n}.svg`,
    alt: `We inspect: step ${n}`,
  })),
]

/** The Media filename a legacy path is imported under. */
export function mediaFilename(legacyPath: string): string {
  return legacyPath.split('/').join('-')
}

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

/** Reads a file of `public/images` as the given ref of this repository holds it. */
export function gitReader(ref: string): (legacyPath: string) => Buffer {
  return (legacyPath) =>
    execFileSync('git', ['cat-file', 'blob', `${ref}:public/images/${legacyPath}`], {
      maxBuffer: 64 * 1024 * 1024,
    })
}

export type AssetAction = 'created' | 'unchanged'

export interface AssetOutcome {
  path: string
  filename: string
  action: AssetAction
  id?: number
}

/**
 * Creates the Media document of every listed picture that has none; one already under the
 * filename is left as it is, since an editor may have changed it since. Every file is read, so
 * a dry run still proves each one is in the ref.
 */
export async function importLegacyAssets(
  payload: Payload,
  options: {
    read: (legacyPath: string) => Buffer
    assets?: readonly LegacyAsset[]
    dryRun?: boolean
  },
): Promise<AssetOutcome[]> {
  const { read, assets = LEGACY_ASSETS, dryRun = false } = options
  const outcomes: AssetOutcome[] = []

  for (const asset of assets) {
    const filename = mediaFilename(asset.path)
    const data = read(asset.path)
    const { docs } = await payload.find({
      collection: 'media',
      where: { filename: { equals: filename } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const existing = docs[0]

    if (existing) {
      outcomes.push({ path: asset.path, filename, action: 'unchanged', id: existing.id })
      continue
    }

    if (dryRun) {
      outcomes.push({ path: asset.path, filename, action: 'created' })
      continue
    }

    const file: File = {
      data,
      mimetype: MIME_TYPES[path.extname(filename)] ?? 'application/octet-stream',
      name: filename,
      size: data.length,
    }
    const created = await payload.create({
      collection: 'media',
      data: { alt: asset.alt },
      file,
      locale: DEFAULT_LOCALE,
      overrideAccess: true,
      // A bulk write has nothing to invalidate: no page draws these until an editor picks one.
      context: { skipRevalidation: true },
    })

    outcomes.push({ path: asset.path, filename, action: 'created', id: created.id })
  }

  return outcomes
}

/** The manifest, one picture per line: legacy path, Media filename, Media id in this database. */
export function manifestTsv(outcomes: readonly AssetOutcome[]): string {
  return [
    'legacy path\tmedia filename\tmedia id',
    ...outcomes.map(({ path: p, filename, id }) => `/images/${p}\t${filename}\t${id ?? ''}`),
  ].join('\n')
}
