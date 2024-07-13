import { useTranslations } from "next-intl"

export function WhyUsSection() {
	const t = useTranslations('why_us')
	return (
		<section>
			<div className="container">
				<h2>{t('title')}</h2>
				<div>
					<Card
						num={t('card1.num')}
						title={t('card1.title')}
						description={t('card1.description')}
					/>
					<Card
						num={t('card2.num')}
						title={t('card2.title')}
						description={t('card2.description')}
					/>
					<Card
						num={t('card3.num')}
						title={t('card3.title')}
						description={t('card3.description')}
					/>
					<Card
						num={t('card4.num')}
						title={t('card4.title')}
						description={t('card4.description')}
					/>
					<Card
						num={t('card5.num')}
						title={t('card5.title')}
						description={t('card5.description')}
					/>
				</div>
			</div>
		</section>
	)
}

interface CardProps {
	num: string,
	title: string,
	description: string
}

function Card (props: CardProps) {
	const { num, title, description } = props

	return (
		<div className="p-8">
			<p className="text-5xl">{num}</p>
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	)
}
