import { useTranslations } from 'next-intl'
import { KeyFeaturesCarousel } from '../elements/key_features_carousel'
import { KeyFeatureCard } from '../elements'

export function KeyFeaturesSection() {
	const t = useTranslations('key-features')
	const cards = ['card1', 'card2', 'card3', 'card4']
	const images = [
		'images/home_page/key_features_tailoredp_references.jpg',
		'images/home_page/key_features_cuztomized_aircraft.jpg',
		'images/home_page/key_features_payment_after_flight.jpg',
		'images/home_page/key_features_pay_anyway.jpg',
	]

	return (
		<section className='overflow-hidden bg-gray-150'>
			<div className='container mx-auto gap-4 px-4'>
				<h2>{t('title')}</h2>
				<p className='mb-8'>{t('description')}</p>
				<KeyFeaturesCarousel>
					{cards.map((card, index) => (
						<KeyFeatureCard
							title={t(`${card}.title`)}
							description={t(`${card}.description`)}
							key={index.toString()}
							imageSrc={images[index]}
						/>
					))}
				</KeyFeaturesCarousel>
			</div>
		</section>
	)
}
