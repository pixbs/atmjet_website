import { db, vehicles } from '@/lib/drizzle'
import { eq, not } from 'drizzle-orm'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseURL =
		process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL || 'localhost:3000'
	const aircrafts = await db
		.select()
		.from(vehicles)
		.where(not(eq(vehicles.tailNumber, '')))
	return aircrafts.map((vehicle) => ({
		url: `https://${baseURL}/aircrafts/${vehicle.tailNumber}`,
		lastModified: new Date().toISOString(),
		changeFrequency: 'daily',
		priority: 0.5,
		alternates: {
			languages: {
				ru: `https://${baseURL}/ru/aircrafts/${vehicle.tailNumber}`,
				en: `https://${baseURL}/en/aircrafts/${vehicle.tailNumber}`,
			},
		},
	}))
}
