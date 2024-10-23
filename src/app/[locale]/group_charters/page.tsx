import { WhyUsCard } from '@/components/elements'
import { MakeBookingSection, SubpageHeroSection } from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { useTranslations } from 'next-intl'

export default function GroupCharterPage() {
	const t = useTranslations()

	const cards = ['card1', 'card2', 'card3'].map((card) => ({
		title: t(`group-charters-cards.${card}.title`),
		description: t(`group-charters-cards.${card}.description`),
	}))
	const images = [
		'/images/business_agencies/hero.webp',
		'/images/group_charter/card2.webp',
		'/images/group_charter/hero.webp',
	]

	return (
		<main>
			<SubpageHeroSection
				title={t('group-charters-hero.title')}
				description={t('group-charters-hero.description')}
				imageUrl='/images/group_charter/hero.webp'
			/>
			<MakeBookingSection />
			<section>
				<div className='container'>
					{cards.map((card, index) => (
						<WhyUsCard
							key={card.title}
							num=''
							title={card.title}
							description={card.description}
							topPadding={(index + 1) * 32}
							imageSrc={images[index]}
						/>
					))}
				</div>
			</section>
			<NewContactUs />
		</main>
	)
}
