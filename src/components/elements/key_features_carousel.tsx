'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useCallback, useEffect, useState } from 'react'
import { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel'

export function KeyFeaturesCarousel({ children }: { children: React.ReactNode }) {
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
		<div className="embla" ref={emblaRef}>
			<div className="embla__container flex-row">{children}</div>
		</div>
	)
}