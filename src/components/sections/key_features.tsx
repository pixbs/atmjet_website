import { KeyFeatureCard } from '../elements'
import { KeyFeaturesCarousel } from '../elements/key_features_carousel'

interface KeyFeaturesSectionProps {
	title: string
	description: string
	cards: { title: string; description: string }[]
	images: string[]
}

export function KeyFeaturesSection(props: KeyFeaturesSectionProps) {
	const { title, description, cards, images } = props

	return (
		<section className='overflow-hidden bg-gray-150'>
			<div className='container mx-auto gap-4 px-4 md:flex-row md:gap-5'>
				<div className='relative z-10 gap-4 md:min-w-80'>
					<h2 className='bg-gold bg-clip-text text-transparent md:bg-fixed'>{title}</h2>
					<p className='mb-8'>{description}</p>
				</div>
				<KeyFeaturesCarousel>
					{cards.map((card, index) => (
						<KeyFeatureCard
							title={card.title}
							description={card.description}
							key={index.toString()}
							imageSrc={images[index]}
						/>
					))}
				</KeyFeaturesCarousel>
			</div>
		</section>
	)
}
