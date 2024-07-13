import { useTranslations } from "next-intl"

export function EmptyLegSection() {
	const t = useTranslations('empty_leg')
	const cards = ["card1", "card2", "card3", "card4"]
	return (
		<section>
			<div className="container">
				<h2>{t('title')}</h2>
				<p>{t('description')}</p>
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
			<div>
				<h3>{t('telegram.title')}</h3>
				<p>{t('telegram.description')}</p>
				<button>{t('telegram.button')}</button>
			</div>
			</div>
		</section>
	)
}

interface CardProps {
	date: string,
	price: string,
	initalPrice: string,
	discountPercent: string,
	from: string,
	to: string,
	fromTime: string,
	toTime: string,
	fromAirport: string,
	toAirport: string,
	howLong: string,
}

function Card (props: CardProps) {
	const { date, price, initalPrice, discountPercent, from, to, fromTime, toTime, fromAirport, toAirport, howLong } = props

	return (
		<div className="flex flex-col gap-3 p-6 items-stretch">
			<div className="flex flex-row content-between">
				<p>{date}</p>
				<button>inquire</button>
			</div>
			<div className="flex flex-row">
				<h3>{price}</h3>
				<p>{initalPrice}</p>
				<p>{discountPercent}</p>
			</div>
			<div className="flex flex-row">
				<p>{from}({fromAirport})</p>
				<p>{" -> "}</p>
				<p>{to}({toAirport})</p>
			</div>
			<div className="flex flex-row">
				<div>
					<p>{fromTime}</p>
					<p>{fromAirport}</p>
				</div>
				<p>{" -> "}</p>
				<div>
					<p>{toTime}</p>
					<p>{toAirport}</p>
				</div>
				<p>{howLong}</p>
			</div>
		</div>
	)
}

