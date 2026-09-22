import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { s3Storage } from '@payloadcms/storage-s3'
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
import { sendTelegramLead } from './jobs/send-telegram-lead'
import { redirectsOverrides, REDIRECT_TYPES } from './collections/Redirects'
import { Header } from './globals/Header'
import { Footer } from './globals/Footer'
import { SiteSettings } from './globals/SiteSettings'
import { hasRole } from './access'
import { DEFAULT_LOCALE, LOCALE_DEFINITIONS } from './i18n/locales'
import { readEnvironment } from './lib/env'
import { mediaFileUrl, MEDIA_PREFIX, readS3Settings } from './lib/storage'
import { siteOrigin } from './lib/urls'

/**
 * The media bucket, or `null` where the environment names none (issue #20). Read once here
 * rather than per upload, so a half-written group fails when the config loads.
 */
const s3 = readS3Settings()
const publicUrl = s3?.publicUrl

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

/**
 * Read once, here, so a deployment missing one of them says which (issue #19). The adapter and
 * the signing key were handed `|| ''` before, and the failure arrived later as a connection
 * error or an unsigned cookie, naming neither variable.
 */
const env = readEnvironment()

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
  /**
   * The queue a lead's delivery runs on (issue #155). `autoRun` is deliberately not set: it is a
   * timer inside the server, and this one is serverless, so the queue is drained by the cron in
   * `vercel.json` calling `/api/payload-jobs/run`.
   *
   * Vercel signs that call with `CRON_SECRET`; an administrator signed into the admin may drain
   * it by hand as well, and nobody else can.
   */
  jobs: {
    tasks: [sendTelegramLead],
    access: {
      run: ({ req }) => {
        const secret = process.env.CRON_SECRET

        if (secret && req.headers.get('authorization') === `Bearer ${secret}`) return true

        return hasRole(req.user, 'admin')
      },
    },
  },
  secret: env.PAYLOAD_SECRET,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: env.DATABASE_URL,
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
    // Uploads go to the bucket where the environment names one and to Payload's own disk
    // storage where it does not, which is local development and every test run (issue #20).
    // The fields go in either way, so one set of migrations describes both.
    s3Storage({
      enabled: s3 !== null,
      alwaysInsertFields: true,
      bucket: s3?.bucket ?? '',
      config: {
        region: s3?.region ?? '',
        credentials: {
          accessKeyId: s3?.accessKeyId ?? '',
          secretAccessKey: s3?.secretAccessKey ?? '',
        },
        // Only an S3-compatible host needs one; AWS builds its own from the region.
        ...(s3?.endpoint === undefined ? {} : { endpoint: s3.endpoint }),
      },
      collections: {
        media: {
          prefix: MEDIA_PREFIX,
          ...(publicUrl === undefined
            ? {}
            : {
                generateFileURL: ({ filename, prefix }) =>
                  mediaFileUrl(publicUrl, filename, prefix),
              }),
        },
      },
    }),
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
