import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Schema changes go through committed migrations only (never drizzle push),
    // so no environment can be altered implicitly. See docs/adr/0002.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  // en/ru are public; uk is entered in the admin but stays hidden from routing
  // until its catalog is complete (SiteSettings.enabledLocales). See docs/adr/0003.
  localization: {
    locales: [
      { code: 'en', label: 'English' },
      { code: 'ru', label: 'Русский' },
      { code: 'uk', label: 'Українська' },
    ],
    defaultLocale: 'en',
    fallback: true,
  },
  sharp,
  plugins: [],
})
