'use client'

import { motion } from 'framer-motion'

interface KeyFeatureCardProps {
	title: string
	description: string
	imageSrc: string
}

export function KeyFeatureCard(props: KeyFeatureCardProps) {
	const { title, description, imageSrc } = props

	return (
		<motion.div
			className='embla__slide relative aspect-square w-full flex-shrink-0 justify-end gap-4 bg-cover pr-24'
			initial={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1 }}
			style={{ backgroundImage: `url(${imageSrc})` }}
		>
			<h3 className='z-10'>{title}</h3>
			<p className='z-10'>{description}</p>
			<div className='darkening absolute inset-0' />
		</motion.div>
	)
}
