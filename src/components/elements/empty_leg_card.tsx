'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Counter } from '../elements'

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

export function EmptyLegCard(props: CardProps) {
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
		<motion.div
			className='card gap-3 bg-gray-100 p-6'
			initial={{ opacity: 0, y: -50 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<div className='flex-row justify-between'>
				<p className='text-sm'>{date}</p>
				<Link href='?showBooking=Empty-legs' scroll={false}>
					<button>inquire</button>
				</Link>
			</div>
			<div className='flex-row items-start gap-2'>
				<Counter className='font-sans text-3xl font-black text-gray-900'>{price}</Counter>
				<p className='text-xs line-through'>{initalPrice}</p>
				<p className='rounded-lg bg-red-500 px-1 text-xs font-bold text-gray-900'>
					{discountPercent}
				</p>
			</div>
			<div className='flex-row'>
				<p>
					{from}({fromAirport})
				</p>
				<p>{' -> '}</p>
				<p>
					{to}({toAirport})
				</p>
			</div>
			<div className='flex-row'>
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
		</motion.div>
	)
}
