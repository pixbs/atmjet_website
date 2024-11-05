'use client'

import { getAircrafts } from '@/app/actions'
import { vehicles } from '@/lib/drizzle'
import { useEffect, useState } from 'react'
import { VehicleCard } from '../elements'

export default function AllAircrafts() {
	const [aircrafts, setAircrafts] = useState<(typeof vehicles.$inferSelect)[]>([])

	useEffect(() => {
		getAircrafts(0).then(setAircrafts)
	}, [])

	return (
		<section>
			<div className='container gap-10'>
				<div className='flex-row flex-wrap gap-y-10'>
					{aircrafts.map((aircrafts) => (
						<VehicleCard key={aircrafts.id} {...aircrafts} />
					))}
				</div>
				<button
					className='big self-center'
					onClick={() =>
						getAircrafts(aircrafts.length).then((newAircrafts) =>
							setAircrafts([...aircrafts, ...newAircrafts]),
						)
					}
				>
					Load more
				</button>
			</div>
		</section>
	)
}
