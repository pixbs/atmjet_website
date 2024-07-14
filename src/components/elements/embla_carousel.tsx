'use client'

import useEmblaCarousel from 'embla-carousel-react'
import { useEffect } from 'react'

export function EmblaCarouselWrapper({ children }: { children: React.ReactNode }) {
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

	// Use effect to re-initiate Embla when children change
	useEffect(() => {
		if (emblaApi) {
			emblaApi.reInit()
		}
	}, [children, emblaApi])

	return (
		<div className="embla" ref={emblaRef}>
			<div className="embla__container flex-row">{children}</div>
		</div>
	)
}
