import { useTranslations } from 'next-intl'
import { TestimonialsCarousel, TestimonialsCard } from '../elements'

export function TestimonialsSection() {
	const t = useTranslations('testimonials')
	const cards = ['card1', 'card2', 'card3', 'card4', 'card5']

	return (
		<section className='overflow-hidden bg-gray-150'>
			<div className='container static gap-8'>
				<h2>{t('title')}</h2>
				<TestimonialsCarousel>
					{cards.map((card, index) => (
						<TestimonialsCard
							description={t(`${card}.description`)}
							name={t(`${card}.name`)}
							title={t(`${card}.title`)}
							key={index.toString()}
							imageSrc='images/home_page/why_us_clients.jpg'
						/>
					))}
				</TestimonialsCarousel>
			</div>
		</section>
	)
}
