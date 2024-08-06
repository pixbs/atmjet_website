import { useTranslations } from 'next-intl'
import Link from 'next/link'

export function BestPriceSection() {
	const t = useTranslations('best-price')
	return (
		<section>
			<div className='container'>
				<div className='card !flex-col-reverse items-center bg-gray-150 lg:!flex-row'>
					<div className='p-8 md:p-10'>
						<h2 className='bg-gold bg-clip-text text-transparent'>{t('title')}</h2>
						<p className='mt-4'>{t('description')}</p>
						<Link href='?showBooking=Best_price' className='mt-10 md:self-start' scroll={false}>
							<button className='big'>{t('button')}</button>
						</Link>
					</div>
					<div
						className='h-80 w-full rounded-2xl bg-cover bg-center bg-no-repeat'
						style={{ backgroundImage: 'url(/images/business_agencies/insurance.jpg)' }}
					/>
				</div>
			</div>
		</section>
	)
}
