'use client'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

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
			<div
				className='min-h-64 bg-cover bg-center'
				style={{ backgroundImage: 'url(images/home_page/yachts.jpg)' }}
			/>
			<div className='gap-8 px-6'>
				{cards.map((card, index) => (
					<motion.div
						key={index}
						className='gap-3'
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
				className='mx-6 mb-6 gap-6 rounded-2xl bg-gray-100 p-6'
				initial={{ opacity: 0, y: -50 }}
				transition={{ duration: 0.5 }}
				whileInView={{ opacity: 1, y: 0 }}
			>
				<h3>{t('call-to-action')}</h3>
				<button>{t('button')}</button>
			</motion.div>
		</motion.div>
	)
}
