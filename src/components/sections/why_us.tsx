import { useTranslations } from 'next-intl'
import { WhyUsCard } from '../elements'
interface WhyUsSectionProps {
	title: string
	cards: { num: string; title: string; description: string }[]
	images: string[]
}

export function WhyUsSection(props: WhyUsSectionProps) {
	const { title, cards, images } = props
	return (
		<section>
			<div className='container gap-10 lg:flex-row'>
				<h2 className='top-40 flex-shrink-0 self-start lg:sticky lg:w-72'>{title}</h2>
				<div className='relative w-full self-stretch overflow-clip rounded-2xl'>
					{cards.map((card, index) => (
						<WhyUsCard
							key={card.title}
							num={card.num}
							title={card.title}
							description={card.description}
							topPadding={(index + 1) * 32}
							imageSrc={images[index]}
						/>
					))}
				</div>
			</div>
		</section>
	)
}
