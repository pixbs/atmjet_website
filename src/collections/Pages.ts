import type { CollectionConfig } from 'payload'

import { editorOrAdmin, publishedOnly } from '@/access'
import { advantages } from '@/blocks/Advantages/config'
import { bestPrice } from '@/blocks/BestPrice/config'
import { contactCard } from '@/blocks/ContactCard/config'
import { descriptor } from '@/blocks/Descriptor/config'
import { documents } from '@/blocks/Documents/config'
import { emptyLegs } from '@/blocks/EmptyLegs/config'
import { faq } from '@/blocks/Faq/config'
import { framedDescriptor } from '@/blocks/FramedDescriptor/config'
import { groupCards } from '@/blocks/GroupCards/config'
import { guide } from '@/blocks/Guide/config'
import { heroAircraft } from '@/blocks/HeroAircraft/config'
import { heroEmptyLegs } from '@/blocks/HeroEmptyLegs/config'
import { heroGroup } from '@/blocks/HeroGroup/config'
import { heroPartners } from '@/blocks/HeroPartners/config'
import { heroSales } from '@/blocks/HeroSales/config'
import { heroSubpage } from '@/blocks/HeroSubpage/config'
import { heroVideo } from '@/blocks/HeroVideo/config'
import { heroYachts } from '@/blocks/HeroYachts/config'
import { keyFeatures } from '@/blocks/KeyFeatures/config'
import { optionsTiles } from '@/blocks/OptionsTiles/config'
import { personalManager } from '@/blocks/PersonalManager/config'
import { photoDescriptor } from '@/blocks/PhotoDescriptor/config'
import { privilege } from '@/blocks/Privilege/config'
import { quote } from '@/blocks/Quote/config'
import { recentYachts } from '@/blocks/RecentYachts/config'
import { tiles } from '@/blocks/Tiles/config'
import { weInspect } from '@/blocks/WeInspect/config'
import { whyUs } from '@/blocks/WhyUs/config'
import { yachtsPromo } from '@/blocks/YachtsPromo/config'
import { revalidateCollection } from '@/hooks/revalidate'

/**
 * The content pages of the site (issue #60). The legacy site hard-coded all thirteen of them as
 * React files (`docs/legacy-inventory.md` section 2.1), so a copy change meant a deploy; here
 * they are documents an editor owns.
 *
 * `layout` is the blocks field every ported section lands in (E7), one block per issue.
 */

/** The thirteen static routes of section 2.1. The empty slug is the home page. */
export const PAGE_SLUGS = [
  '',
  'aircraft',
  'atm_jet_group',
  'business_agents',
  'cargo_charter',
  'citizens',
  'empty_legs',
  'group_charters',
  'medical_aviation',
  'partners',
  'sales_dept',
  'sales_yachts',
  'yachts',
] as const

/** The path a page is served at. The home page is the locale root, not `/en/home`. */
export function pathForPage(locale: string, slug: string): string {
  return slug === '' ? `/${locale}` : `/${locale}/${slug}`
}

const revalidation = revalidateCollection('pages')

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'updatedAt'],
    livePreview: {
      // One preview per routed locale, so an editor sees the page they are actually editing.
      url: ({ data, req }) =>
        `${req.payload.config.serverURL}${pathForPage(String(req.locale ?? 'en'), String(data?.slug ?? ''))}`,
    },
  },
  access: {
    // A visitor sees published pages; the people who run the content see drafts too, which is
    // what makes live preview and the admin list work (docs/access-matrix.md).
    read: publishedOnly,
    create: editorOrAdmin,
    update: editorOrAdmin,
    delete: editorOrAdmin,
  },
  hooks: {
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
  },
  versions: {
    drafts: {
      autosave: { interval: 375 },
      schedulePublish: true,
    },
    maxPerDoc: 25,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Shown in the admin and used as the default SEO title.' },
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'The path after the locale, without a leading slash. Empty means the home page. Not localized: the legacy URLs are identical in every language and parity depends on that.',
      },
    },
    {
      name: 'layout',
      type: 'blocks',
      // Sections land here one at a time in E7, each with its own issue.
      blocks: [
        advantages,
        bestPrice,
        contactCard,
        descriptor,
        documents,
        emptyLegs,
        faq,
        framedDescriptor,
        groupCards,
        guide,
        heroAircraft,
        heroEmptyLegs,
        heroGroup,
        heroPartners,
        heroSales,
        heroSubpage,
        heroVideo,
        heroYachts,
        keyFeatures,
        optionsTiles,
        personalManager,
        photoDescriptor,
        privilege,
        quote,
        recentYachts,
        tiles,
        weInspect,
        whyUs,
        yachtsPromo,
      ],
      admin: { description: 'The sections of this page, in the order they are rendered.' },
    },
  ],
}
