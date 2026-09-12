import { describe, expect, it } from 'vitest'
import {
  SHOW_BOOKING_SOURCES,
  STATIC_ROUTES,
  VIEWPORTS,
  buildMatrix,
  buildUrl,
  routeSlug,
} from '../../scripts/baselines/matrix'

const baseUrl = 'https://legacy.example'

describe('legacy baseline matrix', () => {
  it('records every route for both locales and viewports, the ru-only route once per viewport', () => {
    const defaults = buildMatrix({ baseUrl }).filter((job) => job.state === 'default')
    expect(defaults).toHaveLength((STATIC_ROUTES.length * 2 - 1) * VIEWPORTS.length)
    expect(
      defaults.filter((job) => job.route === '/citizens').every((job) => job.locale === 'ru'),
    ).toBe(true)
  })

  it('gives every job a unique id', () => {
    const ids = buildMatrix({ baseUrl }).map((job) => job.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('records one dialog state per showBooking source on the home page', () => {
    const dialogs = buildMatrix({ baseUrl }).filter((job) => job.state === 'dialog')
    expect(dialogs).toHaveLength(SHOW_BOOKING_SOURCES.length * 2 * VIEWPORTS.length)
    expect(dialogs[0].url).toBe(`${baseUrl}/en?showBooking=Header`)
    expect(dialogs.every((job) => job.kind === 'viewport')).toBe(true)
  })

  it('presets the consent cookie for every state except the banner capture', () => {
    const jobs = buildMatrix({ baseUrl })
    expect(jobs.filter((job) => !job.consentCookie).map((job) => job.state)).toEqual([
      'cookie-banner',
      'cookie-banner',
      'cookie-banner',
      'cookie-banner',
    ])
  })

  it('adds detail routes and honours the route, locale and state filters', () => {
    const jobs = buildMatrix({
      baseUrl,
      routes: ['/', '/aircraft'],
      detailRoutes: ['/aircraft/G-ABCD-1'],
      locales: ['en'],
      states: ['default', 'menu-open'],
      viewports: [VIEWPORTS[1]],
    })
    expect(jobs.map((job) => job.id)).toEqual([
      'home--en--desktop--default',
      'aircraft--en--desktop--default',
      'aircraft_g_abcd_1--en--desktop--default',
      'home--en--desktop--menu-open',
    ])
  })

  it('skips the home states when the home route is not in the matrix', () => {
    const jobs = buildMatrix({ baseUrl, routes: ['/partners'], locales: ['en'] })
    expect(jobs.every((job) => job.state === 'default')).toBe(true)
  })

  it('builds urls with the locale prefix by default and without it on request', () => {
    expect(buildUrl(`${baseUrl}/`, 'ru', '/')).toBe(`${baseUrl}/ru`)
    expect(buildUrl(baseUrl, 'ru', '/yachts', true, 'lenght=60')).toBe(
      `${baseUrl}/ru/yachts?lenght=60`,
    )
    expect(buildUrl(baseUrl, 'en', '/', false)).toBe(`${baseUrl}/`)
    expect(buildUrl(baseUrl, 'en', '/aircraft', false)).toBe(`${baseUrl}/aircraft`)
  })

  it('slugifies routes for file names', () => {
    expect(routeSlug('/')).toBe('home')
    expect(routeSlug('/atm_jet_group')).toBe('atm_jet_group')
    expect(routeSlug('/yachts/Blue-Star-2024')).toBe('yachts_blue_star_2024')
  })
})
