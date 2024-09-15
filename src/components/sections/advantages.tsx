'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface AdvantagesSectionProps {
	title: string
	imageSrc: string
	cards: [
		{
			title: string
			description: string
		},
		{
			title: string
			description: string
		},
		{
			title: string
			description: string
		},
	]
}

export function AdvantagesSection(props: AdvantagesSectionProps) {
	const { title, cards } = props

	return (
		<section>
			<div className='container'>
				<h2 className='mb-4 text-center'>{title}</h2>
				<div className='gap-10 overflow-hidden rounded-2xl bg-gray-150'>
					<AdvantagesCard {...props} />
				</div>
			</div>
		</section>
	)
}

function AdvantagesCard(props: AdvantagesSectionProps) {
	const { imageSrc, title, cards } = props

	return (
		<motion.div
			className='gap-10 overflow-hidden rounded-2xl bg-gray-150 pb-8'
			initial={{ opacity: 0, y: -50 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<Image
				src={imageSrc}
				alt={title}
				className='aspect-[17/5] object-cover object-center'
				loading='lazy'
				width={1360}
				height={400}
			/>
			<div className='gap-8 px-6 md:flex-row'>
				{cards.map((card, index) => (
					<motion.div
						key={index}
						className='w-full gap-3'
						initial={{ opacity: 0, y: -50 }}
						transition={{ duration: 0.5 }}
						whileInView={{ opacity: 1, y: 0 }}
					>
						<h3 className='md:text-center'>{card.title}</h3>
						<p className='md:text-center'>{card.description}</p>
					</motion.div>
				))}
			</div>
		</motion.div>
	)
}
