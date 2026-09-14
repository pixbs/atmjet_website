import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'
import { uk } from '@payloadcms/translations/languages/uk'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Airports } from './collections/Airports'
import { Aircraft } from './collections/Aircraft'
import { Contacts } from './collections/Contacts'
import { Yachts } from './collections/Yachts'
import { EmptyLegs } from './collections/EmptyLegs'
import { Leads } from './collections/Leads'
import { redirectsOverrides, REDIRECT_TYPES } from './collections/Redirects'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { SiteSettings } from './globals/SiteSettings'
import { DEFAULT_LOCALE, LOCALE_DEFINITIONS } from './i18n/locales'
import { siteOrigin } from './lib/urls'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Where this deployment answers. CORS and CSRF are pinned to it so a page on another origin
 * cannot read the API or ride a logged-in editor's cookie (issue #70).
 *
 * Read through `siteOrigin` rather than straight from the environment (issue #265): deployments
 * hold a bare host in that variable, and Payload cannot make a URL of one — it logged and fell
 * back to `http://localhost`, which is where every live preview link pointed.
 */
const serverURL = siteOrigin()
const allowedOrigins = [serverURL]

export default buildConfig({
  serverURL,
  // Only this site may call the API from a browser, and only its forms may post to it.
  cors: allowedOrigins,
  csrf: allowedOrigins,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  // The admin interface itself speaks the same three languages as the content (issue #54).
  i18n: {
    supportedLanguages: { en, ru, uk },
  },
  collections: [Users, Media, Pages, Airports, Aircraft, Contacts, Yachts, EmptyLegs, Leads],
  // The chrome and the values every page links to (issue #61). One document each, so there is
  // nothing to list and nothing to publish.
  globals: [Header, Footer, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Drizzle push only under `next dev`, against the disposable local database;
    // CI, previews and production apply the committed migrations. See docs/adr/0008.
    push: process.env.NODE_ENV === 'development',
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  // Built from the one locale list the routing also reads (src/i18n/locales.ts), so the admin
  // selector and the public URLs can never drift apart. en/ru are public; uk is entered in the
  // admin but stays hidden from routing until its catalogue is complete
  // (SiteSettings.enabledLocales, issue #53). Fallback semantics: docs/adr/0003.
  localization: {
    locales: LOCALE_DEFINITIONS.map(({ code, label }) => ({ code, label })),
    defaultLocale: DEFAULT_LOCALE,
    fallback: true,
  },
  sharp,
  plugins: [
    // Localized meta fields per page; E11.1 refines what each route actually emits.
    seoPlugin({
      collections: ['pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => (doc as { title?: string }).title ?? '',
    }),
    // The old URLs that must keep resolving (issue #69). The legacy map lived in
    // next.config.mjs, so changing it meant a deploy; E11.3 decides the final list.
    redirectsPlugin({
      collections: ['pages'],
      redirectTypes: [...REDIRECT_TYPES],
      redirectTypeFieldOverride: {
        defaultValue: '308',
        required: false,
        admin: {
          position: 'sidebar',
          description:
            'The legacy redirects were all 308. A server component can only emit 307 or 308, so 301 is served as 308 and 302 or 303 as 307.',
        },
      },
      overrides: redirectsOverrides,
    }),
  ],
})
