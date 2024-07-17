'use client'

import { motion } from 'framer-motion'

interface TestimonialsCardProps {
	description: string
	name: string
	title: string
	imageSrc: string
}

export function TestimonialsCard(props: TestimonialsCardProps) {
	const { description, name, title, imageSrc } = props

	return (
		<motion.div
			className='embla__slide relative mr-8 flex w-full flex-shrink-0 flex-col items-stretch justify-between gap-3 overflow-hidden rounded-xl bg-cover bg-center p-8 last:mr-0'
			initial={{ opacity: 0 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1 }}
			style={{ backgroundImage: `url(${imageSrc})` }}
		>
			<div className='absolute inset-0 bg-gray-100 bg-opacity-90 backdrop-blur-xl' />
			<p className='z-10 h-64 pr-12 text-gray-900'>“{description}”</p>
			<div className='relative -mx-4 -mb-4 flex flex-col gap-1 rounded-xl bg-gray-150 p-4 pr-40'>
				<p className='font-serif text-xl text-gray-900'>{name}</p>
				<p>{title}</p>
				<div
					className='absolute bottom-3 right-4 size-32 rounded-2xl bg-cover bg-center'
					style={{ backgroundImage: `url(${imageSrc})` }}
				/>
			</div>
		</motion.div>
	)
}
