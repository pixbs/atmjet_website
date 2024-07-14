import { useTranslations } from 'next-intl'
import { WhyUsCard } from '../elements'

export function WhyUsSection() {
	const t = useTranslations('why_us')
	const cards = ['card1', 'card2', 'card3', 'card4', 'card5']
	return (
		<section>
			<div className="container gap-10">
				<h2>{t('title')}</h2>
				<div>
					{cards.map((card) => (
						<WhyUsCard
							key={card}
							num={t(`${card}.num`)}
							title={t(`${card}.title`)}
							description={t(`${card}.description`)}
						/>
					))}
				</div>
			</div>
		</section>
	)
}