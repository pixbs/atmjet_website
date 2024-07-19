import {
	EmptyLegSection,
	FaqSection,
	FooterSection,
	HeaderSection,
	HeroSection,
	KeyFeaturesSection,
	MakeBookingSection,
	OptionsSection,
	PrivilegeSection,
	TestimonialsSection,
	TransferSection,
	WhyUsSection,
	YachtsSection,
} from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function HomePage() {
	const t = useTranslations()
	const tWhyUs = useTranslations('home-why-us')

	const whyUsCards = ['card1', 'card2', 'card3', 'card4', 'card5'].map((card) => ({
		num: tWhyUs(`${card}.num`),
		title: tWhyUs(`${card}.title`),
		description: tWhyUs(`${card}.description`),
	}))
	const whyUsImages = [
		'images/home_page/why_us_years.jpg',
		'images/home_page/why_us_clients.jpg',
		'images/home_page/why_us_trusted_by_celeb.jpg',
		'images/home_page/why_us_same_day_departure.jpg',
		'images/home_page/why_us_excellence.jpg',
	]

	const keyFeaturesCards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		title: t(`key-features.${card}.title`),
		description: t(`key-features.${card}.description`),
	}))

	const keyFeaturesImages = [
		'images/home_page/key_features_tailoredp_references.jpg',
		'images/home_page/key_features_cuztomized_aircraft.jpg',
		'images/home_page/key_features_payment_after_flight.jpg',
		'images/home_page/key_features_pay_anyway.jpg',
	]

	return (
		<main>
			<HeaderSection />
			<HeroSection title={t('home-hero.title')} />
			<MakeBookingSection />
			<WhyUsSection title={tWhyUs('title')} cards={whyUsCards} images={whyUsImages} />
			<EmptyLegSection />
			<KeyFeaturesSection
				title={t('key-features.title')}
				description={t('key-features.description')}
				cards={keyFeaturesCards}
				images={keyFeaturesImages}
			/>
			<OptionsSection />
			<PrivilegeSection />
			<YachtsSection />
			<TestimonialsSection />
			<TransferSection />
			<FaqSection />
			<FooterSection />
		</main>
	)
}
