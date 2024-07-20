'use server'

import { db,  vehicles } from '@/lib/drizzle'
import Link from 'next/link'

export default async function Aircraft() {
	const vehiclesList = await db.select().from(vehicles).limit(10)

	console.log(vehiclesList)

	return <div>{vehiclesList.map((v) => <Link key={v.id} href={`aircraft/${v.id}`}>{v.tailModel}</Link>)}</div>
}
