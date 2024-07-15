'use client'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export function YachtsCard() {
	const t = useTranslations('yachts')

	return (
		<motion.div
			className='gap-10 overflow-hidden rounded-2xl bg-gray-150'
			initial={{ opacity: 0, y: -50 }}
			transition={{ duration: 0.5 }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<div className='min-h-64 bg-blue-500' />
			<div className='gap-8 px-6'>
				<motion.div
					className='gap-3'
					initial={{ opacity: 0, y: -50 }}
					transition={{ duration: 0.5 }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					<h3>{t('sub-title1')}</h3>
					<p>{t('sub-description1')}</p>
				</motion.div>
				<motion.div
					className='gap-3'
					initial={{ opacity: 0, y: -50 }}
					transition={{ duration: 0.5 }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					<h3>{t('sub-title2')}</h3>
					<p>{t('sub-description2')}</p>
				</motion.div>
				<motion.div
					className='gap-3'
					initial={{ opacity: 0, y: -50 }}
					transition={{ duration: 0.5 }}
					whileInView={{ opacity: 1, y: 0 }}
				>
					<h3>{t('sub-title3')}</h3>
					<p>{t('sub-description3')}</p>
				</motion.div>
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
