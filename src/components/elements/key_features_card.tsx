'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface KeyFeatureCardProps {
	title: string
	description: string
	imageSrc: string
}

export function KeyFeatureCard(props: KeyFeatureCardProps) {
	const { title, description, imageSrc } = props

	return (
		<motion.div
			className='embla__slide relative aspect-[3/4] w-full flex-shrink-0 justify-end gap-4 bg-cover pr-10 md:w-1/2'
			initial={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1 }}
		>
			<h3 className='z-10'>{title}</h3>
			<p className='z-10'>{description}</p>
			<Image
				src={imageSrc}
				className='absolute inset-0 h-full w-full object-cover object-center'
				alt={title}
				width={400}
				height={500}
			/>
			<div className='darkening absolute inset-0' />
		</motion.div>
	)
}
