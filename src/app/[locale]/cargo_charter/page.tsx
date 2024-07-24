import { CargoRequestSection, ContactUsSection, SubpageHeroSection, WhyUsSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function Page() {
	const t = useTranslations()
	const cards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		num: '',
		title: t(`cargo-why-us.${card}.title`),
		description: t(`cargo-why-us.${card}.description`),
	}))
	const images = [
		'/images/cargo_charter/why_us_global.jpg',
		'/images/cargo_charter/why_us_personalized.jpg',
		'/images/cargo_charter/why_us_security.jpg',
		'/images/cargo_charter/why_us_guarantees.jpg',
	]

	return (
		<main>
			<SubpageHeroSection
				title={t('cargo-hero.title')}
				description={t('cargo-hero.description')}
				imageUrl='/images/cargo_charter/hero.jpg'
			/>
			<WhyUsSection title={t('cargo-why-us.title')} cards={cards} images={images} />
			<CargoRequestSection />
			<ContactUsSection
				title={t('partners-contact-us.title')}
				description={t('partners-contact-us.description')}
				buttonText={t('partners-contact-us.button')}
				imageSrc='/images/cargo_charter/contact_us.jpg'
			/>
		</main>
	)
}
