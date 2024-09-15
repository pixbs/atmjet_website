'use client'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

export function YachtsCard() {
	const t = useTranslations('yachts')
	const cards = ['card1', 'card2', 'card3']

	return (
		<motion.div
			className='gap-10 overflow-hidden rounded-2xl bg-gray-150'
			initial={{ opacity: 0, y: -50 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<Image
				src='/images/home_page/yachts.jpg'
				className='min-h-64 object-cover object-center'
				loading='lazy'
				alt={t('title')}
				width={1200}
				height={255}
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
						<h3>{t(card + '.title')}</h3>
						<p>{t(card + '.description')}</p>
					</motion.div>
				))}
			</div>
			<motion.div
				className='mx-6 mb-6 gap-4 overflow-hidden rounded-2xl bg-gray-100 md:text-center'
				initial={{ opacity: 0, y: -50 }}
				transition={{ duration: 0.5 }}
				whileInView={{ opacity: 1, y: 0 }}
			>
				<Image
					src='/images/atm_jet_group/yachts.jpg'
					alt={t('call-to-action')}
					className='mx-auto aspect-[3/1] w-full object-cover object-center'
					loading='lazy'
					width={1100}
					height={400}
				/>
				<div className='gap-6 p-6'>
					<h3>{t('call-to-action')}</h3>
					<Link href='/yachts'>
						<button className='md:self-center md:px-8'>{t('button')}</button>
					</Link>
				</div>
			</motion.div>
		</motion.div>
	)
}
