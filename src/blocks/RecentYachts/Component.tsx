import { getLocale, getTranslations } from 'next-intl/server'

import { People, BedDouble, SecurityWorker } from '@/components/icons'
import { YachtCard } from '@/components/cards/yacht-card'
import { YachtCarousel } from '@/components/cards/yacht-carousel'
import type { Locale } from '@/i18n/locales'
import { listSaleYachts } from '@/lib/data/yachts'
import { saleYachtSpecs } from '@/lib/yachts'

/**
 * The recent yachts (issue #133, `docs/legacy-inventory.md` section 4): the heading and, under
 * it, the yachts for sale one card at a time.
 *
 * The listings are read here rather than handed in, as the empty legs are (issue #117): they are
 * documents and not fields, so the block passes the heading and this asks the collection for the
 * rest, on the server (ADR-0007).
 *
 * The labels the cards print come from the message catalogue. The legacy card wrote all eleven
 * of them in English on a site served in three languages (section 10.4).
 */
export interface RecentYachtsProps {
  title: string
  /** How many listings the carousel holds, newest first. */
  limit: number
}

export async function RecentYachts({ title, limit }: RecentYachtsProps) {
  // The page has already refused a locale the site does not serve.
  const locale = (await getLocale()) as Locale
  const [yachts, t] = await Promise.all([
    listSaleYachts(locale, limit),
    getTranslations({ locale, namespace: 'yacht' }),
  ])

  if (yachts.length === 0) return null

  const photoLabels = {
    previous: t('previousPhoto'),
    next: t('nextPhoto'),
    slides: t('photographs'),
  }
  const specLabels = {
    shipyard: t('shipyard'),
    year: t('year'),
    length: t('length'),
    beam: t('beam'),
    draft: t('draft'),
    cruisingSpeed: t('cruisingSpeed'),
    maxSpeed: t('maxSpeed'),
    location: t('location'),
    feet: t('feet'),
  }

  return (
    <section data-section="recent-yachts">
      <div className="container">
        {/* The legacy card carried `rounded-2xl` as well, which never took effect: `.card` is
            unlayered and rounds it further (docs/adr/0006-styling-and-motion.md). */}
        <div className="card gap-8 bg-graphite-950 p-8 md:gap-10 md:p-10">
          <h2>{title}</h2>
          <YachtCarousel labels={{ previous: t('previousYacht'), next: t('nextYacht') }}>
            {yachts.map((yacht) => (
              <YachtCard
                key={yacht.id}
                figures={[
                  { label: t('guests'), value: printable(yacht.guests), icon: <People /> },
                  { label: t('cabins'), value: printable(yacht.cabins), icon: <BedDouble /> },
                  { label: t('crew'), value: printable(yacht.crew), icon: <SecurityWorker /> },
                ]}
                labels={photoLabels}
                photos={yacht.photos}
                specs={saleYachtSpecs(yacht, specLabels)}
              />
            ))}
          </YachtCarousel>
        </div>
      </div>
    </section>
  )
}

/** A count an editor has not filled in is printed as nothing, as the legacy card printed it. */
function printable(value: number | null | undefined): string {
  return value === null || value === undefined ? '' : String(value)
}
