'use server'

import { db, newAirports } from '@/lib/drizzle'
import { ilike, or } from 'drizzle-orm'

export default async function getAirport(str: string, locale: string) {
	const startTime = performance.now()

	// Early return if search string is too short
	if (!str || str.length < 2) return [str]

	try {
		const searchTerm = `%${toTitleCase(str.trim())}%`

		let query = await db
			.select({
				id: newAirports.id,
				cityEn: newAirports.cityEn,
				cityRu: newAirports.cityRu,
				labelEn: newAirports.labelEn,
				labelRu: newAirports.labelRu,
				countryEn: newAirports.countryEn,
				countryRu: newAirports.countryRu,
				iata: newAirports.iata,
				icao: newAirports.icao,
				passengers: newAirports.passengers,
			})
			.from(newAirports)
			.where(
				or(
					ilike(newAirports.cityEn, searchTerm),
					ilike(newAirports.cityRu, searchTerm),
					ilike(newAirports.labelEn, searchTerm),
					ilike(newAirports.labelRu, searchTerm),
					ilike(newAirports.aliesEn, searchTerm),
					ilike(newAirports.aliesRu, searchTerm),
					ilike(newAirports.countryEn, searchTerm),
					ilike(newAirports.countryRu, searchTerm),
					ilike(newAirports.iata, searchTerm),
					ilike(newAirports.icao, searchTerm),
				),
			)
			.orderBy(newAirports.passengers)
			.limit(20)

		if (query.length === 0) return [str]
		const uniqueQuery = query.filter(
			(item, index, self) =>
				index ===
				self.findIndex(
					(t) =>
						t.cityEn === item.cityEn &&
						t.cityRu === item.cityRu &&
						t.iata === item.iata &&
						t.icao === item.icao,
				),
		)
		query = uniqueQuery

		return [
			str,
			...query.map((item) => {
				const city =
					(locale === 'ru' ? item.cityRu || item.cityEn : item.cityEn || item.cityRu) || ''
				const country =
					(locale === 'ru' ? item.countryRu || item.countryEn : item.countryEn || item.countryRu) ||
					''
				const label =
					(locale === 'ru' ? item.labelRu || item.labelEn : item.labelEn || item.labelRu) || ''
				const ICAO = item.icao || item.iata
				return `${city || ''} ${ICAO ? `(${ICAO})` : ''} ${country || ''}, ${label || ''}`
			}),
		]
	} catch (error) {
		console.error('Error searching newAirports:', error)
		return [str]
	} finally {
		// const searchTerm = `%${toTitleCase(str.trim())}%`
		// const duration = performance.now() - startTime
		// console.log(`Search for "${searchTerm}" took ${duration}ms`)
	}
}

function toTitleCase(s: string) {
	return s.replace(/([^\s:\-])([^\s:\-]*)/g, function ($0, $1, $2) {
		return $1.toUpperCase() + $2.toLowerCase()
	})
}
