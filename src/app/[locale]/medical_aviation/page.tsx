import { useTranslations } from 'next-intl'

export default function Page() {
	const t = useTranslations()
	const cards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		title: t(`medical-key-features.${card}.title`),
		description: t(`medical-key-features.${card}.description`),
	}))
	const images = [
		'/images/jets_dep/jetsmarket_page_specialmanagement_50flights.jpg',
		'/images/jets_dep/jetsmarket_page_specialmanagement_experience.jpg',
		'/images/jets_dep/jetsmarket_page_specialmanagement_yields.jpg',
	]

	return <main></main>
}
