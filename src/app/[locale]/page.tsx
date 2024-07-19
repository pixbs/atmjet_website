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

	const cards = ['card1', 'card2', 'card3', 'card4', 'card5'].map((card) => ({
		num: tWhyUs(`${card}.num`),
		title: tWhyUs(`${card}.title`),
		description: tWhyUs(`${card}.description`),
	}))
	const images = [
		'images/home_page/why_us_years.jpg',
		'images/home_page/why_us_clients.jpg',
		'images/home_page/why_us_trusted_by_celeb.jpg',
		'images/home_page/why_us_same_day_departure.jpg',
		'images/home_page/why_us_excellence.jpg',
	]

	return (
		<main>
			<HeaderSection />
			<HeroSection title={t('home-hero.title')} />
			<MakeBookingSection />
			<WhyUsSection title={tWhyUs('title')} cards={cards} images={images} />
			<EmptyLegSection />
			<KeyFeaturesSection />
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
