import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
import { DEFAULT_LOCALE, LOCALE_DEFINITIONS } from './i18n/locales'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Where this deployment answers. CORS and CSRF are pinned to it so a page on another origin
 * cannot read the API or ride a logged-in editor's cookie (issue #70).
 */
const serverURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
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
  collections: [Users, Media, Pages, Airports, Aircraft, Contacts],
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
  ],
})
