import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Counter } from '../elements'
import Image from 'next/image'
export function HeroSalesSection() {
	const t = useTranslations('sales-hero')

	return (
		<section>
			<div className='container z-20 !my-0 h-svh items-start justify-center gap-2'>
				<p className='text-sm uppercase'>{t('overline')}</p>
				<h1 className='duration-1000 animate-in fade-in slide-in-from-top-10'>
					<Counter className='bg-gold bg-clip-text text-transparent md:bg-fixed'>
						{t('num1')}
					</Counter>{' '}
					{t('headline1')}
					<br />
					<Counter className='bg-gold bg-clip-text text-transparent md:bg-fixed'>
						{t('num2')}
					</Counter>{' '}
					{t('headline2')}
				</h1>
				<p className='max-w-xs pt-4 text-gray-900'>{t('description')}</p>
				<Link href='?showBooking=Hero_sales' scroll={false}>
					<button className='big mt-8'>{t('button')}</button>
				</Link>
				<p className='absolute bottom-8 left-5 z-20 text-sm'>©ATM JET</p>
			</div>
			<div className='hero-darkening absolute inset-0 z-10' />
			<Image
				src='/images/jets_dep/jetsmarket_page_firstscreen_mainpic.webp'
				alt='Hero sales'
				className='md:object-fixed absolute inset-0 z-0 h-full w-full object-cover'
				loading='lazy'
				width={1920}
				height={1080}
			/>
		</section>
	)
}
