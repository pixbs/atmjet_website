'use server'

import { airports, db } from '@/lib/drizzle'
import { ilike, or } from 'drizzle-orm'

export async function getAirport(str: string, locale: string) {
	if (str.toLowerCase().includes('saint')) {
		str = str.toLowerCase().replace('saint', 'st')
	}
	const query = await db
		.select()
		.from(airports)
		.where(
			or(
				ilike(airports.cityEng, `%${str}%`),
				ilike(airports.cityRus, `%${str}%`),
				ilike(airports.countryEng, `%${str}%`),
				ilike(airports.countryRus, `%${str}%`),
				ilike(airports.nameEng, `%${str}%`),
				ilike(airports.nameRus, `%${str}%`),
				ilike(airports.iataCode, `%${str}%`),
				ilike(airports.icaoCode, `%${str}%`),
			),
		)
		.limit(10)

	if (locale === 'ru' || locale === 'uk') {
		return query.map(
			(item) =>
				`${item.nameRus ? item.nameRus : item.nameEng} ( ${item.iataCode} ) ${item.countryRus}, ${item.cityRus}`,
		)
	} else {
		return query.map(
			(item) => `${item.nameEng} ( ${item.iataCode} ) ${item.countryEng}, ${item.cityEng}`,
		)
	}
}
