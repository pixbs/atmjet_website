'use client'

import { EmblaCarouselType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { useCallback, useEffect, useState } from 'react'
import { NextButton, PrevButton, usePrevNextButtons } from './carousel_arrows'

export function KeyFeaturesCarousel({ children }: { children: React.ReactNode }) {
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
		<>
			<div className='relative w-full'>
				<div className='embla overflow-clip' ref={emblaRef}>
					<div className='embla__container flex-row'>{children}</div>
				</div>
			</div>
			<div className='md:absolute right-4 top-4 flex-row gap-2'>
				<PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
				<NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
			</div>
		</>
	)
}
