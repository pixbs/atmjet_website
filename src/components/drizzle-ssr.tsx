'use server'

import { db } from '@/lib/drizzle'
import { airports } from '../lib/drizzle'

export default async function DrizzleSSR() {
	const airportsList = await db.select().from(airports)

	return <div>{airportsList.map((airport) => airport.id)}</div>
}
