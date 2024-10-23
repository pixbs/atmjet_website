'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Counter } from './counter'

interface WhyUsCardProps {
	num?: string
	title: string
	description: string
	imageSrc?: string
	topPadding?: number
}

export function WhyUsCard(props: WhyUsCardProps) {
	const { num, title, description, topPadding, imageSrc } = props

	return (
		<motion.div
			className='card sticky -mb-16 gap-4 overflow-hidden bg-gray-150 bg-opacity-90 pb-24 backdrop-blur-lg last:mb-0 last:pb-10 md:flex-row md:gap-16 md:py-0 md:last:pb-0'
			initial={{ opacity: 0, y: -50 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1, y: 0 }}
			style={{ top: `${topPadding}px` }}
		>
			<div className='gap-4 p-8 md:w-full md:pb-24 md:pt-16'>
				{!!num && (
					<Counter className='bg-gold bg-clip-text font-serif text-6xl text-transparent md:bg-fixed'>
						{num}
					</Counter>
				)}
				<h3>{title}</h3>
				<p>{description}</p>
			</div>
			{!!imageSrc && (
				<Image
					src={imageSrc}
					alt={title}
					className='aspect-video w-full object-cover object-center lg:w-1/2'
					loading='lazy'
					width={1200}
					height={1200}
				/>
			)}
		</motion.div>
	)
}
