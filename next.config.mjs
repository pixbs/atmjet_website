import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

const nextConfig = {
	webpack(config) {
		// Grab the existing rule that handles SVG imports
		const fileLoaderRule = config.module.rules.find((rule) => rule.test?.test?.('.svg'))

		config.module.rules.push(
			// Reapply the existing rule, but only for svg imports ending in ?url
			{
				...fileLoaderRule,
				test: /\.svg$/i,
				resourceQuery: /url/, // *.svg?url
			},
			// Convert all other *.svg imports to React components
			{
				test: /\.svg$/i,
				issuer: fileLoaderRule.issuer,
				resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
				use: ['@svgr/webpack'],
			},
		)

		// Modify the file loader rule to ignore *.svg, since we have it handled now.
		fileLoaderRule.exclude = /\.svg$/i

		return config
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'atmjet.ams3.cdn.digitaloceanspaces.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'atmjet.s3.eu-north-1.amazonaws.com',
				port: '',
				pathname: '/**',
			},
		],
	},
	async redirects() {
		return [
			{
				source: '/:slug/jets',
				destination: '/',
				permanent: true,
			},
			{
				source: '/:slug/planes',
				destination: '/:slug/aircraft',
				permanent: true,
			},
			{
				source: '/:slug/planes/:id',
				destination: '/:slug/aircraft/:id',
				permanent: true,
			},
			{
				source: '/:slug/aircrafts',
				destination: '/:slug/aircraft',
				permanent: true,
			},
			{
				source: '/:slug/aircrafts/:id',
				destination: '/:slug/aircraft/:id',
				permanent: true,
			},
		]
	},
}

export default withNextIntl(nextConfig)
