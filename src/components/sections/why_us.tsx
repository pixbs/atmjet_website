import { useTranslations } from 'next-intl'
import { WhyUsCard } from '../elements'

export function WhyUsSection() {
	const t = useTranslations('home-why-us')
	const cards = ['card1', 'card2', 'card3', 'card4', 'card5']
	const images = [
		'images/home_page/why_us_years.jpg',
		'images/home_page/why_us_clients.jpg',
		'images/home_page/why_us_trusted_by_celeb.jpg',
		'images/home_page/why_us_same_day_departure.jpg',
		'images/home_page/why_us_excellence.jpg',
	]
	return (
		<section>
			<div className='container gap-10 lg:flex-row'>
				<h2 className='min-w-80 lg:sticky top-40'>
					{t('title')}
				</h2>
				<div className='relative overflow-clip rounded-2xl'>
					{cards.map((card, index) => (
						<WhyUsCard
							key={card}
							num={t(`${card}.num`)}
							title={t(`${card}.title`)}
							description={t(`${card}.description`)}
							topPadding={(index + 1) * 32}
							imageSrc={images[index]}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
