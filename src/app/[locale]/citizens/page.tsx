import { ContactUsSection, SubpageHeroSection, WhyUsSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function CitizensPage() {
	const t = useTranslations()

	const cards = ['card1', 'card2', 'card3', 'card4', 'card5'].map((card) => ({
		num: '',
		title: t(`citizens-why-us.${card}.title`),
		description: '',
	}))

	const images = [
		'/images/citizens/why_us_sanctions.jpg',
		'/images/citizens/why_us_techstops.jpg',
		'/images/citizens/why_us_foreignaircraft.jpg',
		'/images/citizens/why_us_coordination.jpg',
		'/images/citizens/why_us_anypayment.jpg',
	]

	return (
		<main>
			<SubpageHeroSection
				title={t('citizens-hero.title')}
				description={t('citizens-hero.description')}
				imageUrl='/images/citizens/hero.jpg'
			/>
			<WhyUsSection title={t('citizens-why-us.title')} cards={cards} images={images} />
			<ContactUsSection
				title={t('partners-contact-us.title')}
				description={t('partners-contact-us.description')}
				buttonText={t('partners-contact-us.button')}
				imageSrc='/images/partners/contact_us.jpg'
			/>
		</main>
	)
}
