/**
 * Capture matrix for the legacy visual baselines (issue #37, ADR-0004).
 * Pure data: which pages, locales, viewports and states are recorded from the legacy site.
 */
export type ViewportName = 'mobile' | 'desktop'

export interface Viewport {
  name: ViewportName
  width: number
  height: number
}

export type StateName =
  'default' | 'cookie-banner' | 'menu-open' | 'dialog' | 'round-trip' | 'faq-open'

export type CaptureKind = 'full-page' | 'viewport' | 'section'

export interface Job {
  id: string
  route: string
  locale: string
  viewport: Viewport
  state: StateName
  /** `showBooking` source for dialog jobs */
  param?: string
  url: string
  /** what the job records; full-page jobs also record one clip per top-level section */
  kind: CaptureKind
  /** whether the legacy consent cookie is preset so the banner stays hidden */
  consentCookie: boolean
}

export const LOCALES = ['en', 'ru'] as const

export const VIEWPORTS: Viewport[] = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 900 },
]

/** The static routes of docs/legacy-inventory.md section 2.1 (locale prefix added by the URL builder). */
export const STATIC_ROUTES = [
  '/',
  '/aircraft',
  '/atm_jet_group',
  '/business_agents',
  '/cargo_charter',
  '/citizens',
  '/empty_legs',
  '/group_charters',
  '/medical_aviation',
  '/partners',
  '/sales_dept',
  '/sales_yachts',
  '/yachts',
]

/** Routes the legacy site serves for `ru` only (others redirect to the home page). */
export const RU_ONLY_ROUTES = ['/citizens']

/** The live `?showBooking=` sources of docs/legacy-inventory.md section 7.5. */
export const SHOW_BOOKING_SOURCES = [
  'Header',
  'Footer',
  'Angle_bar',
  'Hero_sales',
  'Hero_yachts',
  'Best_price',
  'Empty-legs',
  'Flight_request',
  'Contact_us_aircraft',
  'Yachts',
]

export const STATES: StateName[] = [
  'default',
  'cookie-banner',
  'menu-open',
  'dialog',
  'round-trip',
  'faq-open',
]

export interface MatrixOptions {
  baseUrl: string
  locales?: readonly string[]
  viewports?: Viewport[]
  routes?: string[]
  detailRoutes?: string[]
  states?: StateName[]
  /** prefix every path with the locale (the legacy routing); off for smoke tests against a site without locales */
  localePrefix?: boolean
}

export function routeSlug(route: string): string {
  if (route === '/') return 'home'
  return route
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+$/, '')
    .toLowerCase()
}

export function buildUrl(
  baseUrl: string,
  locale: string,
  route: string,
  localePrefix = true,
  query?: string,
): string {
  const base = baseUrl.replace(/\/+$/, '')
  const path = `${localePrefix ? `/${locale}` : ''}${route === '/' ? '' : route}` || '/'
  return `${base}${path}${query ? `?${query}` : ''}`
}

function paramSlug(param: string): string {
  return param.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export function buildMatrix(options: MatrixOptions): Job[] {
  const locales = options.locales ?? LOCALES
  const viewports = options.viewports ?? VIEWPORTS
  const routes = [...(options.routes ?? STATIC_ROUTES), ...(options.detailRoutes ?? [])]
  const states = options.states ?? STATES
  const localePrefix = options.localePrefix ?? true
  const jobs: Job[] = []

  for (const locale of locales) {
    for (const viewport of viewports) {
      for (const route of routes) {
        if (RU_ONLY_ROUTES.includes(route) && locale !== 'ru') continue
        jobs.push({
          id: `${routeSlug(route)}--${locale}--${viewport.name}--default`,
          route,
          locale,
          viewport,
          state: 'default',
          url: buildUrl(options.baseUrl, locale, route, localePrefix),
          kind: 'full-page',
          consentCookie: true,
        })
      }

      if (!routes.includes('/')) continue
      for (const state of states) {
        if (state === 'default') continue
        if (state === 'dialog') {
          for (const param of SHOW_BOOKING_SOURCES) {
            jobs.push({
              id: `home--${locale}--${viewport.name}--dialog--${paramSlug(param)}`,
              route: '/',
              locale,
              viewport,
              state,
              param,
              url: buildUrl(
                options.baseUrl,
                locale,
                '/',
                localePrefix,
                `showBooking=${encodeURIComponent(param)}`,
              ),
              kind: 'viewport',
              consentCookie: true,
            })
          }
          continue
        }
        jobs.push({
          id: `home--${locale}--${viewport.name}--${state}`,
          route: '/',
          locale,
          viewport,
          state,
          url: buildUrl(options.baseUrl, locale, '/', localePrefix),
          kind: state === 'round-trip' || state === 'faq-open' ? 'section' : 'viewport',
          consentCookie: state !== 'cookie-banner',
        })
      }
    }
  }

  return jobs
}
