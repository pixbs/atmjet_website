'use server'

import { db,  vehicles } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'
import Link from 'next/link'

import { useParams } from "next/navigation";


export default async function AircraftSlug({ params }: { params: { id: string } }) {

	const { id} = params;


	const [vehicle] = await db.select().from(vehicles).limit(1).where(eq(vehicles.id, parseInt( decodeURIComponent(params.id))))


	return <div>{JSON.stringify(vehicle, null, 4)}</div>
}
