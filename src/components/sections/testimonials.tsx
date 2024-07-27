import { useTranslations } from 'next-intl'
import { TestimonialsCard, TestimonialsCarousel } from '../elements'

export function TestimonialsSection() {
	const t = useTranslations('testimonials')
	const cards = ['card1', 'card2', 'card3', 'card4', 'card5']
	const images = [
		'/images/testimonials/sardar.jpg',
		'/images/testimonials/pele.png',
		'/images/testimonials/nicole.png',
		'/images/testimonials/anna_netrebko.png',
		'/images/testimonials/jamiroquai.jpg',
	]

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
							imageSrc={images[index]}
						/>
					))}
				</TestimonialsCarousel>
			</div>
		</section>
	)
}
