'use server'

import { airports, db, vehicles } from '@/lib/drizzle'
import { eq, ilike, not, or } from 'drizzle-orm'

export async function getAirport(str: string, locale: string) {
	if (str.toLowerCase().includes('saint')) {
		str = str.toLowerCase().replace('saint', 'st')
	}

	// TODO: remove this when we have a better solution
	if (str.toLowerCase().includes('bilb') || str.toLowerCase().includes('биль')) {
		str = 'BIO'
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
