import { useTranslations } from 'next-intl'
import { Counter } from '../elements'

export function HeroSalesSection() {
	const t = useTranslations('sales-hero')

	return (
		<section>
			<div className='container z-20 !my-0 h-svh items-start justify-center gap-2'>
				<p className='text-sm uppercase'>{t('overline')}</p>
				<h1 className='duration-1000 animate-in fade-in slide-in-from-top-10'>
					<Counter className='bg-gold bg-fixed bg-clip-text text-transparent'>{t('num1')}</Counter>{' '}
					{t('headline1')}
					<br />
					<Counter className='bg-gold bg-fixed bg-clip-text text-transparent'>
						{t('num2')}
					</Counter>{' '}
					{t('headline2')}
				</h1>
				<p className='pt-4 text-gray-900'>{t('description')}</p>
				<button className='big mt-8'>{t('button')}</button>
				<p className='absolute bottom-8 left-5 z-20 text-sm'>©ATM JET</p>
			</div>
			<div className='hero-darkening absolute inset-0 z-10' />
			<div
				className='absolute inset-0 z-0 h-full w-full bg-cover bg-fixed bg-center bg-no-repeat object-cover'
				style={{ backgroundImage: `url(/images/jets_dep/jetsmarket_page_firstscreen_mainpic.jpg)` }}
			/>
		</section>
	)
}
