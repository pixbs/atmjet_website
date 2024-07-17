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
	return (
		<main>
			<HeaderSection />
			<HeroSection title={t('home-hero.title')} />
			<MakeBookingSection />
			<WhyUsSection />
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
