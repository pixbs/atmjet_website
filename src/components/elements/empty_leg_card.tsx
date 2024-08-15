'use client'

import { motion } from 'framer-motion'
import { airports, db, emptyLegs } from '@/lib/drizzle'
import Link from 'next/link'
import { Counter } from '../elements'
import { ilike } from 'drizzle-orm'

export function EmptyLegCard(props: typeof emptyLegs.$inferSelect) {

	const findByICAO = async (icao: string) => {
		const airport = await db.select().from(airports).where(ilike(airports.icaoCode, `%${icao}%`)).limit(1)
		return airport[0].nameEng ?? 'N/A'
	}

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
					'-40%'
				</p>
			</div>
			<div className='flex-row'>
				<p>
					{props.from}({findByICAO(props.from)})
				</p>
				<p>{' -> '}</p>
				<p>
					{props.to}({findByICAO(props.to)})
				</p>
			</div>
		</motion.div>
	)
}
