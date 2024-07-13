import { EmblaOptionsType } from 'embla-carousel'
import useEmblaCarousel from 'embla-carousel-react'

interface PropType {
	slides: number[]
	options?: EmblaOptionsType
}
function EmblaCarousel(props: PropType): JSX.Element {
	const { slides, options } = props
	const [emblaRef, emblaApi] = useEmblaCarousel(options)

	return (
		<section className="embla">
			<div className="embla__viewport" ref={emblaRef}>
				<div className="embla__container">
					{slides.map((index) => (
						<div className="embla__slide" key={index}>
							<div className="embla__slide__number">{index + 1}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}

export default EmblaCarousel
