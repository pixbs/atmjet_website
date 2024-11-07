'use client'

import { getAircrafts } from '@/app/actions'
import { vehicles } from '@/lib/drizzle'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import { VehicleCard } from '../elements'

export default function AllAircrafts() {
	const [aircrafts, setAircrafts] = useState<(typeof vehicles.$inferSelect)[]>([])
	const locale = useLocale()

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
					{locale === 'ru' ? 'Показать еще' : 'Show more'}
				</button>
			</div>
		</section>
	)
}
