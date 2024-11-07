import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	const baseURL =
		process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost:3000'
	const url = [
		'/',
		'/aircrafts',
		'/atm_jet_group',
		'/business_agents',
		'/cargo_charter',
		'/citezens',
		'/empty_legs',
		'/group_charters',
		'/medical_aviation',
		'/partners',
		'/sales_dept',
		'/yachts',
	]
	return url.map((path) => ({
		url: `https://${baseURL}${path}`,
		lastModified: new Date().toISOString(),
		changeFrequency: 'daily',
		priority: 0.8,
		alternates: {
			languages: {
				ru: `https://${baseURL}/ru${path}`,
				en: `https://${baseURL}/en${path}`,
			},
		},
	}))
}
