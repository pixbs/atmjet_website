'use client'

import { motion } from 'framer-motion'
import { Counter } from './counter'

interface CardProps {
	num: string
	title: string
	description: string
	imageSrc: string
	topPadding?: number
}

export function WhyUsCard(props: CardProps) {
	const { num, title, description, topPadding, imageSrc } = props

	return (
		<motion.div
			className='card sticky -mb-16 gap-4 bg-gray-150 p-8 pb-24 last:mb-0 last:pb-10 md:flex-row md:gap-40'
			initial={{ opacity: 0, y: -50 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1, y: 0 }}
			style={{ top: `${topPadding}px` }}
		>
			<div className='gap-4 md:w-1/2'>
				<Counter className='bg-gold bg-fixed bg-clip-text font-serif text-6xl text-transparent'>
					{num}
				</Counter>
				<h3>{title}</h3>
				<p>{description}</p>
			</div>
			<div
				className='-mx-9 -mb-12 h-48 bg-cover bg-center md:w-1/2'
				style={{ backgroundImage: `url(${imageSrc})` }}
			/>
		</motion.div>
	)
}
