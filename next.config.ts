import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

/**
 * The hosts `next/image` may fetch from. `mediaSource` hands `Media.externalUrl` straight to it
 * (`src/lib/media.ts`), and the legacy config named these same two
 * (`docs/legacy-inventory.md` section 2.1): the bucket the uploads go to (issue #20) and the
 * Spaces host that E1.6 has yet to mirror.
 */
const REMOTE_IMAGE_HOSTS = [
  'atmjet.s3.eu-north-1.amazonaws.com',
  'atmjet.ams3.cdn.digitaloceanspaces.com',
]

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
    remotePatterns: REMOTE_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https' as const,
      hostname,
      pathname: '/**',
    })),
  },
  /**
   * The videos are served from `public/` rather than a bucket (the decision on issue #175),
   * where Next's default `max-age=0` sends the player back to the server on every visit before
   * it may reuse the sixteen megabytes it already holds; the path names one file for good,
   * since replacing the video means a new name in the block's `video` field.
   */
  async headers() {
    return [
      {
        source: '/video/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

/** Points next-intl at src/i18n/request.ts, which resolves the locale and loads its messages. */
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withNextIntl(withPayload(nextConfig, { devBundleServerPackages: false }))
