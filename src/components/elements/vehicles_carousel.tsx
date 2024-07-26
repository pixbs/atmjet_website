'use client'

import { vehicles } from '@/lib/drizzle'
import { EmblaCarouselType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { VehicleCard } from './vehicle_card'

interface VehiclesCarouselProps {
	vehicles: (typeof vehicles.$inferSelect)[]
}

export function VehiclesCarousel(props: VehiclesCarouselProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' })
	const [scrollProgress, setScrollProgress] = useState(0)

	const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
		const progress = Math.max(0, Math.min(1, emblaApi.scrollProgress()))
		setScrollProgress(progress * 100)
	}, [])

	useEffect(() => {
		if (!emblaApi) return

		onScroll(emblaApi)
		emblaApi.on('reInit', onScroll).on('scroll', onScroll).on('slideFocus', onScroll)
	}, [emblaApi, onScroll])

	return (
		<div className='embla overflow-clip' ref={emblaRef}>
			<div className='embla__container flex-row'>
				{props.vehicles.map((vehicle) => (
					<VehicleCard {...vehicle} />
				))}
			</div>
		</div>
	)
}
