import { ContactUsSection, KeyFeaturesSection, SubpageHeroSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function Page() {
	const t = useTranslations()
	const cards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		title: t(`medical-key-features.${card}.title`),
		description: t(`medical-key-features.${card}.description`),
	}))
	const images = [
		'/images/home_page/key_features_tailoredp_references.jpg',
		'/images/home_page/key_features_cuztomized_aircraft.jpg',
		'/images/home_page/key_features_payment_after_flight.jpg',
		'/images/home_page/key_features_pay_anyway.jpg',
	]

	return (
		<main>
			<SubpageHeroSection
				title={t('medical-hero.title')}
				description={t('medical-hero.description')}
				imageUrl='/images/medical/hero.jpg'
			/>
			<KeyFeaturesSection
				title={t('medical-key-features.title')}
				description={t('medical-key-features.description')}
				cards={cards}
				images={images}
			/>
			<ContactUsSection
				title={t('medical-contact-us.title')}
				buttonText={t('medical-contact-us.button')}
				imageSrc='/images/medical/contact-us.jpg'
			/>
		</main>
	)
}