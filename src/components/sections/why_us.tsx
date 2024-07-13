import { useTranslations } from "next-intl"

export function WhyUsSection() {
	const t = useTranslations('why_us')
	const cards = ["card1", "card2", "card3", "card4", "card5"]
	return (
		<section>
			<div className="container gap-10">
				<h2>{t('title')}</h2>
				<div>
					{cards.map(card => (
						<Card
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

interface CardProps {
	num: string,
	title: string,
	description: string
}

function Card (props: CardProps) {
	const { num, title, description } = props

	return (
		<div className="p-8 card bg-gray-150 gap-4 pb-24 -mb-16 last:mb-0 last:pb-10">
			<p className="text-5xl font-serif">{num}</p>
			<h3>{title}</h3>
			<p>{description}</p>
		</div>
	)
}
