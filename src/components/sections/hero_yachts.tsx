import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function HeroYachtsSection() {
	const t = useTranslations('yachts-hero')

	return (
		<section className='min-h-[680]'>
			<div className='container z-20 !my-0 h-svh items-start justify-end pb-14 gap-2'>
				<p className='text-sm uppercase'>{t('overline')}</p>
				<h1 className='duration-1000 animate-in fade-in slide-in-from-top-10'>{t('title')}</h1>
				<p className='max-w-lg pt-4 text-gray-900'>{t('description')}</p>
				<p className='max-w-lg pt-4 text-gray-900'>{t('description2')}</p>
				<Link href='?showBooking=Hero_yachts' scroll={false}>
					<button className='big mt-8'>{t('button')}</button>
				</Link>
				{/* <p className='absolute bottom-8 left-5 z-20 text-sm'>©ATM JET</p> */}
			</div>
			<div className='hero-darkening absolute inset-0 z-10' />
			<div
				className='absolute inset-0 z-0 h-full w-full bg-cover md:bg-fixed bg-center bg-no-repeat object-cover'
				style={{ backgroundImage: `url(/images/yachts/yacht_page_firstscreen_mainpic.jpg)` }}
			/>
		</section>
	)
}
