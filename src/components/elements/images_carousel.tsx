'use client'

import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { DotButton, useDotButton } from './carousel_dot_button'
import { PrevButton, NextButton, usePrevNextButtons } from './carousel_arrows'
import Image from 'next/image'

type PropType = {
	slides: string[]
	options?: EmblaOptionsType
}

export function ImagesCarousel(props: PropType) {
	const [emblaRef, emblaApi] = useEmblaCarousel(props.options, [WheelGesturesPlugin()])
	const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)

	const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
		usePrevNextButtons(emblaApi)

	return (
		<div className='overflow-clip bg-gray-150' ref={emblaRef}>
			<div className='flex-row'>
				{props.slides.map((slide, index) => (
					<Image
						key={index}
						src={slide}
						alt={`Slide ${index}`}
						className='aspect-video w-full shrink-0 rounded-xl object-cover object-center'
						loading='lazy'
						width={720}
						height={405}
					/>
				))}
			</div>
			<PrevButton
				onClick={onPrevButtonClick}
				disabled={prevBtnDisabled}
				className='absolute left-4 top-1/2 -translate-y-1/2'
			/>
			<NextButton
				onClick={onNextButtonClick}
				disabled={nextBtnDisabled}
				className='absolute right-4 top-1/2 -translate-y-1/2'
			/>
			<div className='absolute bottom-2 left-0 right-0 z-30 flex-row flex-wrap items-center justify-center gap-2'>
				{scrollSnaps.map((snap, index) => (
					<DotButton
						key={index}
						onClick={() => onDotButtonClick(index)}
						className={`h-4 w-4 appearance-none rounded-full p-0 ${index === selectedIndex ? 'bg-gold' : 'bg-gray-500'}`}
					/>
				))}
			</div>
		</div>
	)
}
