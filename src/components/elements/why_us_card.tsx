'use client'

import { motion } from 'framer-motion'
import { Counter } from './counter'

interface CardProps {
	num: string
	title: string
	description: string
	topPadding?: number
}

export function WhyUsCard(props: CardProps) {
	const { num, title, description, topPadding } = props

	return (
		<motion.div
			className="card sticky -mb-16 gap-4 bg-gray-150 p-8 pb-24 last:mb-0 last:pb-10"
			initial={{ opacity: 0, y: -50 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1, y: 0 }}
			style={{ top: `${topPadding}px` }}
		>
			<Counter className="bg-gold bg-fixed bg-clip-text font-serif text-5xl text-transparent">
				{num}
			</Counter>
			<h3>{title}</h3>
			<p>{description}</p>
		</motion.div>
	)
}
