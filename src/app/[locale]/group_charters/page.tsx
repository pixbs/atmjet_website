import { WhyUsCard } from '@/components/elements'
import { ContactUsSection, SubpageHeroSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function GroupCharterPage() {
	const t = useTranslations()

	const cards = ['card1', 'card2', 'card3'].map((card) => ({
		title: t(`group-charters-cards.${card}.title`),
		description: t(`group-charters-cards.${card}.description`),
	}))

	return (
		<main>
			<SubpageHeroSection
				title={t('group-charters-hero.title')}
				description={t('group-charters-hero.description')}
				imageUrl='/images/group_charter/hero.jpg'
			/>
			<section>
				<div className='container'>
					{cards.map((card, index) => (
						<WhyUsCard
							key={card.title}
							num=''
							title={card.title}
							description={card.description}
							topPadding={(index + 1) * 32}
						/>
					))}
				</div>
			</section>
			<ContactUsSection
				title={t('partners-contact-us.title')}
				description={t('partners-contact-us.description')}
				buttonText={t('partners-contact-us.button')}
				imageSrc='/images/partners/contact_us.jpg'
			/>
		</main>
	)
}
