import { describe, expect, it } from 'vitest'
import {
  bundleAvailable,
  findLegacyEntry,
  legacyId,
  loadLegacyManifest,
  type LegacyManifest,
} from '../visual/legacy/bundle'

const manifest: LegacyManifest = {
  capturedAt: '2026-09-12T00:00:00.000Z',
  baseUrl: 'https://legacy.example',
  legacyCommit: '8b8f375892e030f570cbe9f500f208df589e8976',
  entries: [
    {
      id: 'home--en--desktop--default',
      route: '/',
      locale: 'en',
      viewport: 'desktop',
      state: 'default',
      url: '',
      kind: 'full-page',
      file: 'pages/home--en--desktop--default.png',
      status: 'captured',
    },
    {
      id: 'home--en--desktop--default',
      route: '/',
      locale: 'en',
      viewport: 'desktop',
      state: 'default',
      url: '',
      kind: 'section',
      sectionIndex: 2,
      label: 'FAQ',
      file: 'sections/home--en--desktop--default--02.png',
      status: 'captured',
    },
    {
      id: 'home--en--desktop--default',
      route: '/',
      locale: 'en',
      viewport: 'desktop',
      state: 'default',
      url: '',
      kind: 'section',
      sectionIndex: 3,
      status: 'failed',
      error: 'timeout',
    },
    {
      id: 'home--en--desktop--dialog--header',
      route: '/',
      locale: 'en',
      viewport: 'desktop',
      state: 'dialog',
      param: 'Header',
      url: '',
      kind: 'viewport',
      file: 'states/home--en--desktop--dialog--header.png',
      status: 'captured',
    },
    {
      id: 'home--en--desktop--faq-open',
      route: '/',
      locale: 'en',
      viewport: 'desktop',
      state: 'faq-open',
      url: '',
      kind: 'section',
      file: 'states/home--en--desktop--faq-open.png',
      status: 'captured',
    },
  ],
}

describe('legacy bundle', () => {
  it('builds ids the way the capture matrix does', () => {
    expect(legacyId('/', 'en', 'desktop')).toBe('home--en--desktop--default')
    expect(legacyId('/', 'ru', 'mobile', 'dialog', 'Empty-legs')).toBe(
      'home--ru--mobile--dialog--empty-legs',
    )
    expect(legacyId('/yachts/Blue-Star', 'en', 'mobile')).toBe(
      'yachts_blue_star--en--mobile--default',
    )
  })

  it('finds page captures, section clips and state captures, ignoring failed entries', () => {
    expect(findLegacyEntry(manifest, { id: 'home--en--desktop--default' })?.kind).toBe('full-page')
    expect(findLegacyEntry(manifest, { id: 'home--en--desktop--default', section: 2 })?.label).toBe(
      'FAQ',
    )
    expect(
      findLegacyEntry(manifest, { id: 'home--en--desktop--default', section: 3 }),
    ).toBeUndefined()
    expect(findLegacyEntry(manifest, { id: 'home--en--desktop--dialog--header' })?.kind).toBe(
      'viewport',
    )
    expect(findLegacyEntry(manifest, { id: 'home--en--desktop--faq-open' })?.file).toBe(
      'states/home--en--desktop--faq-open.png',
    )
    expect(findLegacyEntry(manifest, { id: 'missing' })).toBeUndefined()
  })

  it('reports the bundle as unavailable without the files', () => {
    expect(bundleAvailable('/nonexistent/manifest.json', '/nonexistent/bundle')).toBe(false)
    expect(loadLegacyManifest('/nonexistent/manifest.json')).toBeNull()
  })
})
