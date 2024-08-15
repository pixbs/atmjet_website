'use client'

import { emptyLegs } from '@/lib/drizzle'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Counter } from '../elements'

type emptyLegs = typeof emptyLegs.$inferSelect

interface EmptyLegCardProps extends emptyLegs {
	fromAirport: string
	toAirport: string

}

export async function EmptyLegCard(props: EmptyLegCardProps) {

	return (
		<motion.div
			className='props gap-3 bg-gray-100 p-6'
			initial={{ opacity: 0, y: -50 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<div className='flex-row justify-between'>
				<p className='text-sm'>{`${new Date(props.start).toLocaleDateString(`en-US`, { month: 'long', day: 'numeric', year: 'numeric' })}`}</p>
				<Link href='?showBooking=Empty-legs' scroll={false}>
					<button>inquire</button>
				</Link>
			</div>
			<div className='flex-row items-start gap-2'>
				<Counter className='font-sans text-3xl font-black text-gray-900'>{`$${props.price?.toLocaleString() ?? 'N/A'}`}</Counter>
				<p className='text-xs line-through'>{'$' + ((props.price ? props.price : 0) * 2.5).toLocaleString() ?? 'N/A'}</p>
				<p className='rounded-lg bg-red-500 px-1 text-xs font-bold text-gray-900'>
					-60%
				</p>
			</div>
			<div className='flex-row gap-4'>
				<p>
				{props.fromAirport}({props.from.toUpperCase()})
				</p>
				<p>{' -> '}</p>
				<p>
					{props.toAirport}({props.to.toUpperCase()})
				</p>
			</div>
		</motion.div>
	)
}