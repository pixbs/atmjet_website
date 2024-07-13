import { HeroSection, WhyUsSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function HomePage() {
	const t = useTranslations()
	return <main>
		<HeroSection title={t('hero-section.title')} />
		<WhyUsSection/>
	</main>
}
