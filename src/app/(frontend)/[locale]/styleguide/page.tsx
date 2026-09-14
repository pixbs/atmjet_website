import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import React from 'react'

import * as icons from '@/components/icons'
import { Counter } from '@/components/motion/counter'
import { Line } from '@/components/motion/line'
import { Reveal } from '@/components/motion/reveal'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { EmptyLegCard } from '@/components/cards/empty-leg-card'
import { FileCard } from '@/components/cards/file-card'
import { GroupCard } from '@/components/cards/group-card'
import { KeyFeatureCard } from '@/components/cards/key-feature-card'
import { PrivilegeCard } from '@/components/cards/privilege-card'
import { VehicleCard } from '@/components/cards/vehicle-card'
import { WhyUsCard } from '@/components/cards/why-us-card'
import { YachtsCard } from '@/components/cards/yachts-card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Carousel, CarouselArrows, CarouselDots, CarouselProgress } from '@/components/ui/carousel'
import { Checkbox } from '@/components/ui/checkbox'
import { CounterInput } from '@/components/ui/counter-input'
import { Gallery } from '@/components/ui/gallery'
import { Input } from '@/components/ui/input'
import { LocaleSwitch } from '@/components/ui/locale-switch'
import { Select } from '@/components/ui/select'
import type { Locale } from '@/i18n/locales'
import { listMediaImages } from '@/lib/data/media'
import { getEnabledLocales } from '@/lib/data/site-settings'

/**
 * Fixture page for the parity base layer (issue #48). It renders every global rule the
 * legacy stylesheet defined, so tests/visual/styleguide.visual.spec.ts can catch a change
 * to the base layer or to a token; ported sections compare against the legacy baselines
 * instead (E6-E8). Server-rendered, unlinked and not indexed.
 */
export const metadata: Metadata = {
  title: 'Styleguide',
  robots: { index: false, follow: false },
}

const GRAPHITE = [
  { token: 'graphite-100', legacy: 'gray-800', className: 'bg-graphite-100' },
  { token: 'graphite-300', legacy: 'gray-700', className: 'bg-graphite-300' },
  { token: 'graphite-400', legacy: 'gray-600', className: 'bg-graphite-400' },
  { token: 'graphite-500', legacy: 'gray-500', className: 'bg-graphite-500' },
  { token: 'graphite-700', legacy: 'gray-400', className: 'bg-graphite-700' },
  { token: 'graphite-800', legacy: 'gray-300', className: 'bg-graphite-800' },
  { token: 'graphite-850', legacy: 'gray-200', className: 'bg-graphite-850' },
  { token: 'graphite-900', legacy: 'gray-100', className: 'bg-graphite-900' },
  { token: 'graphite-950', legacy: 'gray-150', className: 'bg-graphite-950' },
  { token: 'white', legacy: 'gray-900', className: 'bg-white' },
]

const ACCENTS = [
  { token: 'gold-600', className: 'bg-gold-600' },
  { token: 'gold-500', className: 'bg-gold-500' },
  { token: 'gold-300', className: 'bg-gold-300' },
  { token: 'gold-400', className: 'bg-gold-400' },
  { token: 'teal-950', className: 'bg-teal-950' },
  { token: 'green-950', className: 'bg-green-950' },
  { token: 'red-500', className: 'bg-red-500' },
  { token: 'red-50', className: 'bg-red-50' },
  { token: 'orange-200', className: 'bg-orange-200' },
  { token: 'blue-600', className: 'bg-blue-600' },
  { token: 'neutral-900', className: 'bg-neutral-900' },
  { token: 'black', className: 'bg-black' },
]

const RADII = ['rounded-sm', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full']

/** Enough slides for the dots to have something to count and the progress bar somewhere to go. */
const SLIDES = ['One', 'Two', 'Three', 'Four', 'Five']

/** Three legs: one priced in dollars, one in dirhams, one the legacy admin never priced. */
const EMPTY_LEGS = [
  {
    departureAt: '2026-03-05T09:00:00.000Z',
    price: 12_000,
    currency: 'USD',
    from: { icao: 'OMDB', airport: 'Dubai' },
    to: { icao: 'LFPB', airport: 'Paris Le Bourget' },
  },
  {
    departureAt: '2026-04-18T15:30:00.000Z',
    price: 8_500,
    currency: 'AED',
    from: { icao: 'OMDW', airport: 'Al Maktoum' },
    to: { icao: 'UUWW' },
  },
  {
    departureAt: '2026-05-02T06:15:00.000Z',
    price: null,
    currency: 'USD',
    from: { icao: 'EGGW', airport: 'Luton' },
    to: { icao: 'LSGG', airport: 'Geneva' },
  },
]

/**
 * The two arms of the group. One href starts with a slash and one does not, because the legacy
 * card put the locale in front of both and produced `/en//aircraft` from the first.
 */
const GROUP_CARDS = [
  {
    title: 'Charter',
    description: 'A fleet on call, from a light jet to an airliner.',
    action: { label: 'See the aircraft', href: '/aircraft' },
  },
  {
    title: 'Sales',
    description: 'Buying, selling and managing an aircraft of your own.',
    action: { label: 'Talk to sales', href: 'sales_dept' },
  },
]

/** The two documents `/business_agents` offers, at the addresses the legacy page linked to. */
const FILE_CARDS = [
  {
    title: 'Checklist for ordering a private jet',
    file: {
      label: 'Download',
      href: 'https://atmjet.ams3.cdn.digitaloceanspaces.com/Checklist%20for%20ordering%20%20a%20private%20jet%20for%20an%20executive%20EN.pdf',
    },
  },
  {
    title: 'ATM JET presentation',
    file: {
      label: 'Download',
      href: 'https://atmjet.ams3.cdn.digitaloceanspaces.com/presentation/ATM%20JET%20Presentation.pdf',
    },
  },
]

/** The three privileges the section stacks, with the icons the legacy gave them. */
const PRIVILEGES = [
  {
    Icon: icons.PlaneGold,
    title: 'A jet within three hours',
    description: 'An aircraft ready at the nearest airport, whatever the hour.',
  },
  {
    Icon: icons.Exchange,
    title: 'One price, agreed once',
    description: 'What is quoted is what is invoiced, with no fuel or handling added later.',
  },
  {
    Icon: icons.DiamondGold,
    title: 'The cabin as you left it',
    description: 'Crew, catering and cabin kept to the standard you set on the first flight.',
  },
]

/** What the yachts promotion says in its three columns. */
const YACHT_COLUMNS = [
  { title: 'The fleet', description: 'Motor yachts and sailing yachts from 20 to 100 metres.' },
  { title: 'The crew', description: 'A captain and a crew who know the water you are sailing.' },
  {
    title: 'The route',
    description: 'A week in the Mediterranean or a crossing, planned around you.',
  },
]

/**
 * Five reasons, as the home section carries them, in the shapes the legacy sections use: with a
 * figure and a photograph, and with neither on the group charters page. Five rather than three
 * so the stack is taller than the screen, which is the only way to see a card come to rest.
 */
const WHY_US = [
  {
    num: '20+',
    title: 'Years in the air',
    description: 'Two decades of charters out of the Gulf, Europe and the CIS.',
    withImage: true,
  },
  {
    num: '1,000 flights',
    title: 'Flown last year',
    description: 'From a two-hour hop to an intercontinental crossing.',
    withImage: true,
  },
  {
    num: '3 hours',
    title: 'From the call to the wheels up',
    description: 'An aircraft and a crew ready at the nearest airport.',
    withImage: true,
  },
  {
    num: '24/7',
    title: 'One manager, at any hour',
    description: 'The same person on your account, night flights included.',
    withImage: false,
  },
  {
    title: 'A price agreed once',
    description: 'What is quoted is what is invoiced, with nothing added on landing.',
    withImage: false,
  },
]

/** Four features, as the medical aviation page carries them. */
const KEY_FEATURES = [
  {
    title: 'A flying intensive care unit',
    description: 'A stretcher, a ventilator and the monitoring a transfer needs.',
  },
  {
    title: 'A doctor on board',
    description: 'An intensive care physician and a paramedic on every flight.',
  },
  { title: 'Bed to bed', description: 'The ambulance at both ends is part of the booking.' },
  {
    title: 'Any airport that will take us',
    description: 'Landing permits arranged inside the hour where the state allows it.',
  },
]

/**
 * Five aircraft, which is more than the three a wide screen shows at once, so the carousel has
 * somewhere to go. The first registration is spelled the way a legacy row spells it, in lower
 * case and with a dash, to show that the link is the same either way.
 */
const VEHICLES = [
  {
    registration: 'n-123ab',
    model: 'Gulfstream G650ER',
    specs: [
      { label: 'Year:', value: '2019' },
      { label: 'Pax:', value: '14' },
    ],
  },
  {
    registration: 'M-YACHT',
    model: 'Bombardier Global 7500',
    specs: [
      { label: 'Year:', value: '2021' },
      { label: 'Pax:', value: '17' },
    ],
  },
  {
    registration: 'D-AHOP',
    model: 'Cessna Citation XLS+',
    specs: [
      { label: 'Year:', value: '2017' },
      { label: 'Pax:', value: '9' },
    ],
  },
  {
    registration: 'OE-LFA',
    model: 'Dassault Falcon 8X',
    specs: [
      { label: 'Year:', value: '2020' },
      { label: 'Pax:', value: '12' },
    ],
  },
  {
    registration: 'VP-BDX',
    model: 'Embraer Legacy 650',
    // The row keeps its rule where the legacy column holds nothing.
    specs: [
      { label: 'Year:', value: '2014' },
      { label: 'Pax:', value: '' },
    ],
  },
]

/** The seed ships two placeholder uploads, so a longer strip is made by going round them. */
const repeat = <T,>(items: readonly T[], count: number): T[] =>
  Array.from({ length: count }, (_, index) => items[index % items.length]!)

/** Every ported icon (issue #109), in the order `src/components/icons/index.ts` exports them. */
const ICONS = Object.entries(icons)

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className="w-32 gap-1">
      <span className={`h-10 w-full border border-graphite-700 ${className}`} />
      <span className="text-graphite-400">{label}</span>
    </div>
  )
}

export default async function StyleguidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  // The switcher offers the languages the settings enable, which is what the chrome will pass it.
  const t = await getTranslations({ locale, namespace: 'common' })
  const [locales, uploads] = await Promise.all([
    getEnabledLocales(),
    // The gallery needs real files; the seed's placeholders stand in until the media migration
    // brings the aircraft photos over (issue #84).
    listMediaImages(locale as Locale, 4),
  ])

  /** One photo, four and a strip that has to scroll: the three cases the gallery is drawn for. */
  const galleries = uploads.length === 0 ? [] : [1, 4, 12].map((count) => repeat(uploads, count))

  return (
    <div className="gap-16 py-16">
      <section id="typography" className="container items-start gap-4">
        <h1>Heading one</h1>
        <h2>Heading two</h2>
        <h3>Heading three</h3>
        <h4>Heading four</h4>
        <p>
          Body copy at the base size and colour, with an <a href="#typography">inline link</a> in
          it.
        </p>
        <hr className="w-full" />
      </section>

      <section id="buttons" className="container items-start gap-4">
        <h3>Buttons</h3>
        <div className="flex-row items-center gap-4">
          <Button>Default</Button>
          <Button size="big">Big</Button>
          <Button size="middle">Middle</Button>
          <Button size="middle" tone="dark">
            Middle dark
          </Button>
          <span className={buttonVariants()}>Span as button</span>
        </div>
        <div className="flex-row items-center gap-4">
          <Button tone="gold">Gold</Button>
          <span className="bg-gold bg-clip-text text-transparent">Gold text</span>
        </div>
      </section>

      <section id="inputs" className="container items-start gap-4">
        <h3>Inputs</h3>
        <div className="w-full max-w-screen-sm gap-4">
          <input aria-label="Default input" placeholder="Default input" />
          <input aria-label="Dark input" className="dark" placeholder="Dark input" />
        </div>
      </section>

      <section id="fields" data-section="fields" className="container items-start gap-4">
        <h3>Fields</h3>
        <div className="w-full max-w-screen-sm gap-4">
          <Input id="field-from" label="From" placeholder="City or airport" />
          <Select id="field-sort" label="Sort by" defaultValue="size">
            <option value="size">Size</option>
            <option value="passengers">Passengers</option>
            <option value="range">Range</option>
          </Select>
          <div className="flex-row items-center gap-4">
            <Checkbox id="field-consent" defaultChecked />
            <label htmlFor="field-consent">Checked</label>
            <Checkbox id="field-optional" />
            <label htmlFor="field-optional">Unchecked</label>
          </div>
          <CounterInput id="field-passengers" label="Passengers" wrapperClassName="self-start" />
        </div>
      </section>

      <section id="surfaces" className="container items-start gap-4">
        <h3>Surfaces</h3>
        <div className="card w-full gap-2 p-6">
          <h4>Card</h4>
          <p>A card is a 3xl radius and a graphite-700 border.</p>
        </div>
        <div className="flex-row gap-4">
          <span className="darkening h-24 w-40" />
          <span className="hero-darkening h-24 w-40" />
          <span className="option-darkening h-24 w-40" />
        </div>
        <div className="flex-row gap-4">
          {RADII.map((radius) => (
            <span key={radius} className={`size-16 bg-graphite-850 ${radius}`} />
          ))}
        </div>
      </section>

      <section id="motion" className="container items-start gap-4">
        <h3>Motion</h3>
        <p>
          The vocabulary in <code>src/lib/motion.ts</code> carries the legacy timings; these are the
          primitives built on it. With reduced motion they render in their final state.
        </p>
        <Line once className="w-full" />
        <div className="flex-row items-baseline gap-8">
          <Counter className="font-serif text-4xl text-white">20+</Counter>
          <Counter className="font-serif text-4xl text-white">1,000 flights</Counter>
        </div>
        <Reveal once className="card w-full gap-2 p-6">
          <h4>Revealed on scroll</h4>
          <p>Fades and rises into place when it enters the viewport, and again when it returns.</p>
        </Reveal>
      </section>

      {/* The legacy section sat on the darker surface, which is what the card is read against. */}
      <section id="empty-legs" data-section="empty-legs" className="w-full bg-graphite-950 py-10">
        <div className="container items-start gap-4">
          <h3>Empty legs</h3>
          <div className="w-full max-w-screen-sm gap-4">
            {EMPTY_LEGS.map((leg) => (
              <EmptyLegCard
                key={leg.from.icao}
                {...leg}
                booking={{ label: 'Make a booking', href: '?showBooking=Empty-legs' }}
                noPriceLabel={t('notAvailable')}
              />
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" data-section="gallery" className="container items-start gap-4">
        <h3>Gallery</h3>
        {galleries.length === 0 ? (
          <p>No uploads to show. Run the seed.</p>
        ) : (
          <div className="w-full gap-10 md:flex-row">
            {galleries.map((images) => (
              <div key={images.length} data-gallery={images.length} className="w-full max-w-xs">
                <Gallery images={images} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="carousel" data-section="carousel" className="container items-start gap-4">
        <h3>Carousel</h3>
        <Carousel
          className="w-full"
          containerClassName="gap-4"
          controls={
            <>
              <CarouselArrows
                className="justify-end pt-4"
                labels={{ previous: 'Previous slide', next: 'Next slide' }}
              />
              <CarouselDots className="pt-4" label="Slides" />
              <CarouselProgress className="mt-4" />
            </>
          }
        >
          {SLIDES.map((slide) => (
            <div
              key={slide}
              className="h-32 w-2/3 shrink-0 items-center justify-center bg-graphite-850 md:w-1/3"
            >
              <span className="font-serif text-2xl text-white">{slide}</span>
            </div>
          ))}
        </Carousel>
      </section>

      <section id="icons" className="container items-start gap-4">
        <h3>Icons</h3>
        <div className="flex-row flex-wrap items-start gap-6 text-white">
          {ICONS.map(([name, Icon]) => (
            <div key={name} className="w-32 items-center gap-2">
              <Icon className="h-8 w-auto" />
              <span className="text-center text-graphite-400">{name}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="accordion" data-section="accordion" className="container items-start gap-4">
        <h3>Accordion</h3>
        <Accordion className="w-full max-w-screen-sm" defaultValue="first">
          <AccordionItem title="The first question" value="first">
            <p>The answer to the first question, which is open when the page arrives.</p>
          </AccordionItem>
          <AccordionItem title="The second question" value="second">
            <p>Opening this one closes the other: one answer shows at a time.</p>
          </AccordionItem>
        </Accordion>
      </section>

      <section
        id="locale-switch"
        data-section="locale-switch"
        className="container items-start gap-4"
      >
        <h3>Language</h3>
        <LocaleSwitch locales={locales} />
      </section>

      <section id="palette" className="container items-start gap-4">
        <h3>Palette</h3>
        <div className="flex-row flex-wrap gap-4">
          {GRAPHITE.map((colour) => (
            <Swatch
              key={colour.token}
              className={colour.className}
              label={`${colour.token} (${colour.legacy})`}
            />
          ))}
        </div>
        <div className="flex-row flex-wrap gap-4">
          {ACCENTS.map((colour) => (
            <Swatch key={colour.token} className={colour.className} label={colour.token} />
          ))}
        </div>
      </section>

      <section id="cards" data-section="cards" className="container items-start gap-4">
        <h3>Cards</h3>
        {uploads.length === 0 ? (
          <p>No uploads to show. Run the seed.</p>
        ) : (
          <div className="w-full gap-10">
            {/* `/atm_jet_group` stacks the group cards in one rounded box, with a rule between. */}
            <div className="overflow-hidden rounded-2xl" data-cards="group">
              {GROUP_CARDS.map((card, index) => (
                <React.Fragment key={card.action.href}>
                  {index > 0 && <hr />}
                  {/* Every card takes the same upload: the seed's other placeholder is the
                      colour of the page, so a card drawn on it would show nothing. */}
                  <GroupCard {...card} image={uploads[0]!} />
                </React.Fragment>
              ))}
            </div>
            <div className="gap-6 md:flex-row" data-cards="file">
              {FILE_CARDS.map((card) => (
                <FileCard key={card.file.href} {...card} image={uploads[0]!} />
              ))}
            </div>
            {/* The privileges section gives the stack a clipped box to slide inside. */}
            <div className="overflow-clip rounded-2xl" data-cards="privilege">
              {PRIVILEGES.map(({ Icon, title, description }, index) => (
                <PrivilegeCard
                  key={title}
                  description={description}
                  icon={<Icon className="size-11 shrink-0" />}
                  title={title}
                  // Each card stops a little further down than the one above it.
                  top={(index + 1) * 32}
                />
              ))}
            </div>
            <div data-cards="yachts">
              <YachtsCard
                columns={YACHT_COLUMNS}
                image={uploads[0]!}
                invitation={{
                  image: uploads[0]!,
                  title: 'A yacht for the week after the flight',
                  action: { label: 'See the yachts', href: 'yachts' },
                }}
              />
            </div>
          </div>
        )}
      </section>

      <section id="why-us" data-section="why-us" className="container items-start gap-4">
        <h3>Why us</h3>
        {/* The sections give the stack a clipped box to slide inside. */}
        <div className="relative w-full self-stretch overflow-clip rounded-2xl" data-cards="why-us">
          {WHY_US.map(({ withImage, ...card }, index) => (
            <WhyUsCard
              key={card.title}
              {...card}
              image={withImage ? uploads[0] : undefined}
              // Each card stops a little further down than the one above it.
              top={(index + 1) * 32}
            />
          ))}
        </div>
      </section>

      <section
        id="carousel-cards"
        data-section="carousel-cards"
        className="container items-start gap-4"
      >
        <h3>Cards in a carousel</h3>
        {uploads.length === 0 ? (
          <p>No uploads to show. Run the seed.</p>
        ) : (
          <div className="w-full gap-10">
            <div data-cards="key-feature">
              {/* No gap between the slides: the legacy carousel had none, and the card's own
                  `pr-10` is what holds its words off the next one. */}
              <Carousel
                className="w-full"
                controls={
                  <CarouselArrows
                    className="justify-end pt-4"
                    labels={{ previous: 'Previous feature', next: 'Next feature' }}
                  />
                }
              >
                {KEY_FEATURES.map((feature) => (
                  <KeyFeatureCard key={feature.title} {...feature} image={uploads[0]!} />
                ))}
              </Carousel>
            </div>
            <div data-cards="vehicle">
              <Carousel
                className="w-full"
                controls={
                  <CarouselArrows
                    className="justify-end pt-4"
                    labels={{ previous: 'Previous aircraft', next: 'Next aircraft' }}
                  />
                }
              >
                {VEHICLES.map((vehicle) => (
                  <VehicleCard key={vehicle.registration} {...vehicle} image={uploads[0]!} />
                ))}
              </Carousel>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
