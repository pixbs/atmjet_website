'use server'
import { db, vehicles } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'

interface VihicleCardProps {
	id: number
}

export async function VehicleCard(props: VihicleCardProps) {
	const { id } = props
	const [vehicle] = await db.select().from(vehicles).limit(1).where(eq(vehicles.id, id))

	return (
		<div>
			<div
				className='h-96 bg-cover bg-center'
				style={{ backgroundImage: `url(https://${vehicle.image})` }}
			/>
			<h1>{vehicle.tailModel}</h1>
			<div className='flex-row place-content-between'>
				<p>Year</p>
				<p>{vehicle.tailYear}</p>
			</div>
			<hr />
			<div className='flex-row place-content-between'>
				<p>Price</p>
				<p>{vehicle.price}</p>
			</div>
		</div>
	)
}
