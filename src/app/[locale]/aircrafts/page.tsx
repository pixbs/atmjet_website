import Line from '@/components/animated/line'
import { Counter } from '@/components/elements'
import NewContactUs from '@/components/sections/new_contact_us'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import AircraftsList from './aircrafts_list'

function AircraftsPage() {
	const t = useTranslations()
	return (
		<main>
			<section>
				<div className='container gap-20 pt-32'>
					<div className='items-center gap-4'>
						<h1 className='text-center'>
							{t('aircrafts-hero.title')}
							<Counter>{t('aircrafts-hero.num')}</Counter>
							{t('aircrafts-hero.title2')}
						</h1>
						<p className='text-center md:max-w-screen-sm'>{t('aircrafts-hero.description')}</p>
					</div>
				</div>
			</section>
			<Line />
			<section>
				<div className='container gap-10'>
					<div className='card relative gap-4 overflow-clip p-12 md:p-24'>
						<h2>{t('aircrafts-contact-us.title')}</h2>
						<p className='md:w-1/2'>{t('aircrafts-contact-us.description')}</p>
						<Link href='?showBooking=Contact_us_aircrafts' className='mt-4' scroll={false}>
							<button>{t('aircrafts-contact-us.button')}</button>
						</Link>
						<div className='option-darkening absolute inset-0 -z-10' />
						<div className='option-darkening absolute inset-0 -z-10' />
						<div className='option-darkening absolute inset-0 -z-10' />
						<div className='absolute inset-0 -z-10 bg-gray-100 opacity-80 md:hidden' />
						<Image
							src='/images/aircrafts/aircrafts.png'
							alt='aircrafts'
							fill
							className='fixed -z-20 rounded-xl object-cover'
						/>
					</div>
				</div>
			</section>
			<AircraftsList />
			<Line />
			<NewContactUs />
		</main>
	)
}

export default AircraftsPage
