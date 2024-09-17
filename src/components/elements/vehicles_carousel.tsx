'use client'

import { vehicles } from '@/lib/drizzle'
import { EmblaCarouselType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useCallback, useEffect, useState } from 'react'
import { VehicleCard } from './vehicle_card'
import { PrevButton, NextButton, usePrevNextButtons } from './carousel_arrows'

interface VehiclesCarouselProps {
	vehicles: (typeof vehicles.$inferSelect)[]
	useImgInsteadOfThumb?: boolean
}

export function VehiclesCarousel(props: VehiclesCarouselProps) {
	const { vehicles, useImgInsteadOfThumb } = props
	const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
		WheelGesturesPlugin(),
	])
	const [scrollProgress, setScrollProgress] = useState(0)

	const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
		usePrevNextButtons(emblaApi)

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
		<div className='relative'>
			<div className='embla overflow-clip' ref={emblaRef}>
				<div className='embla__container flex-row'>
					{props.vehicles.map((vehicle) => (
						<VehicleCard {...vehicle} />
					))}
				</div>
			</div>
			<PrevButton
				onClick={onPrevButtonClick}
				disabled={prevBtnDisabled}
				className='absolute -left-4 top-1/2 -translate-y-1/2 lg:-translate-x-full'
			/>
			<NextButton
				onClick={onNextButtonClick}
				disabled={nextBtnDisabled}
				className='absolute -right-4 top-1/2 -translate-y-1/2 lg:translate-x-full'
			/>
		</div>
	)
}
