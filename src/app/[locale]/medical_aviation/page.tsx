import { KeyFeaturesSection, SubpageHeroSection } from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { useTranslations } from 'next-intl'

export default function Page() {
	const t = useTranslations()
	const cards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		title: t(`medical-key-features.${card}.title`),
		description: t(`medical-key-features.${card}.description`),
	}))
	const images = [
		'/images/medical/slide1.webp',
		'/images/medical/slide4.webp',
		'/images/medical/slide2.webp',
		'/images/medical/slide3.webp',
	]

	return (
		<main>
			<SubpageHeroSection
				title={t('medical-hero.title')}
				description={t('medical-hero.description')}
				imageUrl='/images/medical/hero.webp'
			/>
			<KeyFeaturesSection
				title={t('medical-key-features.title')}
				description={t('medical-key-features.description')}
				cards={cards}
				images={images}
			/>
			<NewContactUs />
		</main>
	)
}
