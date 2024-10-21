'use server'

import { db, newAirports, vehicles } from '@/lib/drizzle'
import { eq, ilike, not, or } from 'drizzle-orm'

// export async function getAirport(str: string, locale: string) {
// 	if (str.toLowerCase().includes('saint')) {
// 		str = str.toLowerCase().replace('saint', 'st')
// 	}

// 	// TODO: remove this when we have a better solution
// 	// if (str.toLowerCase().includes('bilb') || str.toLowerCase().includes('биль')) {
// 	// 	str = 'BIO'
// 	// }
// 	const query = await db
// 		.select()
// 		.from(airports)
// 		.where(
// 			or(
// 				ilike(airports.cityEng, `%${str}%`),
// 				ilike(airports.cityRus, `%${str}%`),
// 				ilike(airports.nameEng, `%${str}%`),
// 				ilike(airports.nameRus, `%${str}%`),
// 				ilike(airports.countryEng, `%${str}%`),
// 				ilike(airports.countryRus, `%${str}%`),
// 				ilike(airports.iataCode, `%${str}%`),
// 				ilike(airports.icaoCode, `%${str}%`),
// 			),
// 		)
// 		.limit(20)
// 	if (locale === 'ru' || locale === 'uk') {
// 		return query.map(
// 			(item) =>
// 				`${item.nameRus ? item.nameRus : item.nameEng} ( ${item.iataCode} ) ${item.countryRus}, ${item.cityRus}`,
// 		)
// 	} else {
// 		return query.map(
// 			(item) => `${item.nameEng} ( ${item.iataCode} ) ${item.countryEng}, ${item.cityEng}`,
// 		)
// 	}
// }

export async function getAirport(str: string, locale: string) {
	let query: (typeof newAirports.$inferSelect)[]
	if (locale === 'ru') {
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
			str,
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

export async function getAircraft(offset: number) {
	'use server'
	const aircraft = await db
		.select()
		.from(vehicles)
		.where(not(eq(vehicles.tailNumber, '')))
		.offset(offset)
		.limit(15)

	return aircraft
}
