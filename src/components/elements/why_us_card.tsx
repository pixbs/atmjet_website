'use client'

import { motion } from 'framer-motion'

interface CardProps {
	num: string
	title: string
	description: string
}

export function WhyUsCard(props: CardProps) {
	const { num, title, description } = props

	return (
		<motion.div
			className="card -mb-16 gap-4 bg-gray-150 p-8 pb-24 last:mb-0 last:pb-10"
			initial={{ opacity: 0, y: -50 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<p className="font-serif text-5xl">{num}</p>
			<h3>{title}</h3>
			<p>{description}</p>
		</motion.div>
	)
}
