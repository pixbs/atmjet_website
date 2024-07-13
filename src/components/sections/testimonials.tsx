import { useTranslations } from 'next-intl'

export function TestimonialsSection() {
	const t = useTranslations('testimonials')
	const cards = ['card1', 'card2', 'card3', 'card4', 'card5']

	return (
		<section>
			<div className="container">
				<h2>{t('title')}</h2>
				<div>
					{cards.map((card, index) => (
						<Card
							description={t(`${card}.description`)}
							name={t(`${card}.name`)}
							title={t(`${card}.title`)}
							key={index.toString()}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

interface CardProps {
	description: string
	name: string
	title: string
}

function Card(props: CardProps) {
	const { description, name, title } = props

	return (
		<div className="flex flex-col items-stretch gap-3 p-6">
			<p>{description}</p>
			<div className="flex flex-col">
				<p>{name}</p>
				<p>{title}</p>
			</div>
		</div>
	)
}
