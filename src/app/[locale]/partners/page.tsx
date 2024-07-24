import { Counter } from '@/components/elements'
import { ContactUsSection, PersonalFlightManagerSection, WhyUsSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function PartnersPage() {
	const t = useTranslations()

	const whyUsCards = ['card1', 'card2', 'card3', 'card4'].map((card) => ({
		num: '',
		title: t(`we-offer.${card}.title`),
		description: t(`we-offer.${card}.description`),
	}))

	const whyUsImages = [
		'/images/home_page/why_us_years.jpg',
		'/images/home_page/why_us_clients.jpg',
		'/images/home_page/why_us_trusted_by_celeb.jpg',
		'/images/home_page/why_us_same_day_departure.jpg',
		'/images/home_page/why_us_excellence.jpg',
	]

	return <main>
		<section>
			<div className='container pt-32 gap-20'>
				<h1 className='text-center'>
					{t('partners-hero.title')}
					<Counter
						className='bg-gold bg-clip-text text-transparent'
					>
						{t('partners-hero.num')}
					</Counter>
					{t('partners-hero.title2')}
				</h1>
				<div
					className='bg-cover bg-center bg-no-repeat h-64 rounded-2xl'
					style={{ backgroundImage: 'url(/images/partners/hero.jpg)' }}
				/>
				<div className='card bg-gray-150 gap-4 p-8 md:p-10'>
					<h2>{t('instant-payment.title')}</h2>
					<p>{t('instant-payment.description')}</p>
				</div>
			</div>
		</section>
		<WhyUsSection 
			title={t('we-offer.subtitle')}
			description={t('we-offer.description')}
			cards={whyUsCards}
			images={whyUsImages}
		/>
		<PersonalFlightManagerSection />
		<ContactUsSection 
			title={t('partners-contact-us.title')}
			description={t('partners-contact-us.description')}
			buttonText={t('partners-contact-us.button')}
			imageSrc='/images/partners/contact_us.jpg'
		/>
	</main>
}
