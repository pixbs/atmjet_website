import type { Payload } from 'payload'

import { DEFAULT_LOCALE } from '../../src/i18n/locales'
import { mediaFilename } from './assets'

/**
 * Puts the legacy picture back in every section the seed drew a placeholder in (issue #84): the
 * one `docs/legacy-inventory.md` sections 4 and 12.2 name for that place on that page, from the
 * Media documents `import:legacy assets` wrote.
 *
 * Only a placeholder is replaced. A section an editor has given a picture of their own keeps it,
 * and one the seed left without a picture stays without (the third citizens card, the last two
 * cargo cards), so a run is safe at any point of the content entry and can be repeated.
 */
export interface Placement {
  /** The page's slug; the home page's is empty. */
  page: string
  block: string
  /** Which block of that type on the page, counted from the top; the first by default. */
  nth?: number
  /** Inside the block; `*` steps through an array, row by row. */
  field: string
  /** One per row the `*` steps through, in order; `null` where a row takes none. */
  pictures: (string | null)[]
}

const home = (name: string) => `home_page/${name}`
const WHY_US_HOME = [
  'years',
  'clients',
  'trusted_by_celeb',
  'same_day_departure',
  'excellence',
].map((name) => home(`why_us_${name}.webp`))
const OVER_20_YEARS = ['management', 'plan', 'database', 'luxury'].map(
  (name) => `yachts/yacht_page_over20years_${name}.webp`,
)
const YACHTS_HERO = ['yachts/yacht_page_firstscreen_mainpic.webp']
const MANAGER = ['jets_dep/personal_manager.webp']
const YACHTS_PROMO: Placement['pictures'] = [home('yachts.webp')]
const PATTERN = [home('pattern.png')]

export const PLACEMENTS: readonly Placement[] = [
  { page: '', block: 'whyUs', field: 'cards.*.image', pictures: WHY_US_HOME },
  {
    page: '',
    block: 'keyFeatures',
    field: 'cards.*.image',
    pictures: [
      ...['tailoredp_references', 'cuztomized_aircrafts', 'payment_after_flight', 'pay_anyway'].map(
        (name) => home(`key_features_${name}.webp`),
      ),
      home('key_features_shampain.jpg'),
    ],
  },
  {
    page: '',
    block: 'optionsTiles',
    field: 'tiles.*.image',
    pictures: [home('For-Business-Agents-one.webp'), home('2-for-business-agents.webp')],
  },
  { page: '', block: 'privilege', field: 'contact.background', pictures: PATTERN },
  { page: '', block: 'yachtsPromo', field: 'image', pictures: YACHTS_PROMO },
  {
    page: '',
    block: 'yachtsPromo',
    field: 'invitation.image',
    pictures: ['atm_jet_group/yachts.webp'],
  },
  {
    page: '',
    block: 'tiles',
    field: 'tiles.*.image',
    pictures: [0, 1, 2, 3, 4, 5, 6, 7].map((n) => `tiles/slice_${n}.webp`),
  },
  { page: '', block: 'transfer', field: 'image', pictures: [home('transfer.webp')] },

  { page: 'aircraft', block: 'contactCard', field: 'image', pictures: ['aircraft/aircraft.png'] },

  {
    page: 'atm_jet_group',
    block: 'groupCards',
    field: 'cards.*.image',
    pictures: ['atm_jet_group/group1.webp', 'atm_jet_group/group2.webp'],
  },
  { page: 'atm_jet_group', block: 'yachtsPromo', field: 'image', pictures: YACHTS_PROMO },
  {
    page: 'atm_jet_group',
    block: 'yachtsPromo',
    field: 'invitation.image',
    pictures: ['atm_jet_group/yachts.webp'],
  },
  { page: 'atm_jet_group', block: 'privilege', field: 'contact.background', pictures: PATTERN },

  {
    page: 'business_agents',
    block: 'guide',
    field: 'image',
    pictures: ['business_agencies/hero2.webp'],
  },
  { page: 'business_agents', block: 'whyUs', field: 'cards.*.image', pictures: WHY_US_HOME },
  {
    page: 'business_agents',
    block: 'documents',
    field: 'documents.*.image',
    pictures: ['business_agencies/file1.webp', 'business_agencies/file2.webp'],
  },
  { page: 'business_agents', block: 'transfer', field: 'image', pictures: [home('transfer.webp')] },
  {
    page: 'business_agents',
    block: 'bestPrice',
    field: 'image',
    pictures: ['business_agencies/insurance.webp'],
  },

  {
    page: 'cargo_charter',
    block: 'heroSubpage',
    field: 'image',
    pictures: ['cargo_charter/hero.webp'],
  },
  {
    page: 'cargo_charter',
    block: 'whyUs',
    field: 'cards.*.image',
    pictures: ['global', 'personalized', 'security', 'guarantees'].map(
      (name) => `cargo_charter/why_us_${name}.webp`,
    ),
  },

  { page: 'citizens', block: 'heroSubpage', field: 'image', pictures: ['citizens/hero.webp'] },
  {
    page: 'citizens',
    block: 'whyUs',
    field: 'cards.*.image',
    // The third card asked for a file that was never there (the decision of #149).
    pictures: [
      'citizens/why_us_sanctions.webp',
      'citizens/why_us_techstops.webp',
      null,
      'citizens/why_us_coordination.webp',
      'citizens/why_us_anypayment.webp',
    ],
  },

  { page: 'empty_legs', block: 'heroEmptyLegs', field: 'image', pictures: ['empty_legs/hero.png'] },

  {
    page: 'group_charters',
    block: 'heroSubpage',
    field: 'image',
    pictures: ['group_charter/hero.webp'],
  },
  {
    page: 'group_charters',
    block: 'whyUs',
    field: 'cards.*.image',
    pictures: [
      'business_agencies/hero.webp',
      'group_charter/card2.webp',
      'group_charter/hero.webp',
    ],
  },

  {
    page: 'medical_aviation',
    block: 'heroSubpage',
    field: 'image',
    pictures: ['medical/hero.webp'],
  },
  {
    page: 'medical_aviation',
    block: 'keyFeatures',
    field: 'cards.*.image',
    pictures: [1, 2, 3, 4].map((n) => `medical/slide${n}.webp`),
  },

  { page: 'partners', block: 'heroPartners', field: 'image', pictures: ['partners/hero.webp'] },
  { page: 'partners', block: 'whyUs', field: 'cards.*.image', pictures: WHY_US_HOME },
  {
    page: 'partners',
    block: 'whyUs',
    nth: 1,
    field: 'cards.*.image',
    pictures: [
      'partners/white-label.webp',
      'business_agencies/insurance2.webp',
      'partners/label.webp',
      'partners/payment.jpg',
    ],
  },
  { page: 'partners', block: 'personalManager', field: 'image', pictures: MANAGER },

  {
    page: 'sales_dept',
    block: 'heroSales',
    field: 'image',
    pictures: ['jets_dep/jetsmarket_page_firstscreen_mainpic.webp'],
  },
  { page: 'sales_dept', block: 'personalManager', field: 'image', pictures: MANAGER },
  {
    page: 'sales_dept',
    block: 'optionsSelection',
    field: 'cards.*.image',
    pictures: ['legaldpt', 'financedpt'].map(
      (name) => `jets_dep/jetsmarket_page_aircrafts_services_${name}.webp`,
    ),
  },
  {
    page: 'sales_dept',
    block: 'advantages',
    field: 'image',
    pictures: ['jets_dep/jetsmarket_page_team_atmjet.webp'],
  },
  {
    page: 'sales_dept',
    block: 'whyUs',
    field: 'cards.*.image',
    pictures: ['50flights', 'experience', 'yields'].map(
      (name) => `jets_dep/jetsmarket_page_specialmanagement_${name}.webp`,
    ),
  },

  { page: 'sales_yachts', block: 'heroYachts', field: 'image', pictures: YACHTS_HERO },
  { page: 'sales_yachts', block: 'keyFeatures', field: 'cards.*.image', pictures: OVER_20_YEARS },
  {
    page: 'sales_yachts',
    block: 'weInspect',
    field: 'slides.*.image',
    pictures: [1, 2, 3, 4, 5].map((n) => `yachts/image_0${n}.svg`),
  },
  {
    page: 'sales_yachts',
    block: 'optionsSelection',
    field: 'cards.*.image',
    pictures: ['legal', 'finance'].map((name) => `yachts/yacht_page_yachtservices_${name}.webp`),
  },
  {
    page: 'sales_yachts',
    block: 'photoDescriptor',
    field: 'image',
    pictures: ['yachts/yacht_page_over20years_l.webp'],
  },
  { page: 'sales_yachts', block: 'whyUs', field: 'cards.*.image', pictures: OVER_20_YEARS },

  { page: 'yachts', block: 'heroYachts', field: 'image', pictures: YACHTS_HERO },
]

/** The picture behind the footer, which is a global rather than a page's. */
export const FOOTER_PICTURE = home('footer.jpg')

/** The placeholders the seed draws (`scripts/seed/media.ts`). */
const PLACEHOLDERS = ['seed-gold.png', 'seed-surface.png']

type Row = Record<string, unknown>

/** An upload as a depth-0 read gives it, or as a deeper one does. */
const idOf = (value: unknown): unknown =>
  value !== null && typeof value === 'object' ? (value as Row).id : value

/**
 * Swaps the placeholders of one block in place: every row the path reaches whose value is one
 * of `placeholders` takes the picture `pictureId` names for it. Answers how many it swapped.
 */
export function placeInBlock(
  block: object,
  placement: Pick<Placement, 'field' | 'pictures'>,
  placeholders: ReadonlySet<unknown>,
  pictureId: (legacyPath: string) => number | undefined,
): number {
  let swapped = 0

  // `cards.*.image` reads as: the block's `cards`, each of its rows, that row's `image`.
  const at = (holder: unknown, [segment, ...rest]: string[], row: number): void => {
    if (holder === null || typeof holder !== 'object') return
    if (segment === '*') {
      if (Array.isArray(holder)) holder.forEach((item, index) => at(item, rest, index))
      return
    }

    const fields = holder as Row
    if (rest.length > 0) return at(fields[segment], rest, row)

    const picture = placement.pictures[row]
    const id = picture ? pictureId(picture) : undefined
    if (id === undefined || !placeholders.has(idOf(fields[segment]))) return

    fields[segment] = id
    swapped += 1
  }

  at(block, placement.field.split('.'), 0)

  return swapped
}

export interface PictureOutcome {
  /** The page's slug, or `footer`. */
  target: string
  swapped: number
}

async function mediaIds(payload: Payload, filenames: string[]): Promise<Map<string, number>> {
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { in: filenames } },
    pagination: false,
    depth: 0,
    select: { filename: true },
    overrideAccess: true,
  })

  return new Map(docs.map((doc) => [doc.filename ?? '', doc.id]))
}

/**
 * Applies every placement, one page at a time, and the footer's picture. A picture missing from
 * Media (the assets not imported yet) leaves its placeholder where it is.
 */
export async function placePictures(
  payload: Payload,
  options: {
    placements?: readonly Placement[]
    /** The filenames a slot may be replaced from; the seed's two unless a test names its own. */
    placeholders?: readonly string[]
    dryRun?: boolean
  } = {},
): Promise<PictureOutcome[]> {
  const {
    placements = PLACEMENTS,
    placeholders: replaceable = PLACEHOLDERS,
    dryRun = false,
  } = options
  const wanted = [
    ...new Set(
      [...placements.flatMap((one) => one.pictures), FOOTER_PICTURE].filter(
        (picture): picture is string => picture !== null,
      ),
    ),
  ]
  const ids = await mediaIds(payload, [...wanted.map(mediaFilename), ...replaceable])
  const placeholders = new Set<unknown>(replaceable.map((name) => ids.get(name)).filter(Boolean))
  const pictureId = (legacyPath: string) => ids.get(mediaFilename(legacyPath))
  const outcomes: PictureOutcome[] = []

  for (const slug of [...new Set(placements.map((one) => one.page))]) {
    const { docs } = await payload.find({
      collection: 'pages',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      locale: DEFAULT_LOCALE,
      overrideAccess: true,
    })
    const page = docs[0]
    if (!page) continue

    const layout = page.layout ?? []
    let swapped = 0
    for (const placement of placements.filter((one) => one.page === slug)) {
      const block = layout.filter((one) => one.blockType === placement.block)[placement.nth ?? 0]
      if (block) swapped += placeInBlock(block, placement, placeholders, pictureId)
    }

    outcomes.push({ target: slug === '' ? '(home)' : slug, swapped })
    if (swapped === 0 || dryRun) continue

    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { layout },
      locale: DEFAULT_LOCALE,
      overrideAccess: true,
      context: { skipRevalidation: true },
    })
  }

  const footer = await payload.findGlobal({ slug: 'footer', depth: 0, overrideAccess: true })
  const picture = pictureId(FOOTER_PICTURE)
  const swap = picture !== undefined && placeholders.has(idOf(footer.background))
  outcomes.push({ target: 'footer', swapped: swap ? 1 : 0 })
  if (swap && !dryRun)
    await payload.updateGlobal({
      slug: 'footer',
      data: { background: picture },
      locale: DEFAULT_LOCALE,
      overrideAccess: true,
      context: { skipRevalidation: true },
    })

  return outcomes
}
