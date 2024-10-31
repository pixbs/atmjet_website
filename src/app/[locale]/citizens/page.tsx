import ForbesLogo from '@/assets/svg/forbes-logo.svg'
import Logo from '@/assets/svg/logo.svg'
import { MakeBookingSection, SubpageHeroSection, WhyUsSection } from '@/components/sections'
import NewContactUs from '@/components/sections/new_contact_us'
import { useLocale, useTranslations } from 'next-intl'
import { redirect } from 'next/navigation'

export default function CitizensPage() {
	const t = useTranslations()
	const locale = useLocale()

	const cards = ['card1', 'card2', 'card3', 'card4', 'card5'].map((card) => ({
		num: '',
		title: '',
		description: t(`citizens-why-us.${card}.title`),
	}))

	const images = [
		'/images/citizens/why_us_sanctions.webp',
		'/images/citizens/why_us_techstops.webp',
		'/images/citizens/why_us_foreignaircraft.webp',
		'/images/citizens/why_us_coordination.webp',
		'/images/citizens/why_us_anypayment.webp',
	]

	if (locale !== 'ru') {
		redirect('/')
	}

	return (
		<main>
			<SubpageHeroSection
				title={t('citizens-hero.title')}
				description=''
				imageUrl='/images/citizens/hero.webp'
			/>
			<section>
				<div className='container py-12'>
					<div className='card items-center gap-8 p-12 md:flex-row md:gap-12'>
						<Logo classname='h-12' />
						<div className='h-[1px] w-full shrink-0 bg-gray-400 md:h-40 md:w-[1px]' />
						<p>{t('citizens-hero.description')}</p>
					</div>
				</div>
			</section>
			<section>
				<div className='container'>
					<div className='card gap-8 bg-gray-150 p-8 md:gap-10 md:p-10'>
						<ForbesLogo className='-mb-6 h-14' />
						<h2 className='rounded-r-2xl border-l-2 border-gray-500 bg-gray-200 px-8 py-4 text-3xl md:px-10'>
							{t('quote.quote')}
						</h2>
						<p className='border-y border-gray-400 bg-gold bg-clip-text px-10 py-4 text-center text-transparent md:px-16'>
							{t('quote.description')}
						</p>
						{/* <Link href='?showBooking=Citizens' className='self-center' scroll={false}>
							<button className='big'>{t('quote.button')}</button>
						</Link> */}
					</div>
				</div>
			</section>
			<section>
				<div className='container'>
					<div className='card gap-8 bg-gray-150 p-8 md:gap-10 md:p-10'>
						<Logo className='-mb-6 h-14' />
						<h2 className='rounded-r-2xl border-l-2 border-gray-500 bg-gray-200 px-8 py-4 text-3xl md:px-10'>
							С 2004 года наша миссия в ATM JET — обеспечивать клиентам возможность летать без
							ограничений по всему миру несмотря на санкции и ограничения. Мы преодолеваем любые
							границы, чтобы наши клиенты могли наслаждаться лучшим сервисом в каждом полете
						</h2>
						<p className='border-y border-gray-400 bg-gold bg-clip-text px-10 py-4 text-center text-transparent md:px-16'>
							Артем Румянцев - основатель ATM JET
						</p>
						{/* <Link href='?showBooking=Citizens' className='self-center' scroll={false}>
							<button className='big'>{t('quote.button')}</button>
						</Link> */}
					</div>
				</div>
			</section>
			<MakeBookingSection isCard />
			<WhyUsSection title={t('citizens-why-us.title')} cards={cards} images={images} />
			<NewContactUs />
		</main>
	)
}
