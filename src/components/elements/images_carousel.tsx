import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures'
import { DotButton, useDotButton } from './carousel_dot_button'

type PropType = {
	slides: string[]
	options?: EmblaOptionsType
}

export function ImagesCarousel(props: PropType) {
	const [emblaRef, emblaApi] = useEmblaCarousel(props.options, [WheelGesturesPlugin()])
	const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi)

	return (
		<div className='overflow-clip bg-red-950' ref={emblaRef}>
			<div className='flex-row'>
				{props.slides.map((slide, index) => (
					<img
						key={index}
						className='aspect-[14/10] w-full shrink-0 rounded-xl bg-cover bg-center'
						loading='lazy'
						style={{ backgroundImage: `url(${slide})` }}
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
