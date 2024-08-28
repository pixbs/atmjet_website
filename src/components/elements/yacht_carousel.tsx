'use client'

import { yachts } from '@/lib/drizzle'
import { EmblaCarouselType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useCallback, useEffect, useState } from 'react'
import { YachtCard } from './yacht_card'

interface YachtCarouselProps {
	vehicles: (typeof yachts.$inferSelect)[]
}

export function YachtCarousel(props: YachtCarouselProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [WheelGesturesPlugin()])
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
		<div className='overflow-clip' ref={emblaRef}>
			<div className='flex-row'>
				{props.vehicles.map((vehicle, index) => (
					<YachtCard {...vehicle} key={index} />
				))}
			</div>
		</div>
	)
}
