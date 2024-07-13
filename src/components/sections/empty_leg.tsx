import { useTranslations } from 'next-intl'

export function EmptyLegSection() {
	const t = useTranslations('empty_leg')
	const cards = ['card1', 'card2', 'card3', 'card4']
	return (
		<section className="bg-gray-150">
			<div className="container gap-8 py-10 pt-10">
				<div className="gap-4">
					<h2>{t('title')}</h2>
					<p>{t('description')}</p>
				</div>
				<div className="gap-4">
					{cards.map((card, index) => (
						<Card
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
					<div className="card mt-4 items-start gap-4 border-0 bg-gradient-to-b from-gray-200 from-15% to-[#14323D] p-6">
						<h3>{t('telegram.title')}</h3>
						<p className="text-gray-900">{t('telegram.description')}</p>
						<button className="mt-2 bg-blue-500 text-gray-900">{t('telegram.button')}</button>
					</div>
				</div>
			</div>
		</section>
	)
}

interface CardProps {
	date: string
	price: string
	initalPrice: string
	discountPercent: string
	from: string
	to: string
	fromTime: string
	toTime: string
	fromAirport: string
	toAirport: string
	howLong: string
}

function Card(props: CardProps) {
	const {
		date,
		price,
		initalPrice,
		discountPercent,
		from,
		to,
		fromTime,
		toTime,
		fromAirport,
		toAirport,
		howLong,
	} = props

	return (
		<div className="card gap-3 bg-gray-100 p-6">
			<div className="flex-row justify-between">
				<p className="text-sm">{date}</p>
				<button>inquire</button>
			</div>
			<div className="flex-row items-start gap-2">
				<h3 className="font-sans text-3xl font-black">{price}</h3>
				<p className="text-xs line-through">{initalPrice}</p>
				<p className="rounded-lg bg-red-500 px-1 text-xs font-bold text-gray-900">
					{discountPercent}
				</p>
			</div>
			<div className="flex-row">
				<p>
					{from}({fromAirport})
				</p>
				<p>{' -> '}</p>
				<p>
					{to}({toAirport})
				</p>
			</div>
			<div className="flex-row">
				<div>
					<p>{fromTime}</p>
					<p>{fromAirport}</p>
				</div>
				<p>{' -> '}</p>
				<div>
					<p>{toTime}</p>
					<p>{toAirport}</p>
				</div>
				<p>{howLong}</p>
			</div>
		</div>
	)
}
