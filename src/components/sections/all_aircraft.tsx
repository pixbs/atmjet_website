'use client'

import { getAircraft } from '@/app/actions'
import { vehicles } from '@/lib/drizzle'
import { useEffect, useState } from 'react'
import { VehicleCard } from '../elements'

export default function AllAircraft() {
	const [aircraft, setAircraft] = useState<(typeof vehicles.$inferSelect)[]>([])

	useEffect(() => {
		getAircraft(0).then(setAircraft)
	}, [])

	return (
		<section>
			<div className='container gap-10'>
				<div className='flex-row flex-wrap gap-y-10'>
					{aircraft.map((aircraft) => (
						<VehicleCard key={aircraft.id} {...aircraft} />
					))}
				</div>
				<button
					className='big self-center'
					onClick={() =>
						getAircraft(aircraft.length).then((newAircraft) =>
							setAircraft([...aircraft, ...newAircraft]),
						)
					}
				>
					Load more
				</button>
			</div>
		</section>
	)
}
