import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { EmptyLegCard } from '../elements'

export function EmptyLegSection() {
	const t = useTranslations('empty-leg')
	const cards = ['card1', 'card2', 'card3', 'card4']
	return (
		<section className='bg-gray-150'>
			<div className='container gap-8 py-10 pt-10 lg:flex-row'>
				<div className='top-40 min-w-40 flex-shrink-0 gap-4 self-start lg:sticky lg:w-72'>
					<h2>{t('title')}</h2>
					<p>{t('description')}</p>
				</div>
				<div className='gap-4'>
					{cards.map((card, index) => (
						<EmptyLegCard
							date={t(`${card}.date`)}
							price={t(`${card}.price`)}
							initalPrice={t(`${card}.initial-price`)}
							discountPercent={t(`${card}.discount-percent`)}
							from={t(`${card}.from`)}
							to={t(`${card}.to`)}
							fromTime={t(`${card}.form-time`)}
							toTime={t(`${card}.to-time`)}
							fromAirport={t(`${card}.from-airport`)}
							toAirport={t(`${card}.to-airport`)}
							howLong={t(`${card}.how-long`)}
							key={index.toString()}
						/>
					))}
					<div className='card mt-4 items-start gap-4 border-0 bg-gradient-to-b from-gray-200 from-15% to-[#14323D] p-6 md:bg-fixed'>
						<h3>{t('telegram.title')}</h3>
						<p className='text-gray-900'>{t('telegram.description')}</p>
						<Link href='tg://resolve?domain=@atmjet1'>
							<button className='mt-2 bg-blue-500 text-gray-900'>{t('telegram.button')}</button>
						</Link>
					</div>
				</div>
			</div>
		</section>
	)
}
