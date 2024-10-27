import { SubpageHeroSection, WhyUsSection } from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { useTranslations } from 'next-intl'

export default function CargoPage() {
	const t = useTranslations()
	const cards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		num: '',
		title: t(`cargo-why-us.${card}.title`),
		description: t(`cargo-why-us.${card}.description`),
	}))
	const images = [
		'/images/cargo_charter/why_us_global.webp',
		'/images/cargo_charter/why_us_personalized.webp',
		'/images/cargo_charter/why_us_security.webp',
		'/images/cargo_charter/why_us_guarantees.webp',
	]

	return (
		<main>
			<SubpageHeroSection
				title={t('cargo-hero.title')}
				description={t('cargo-hero.description')}
				imageUrl='/images/cargo_charter/hero.webp'
			/>
			<WhyUsSection title={t('cargo-why-us.title')} cards={cards} images={images} />
			{/* <CargoRequestSection /> */}
			{/* <ContactUsSection
				title={t('partners-contact-us.title')}
				description={t('partners-contact-us.description')}
				buttonText={t('partners-contact-us.button')}
				imageSrc='/images/cargo_charter/contact_us.webp'
			/> */}
			<NewContactUs />
		</main>
	)
}
