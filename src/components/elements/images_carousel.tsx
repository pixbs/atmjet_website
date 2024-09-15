import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { DotButton, useDotButton } from './carousel_dot_button'
import Image from 'next/image'

type PropType = {
	slides: string[]
	options?: EmblaOptionsType
}

export function ImagesCarousel(props: PropType) {
	const [emblaRef, emblaApi] = useEmblaCarousel(props.options, [WheelGesturesPlugin()])
	const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)

	return (
		<div className='overflow-clip bg-gray-150' ref={emblaRef}>
			<div className='flex-row'>
				{props.slides.map((slide, index) => (
					<Image
						key={index}
						src={slide}
						alt={`Slide ${index}`}
						className='w-full aspect-video shrink-0 rounded-xl object-cover object-center'
						loading='lazy'
						width={720}
						height={405}
					/>
				))}
			</div>
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
