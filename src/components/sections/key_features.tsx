'use client'
import { useTranslations } from 'next-intl'
import useEmblaCarousel from 'embla-carousel-react'
import { useEffect } from 'react'

export function KeyFeaturesSection() {
	const t = useTranslations('key-features')
	const cards = ['card1', 'card2', 'card3', 'card4']

	return (
		<section className="bg-gray-150">
			<div className="container mx-auto gap-4 px-4">
				<h2>{t('title')}</h2>
				<p className="mb-8">{t('description')}</p>
				<EmblaCarouselWrapper>
					{cards.map((card, index) => (
						<Card
							title={t(`${card}.title`)}
							description={t(`${card}.description`)}
							key={index.toString()}
						/>
					))}
				</EmblaCarouselWrapper>
			</div>
		</section>
	)
}

interface CardProps {
	title: string
	description: string
}

function Card(props: CardProps) {
	const { title, description } = props

	return (
		<div className="embla__slide relative aspect-square w-full flex-shrink-0 justify-end gap-4 bg-blue-400 pr-24">
			<h3 className="z-10">{title}</h3>
			<p className="z-10">{description}</p>
			<div className="darkening absolute inset-0" />
		</div>
	)
}

function EmblaCarouselWrapper({ children }: { children: React.ReactNode }) {
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
