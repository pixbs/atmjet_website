import { useTranslations } from 'next-intl'

export function KeyFeaturesSection() {
	const t = useTranslations('key-features')
	const cards = ["card1", "card2", "card3", "card4"]

	return (
		<section>
			<div className="container">
				<h2>{t('title')}</h2>
				<p>{t('description')}</p>
				{cards.map((card, index) => (
					<Card
						title={t(`${card}.title`)}
						description={t(`${card}.description`)}
						key={index.toString()}
					/>
				))}

			</div>
		</section>
	)
}

interface CardProps {
	title: string,
	description: string
}

function Card (props: CardProps) {
	const { title, description } = props

	return (
		<div className="p-8">
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	)
}
