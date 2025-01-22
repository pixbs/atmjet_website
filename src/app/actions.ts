'use server'

import { db, newAirports, vehicles } from '@/lib/drizzle'
import { eq, ilike, not, or } from 'drizzle-orm'

// Cache configuration
const searchCache = new Map()
const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

// Helper function to format results
const formatResults = (query: (typeof newAirports.$inferSelect)[], str: string, locale: string) => {
	if (query.length === 0) return [str]

	return [
		str,
		...query.map((item) =>
			locale === 'ru'
				? `${item.cityRu || item.cityEn || ''} ( ${item.icao || item.iata || ''} ) ${
						item.countryRu || item.countryEn || ''
					}, ${item.labelRu || item.labelEn || ''}`
				: `${item.cityEn || ''} ( ${item.icao || item.iata} ) ${item.countryEn || ''}, ${
						item.labelEn || ''
					}`,
		),
	]
}

export async function getAirport(str: string, locale: string) {
	let query: (typeof newAirports.$inferSelect)[]
	if (locale === 'ru') {
		str = toTitleCase(str)
		query = await db
			.select()
			.from(newAirports)
			.where(
				or(
					ilike(newAirports.cityRu, `%${str}%`),
					ilike(newAirports.labelRu, `%${str}%`),
					ilike(newAirports.countryRu, `%${str}%`),
					ilike(newAirports.iata, `%${str}%`),
					ilike(newAirports.icao, `%${str}%`),
				),
			)
			.limit(20)
		if (query.length === 0) {
			return [str]
		}
		return [
			toTitleCase(str),
			...query.map(
				(item) =>
					`${item.cityRu || item.cityEn || ''} ( ${item.icao || item.iata || ''} ) ${item.countryRu || item.countryEn || ''}, ${item.labelRu || item.labelEn || ''}`,
			),
		]
	} else {
		query = await db
			.select()
			.from(newAirports)
			.where(
				or(
					ilike(newAirports.cityEn, `%${str}%`),
					ilike(newAirports.labelEn, `%${str}%`),
					ilike(newAirports.countryEn, `%${str}%`),
					ilike(newAirports.iata, `%${str}%`),
					ilike(newAirports.icao, `%${str}%`),
				),
			)
			.limit(20)

		if (str.toLowerCase().includes('st')) {
			const new_str = str.toLowerCase().replace('st', 'saint')
			const st_query = await db
				.select()
				.from(newAirports)
				.where(
					or(
						ilike(newAirports.cityEn, `%${new_str}%`),
						ilike(newAirports.labelEn, `%${new_str}%`),
						ilike(newAirports.countryEn, `%${new_str}%`),
						ilike(newAirports.iata, `%${new_str}%`),
						ilike(newAirports.icao, `%${new_str}%`),
					),
				)
				.limit(20)
			query = [...query, ...st_query]
		}

		return [
			str,
			...query.map(
				(item) =>
					`${item.cityEn || ''} ( ${item.icao || item.iata} ) ${item.countryEn || ''}, ${item.labelEn || ''}`,
			),
		]
	}
}

export async function getAircrafts(offset: number) {
	'use server'
	const aircrafts =
		(await db
			.select()
			.from(vehicles)
			.where(not(eq(vehicles.tailNumber, '')))
			.offset(offset)
			.limit(15)
			.catch(() => [])) || []

	return aircrafts
}

function toTitleCase(s: string) {
	return s.replace(/([^\s:\-])([^\s:\-]*)/g, function ($0, $1, $2) {
		return $1.toUpperCase() + $2.toLowerCase()
	})
}
