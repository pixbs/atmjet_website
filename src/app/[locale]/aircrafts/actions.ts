'use server'
import { aircraftImagesTable, aircrafts, db } from '@/lib/drizzle'
import { and, asc, between, desc, eq, inArray } from 'drizzle-orm'

async function getAircrafts(
	offset: number,
	minmax?: number[],
	sortby?: 'size' | 'passengers' | 'range',
	order?: 'asc' | 'desc',
) {
	try {
		return await db
			.select()
			.from(aircrafts)
			.where(minmax ? between(aircrafts.passengersMax, minmax[0], minmax[1]) : undefined)
			.orderBy(
				sortby === 'size'
					? order === 'desc'
						? desc(aircrafts.aircraftTypeCabinHeight)
						: asc(aircrafts.aircraftTypeCabinHeight)
					: sortby === 'passengers'
						? order === 'desc'
							? desc(aircrafts.passengersMax)
							: asc(aircrafts.passengersMax)
						: sortby === 'range'
							? order === 'desc'
								? desc(aircrafts.aircraftTypeRangeMaximum)
								: asc(aircrafts.aircraftTypeRangeMaximum)
							: asc(aircrafts.id),
			)
			.offset(offset)
			.limit(15)
	} catch (error) {
		console.error('Error fetching aircrafts:', error)
		return []
	}
}

async function getAircraftCovers(ids: number[]) {
	const request =
		(await db
			.select()
			.from(aircraftImagesTable)
			.where(
				and(inArray(aircraftImagesTable.aircraftId, ids), eq(aircraftImagesTable.type, 'exterior')),
			)
			.orderBy(aircraftImagesTable.aircraftId, aircraftImagesTable.id) // Ensure ordering
			.catch(() => [])) || []

	// Reduce the result to only the first "exterior" image per aircraftId
	const imageMap = new Map<number, string>()
	for (const image of request) {
		if (!imageMap.has(image.aircraftId)) {
			imageMap.set(image.aircraftId, image.url)
		}
	}

	// Ensure the output is in the same order as `ids`
	return ids.map((aircraftId) => ({
		aircraftId,
		url: imageMap.get(aircraftId) || '', // If no image, return empty URL
	}))
}

async function getImages(aircraftId: number) {
	const request =
		(await db
			.select()
			.from(aircraftImagesTable)
			.where(and(eq(aircraftImagesTable.aircraftId, aircraftId)))
			.catch(() => [])) || []

	return request
}

export { getAircraftCovers, getAircrafts, getImages }
