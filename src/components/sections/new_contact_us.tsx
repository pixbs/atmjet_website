'use client'

import ArrowTR from '@/assets/svg/arrow-tr.svg'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useInView } from 'react-intersection-observer'
import { BookingForm } from '../form'

export default function NewContactUs() {
	const locale = useLocale()
	const handleClose = () => {
		console.log('done')
	}
	const [ref, inView] = useInView({
		triggerOnce: true, // Only trigger the animation once
		threshold: 0.5, // Percentage of the element's visibility required to trigger the animation
	})

	return (
		<section>
			<div className='container gap-10 py-20'>
				<div className='gap-10 lg:flex-row' ref={ref}>
					<motion.div
						className='card w-full justify-center gap-4 p-10'
						initial={{ opacity: 0, y: -100 }}
						animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
						transition={{ duration: 0.5, ease: 'easeOut', delay: 0 }}
					>
						<Link href='mailto:info@atmjet.com' className=''>
							<h3 className='transition-opacity duration-300 ease-in-out hover:opacity-40'>
								info@atmjet.com
							</h3>
						</Link>
						<Link href='tel:+971(585)940-112'>
							<h3 className='transition-opacity duration-300 ease-in-out hover:opacity-40'>
								+971 (585) 940-112
							</h3>
						</Link>
						<p>{locale == 'ru' ? "Телефонная линия открыта 24/7" : "Telephone line is open 24/7"}</p>
					</motion.div>
					<motion.div
						className='w-full'
						initial={{ opacity: 0, y: -100 }}
						animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
						transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
					>
						<Link
							href='tg:\\nesolve?domain=@atmjet1'
							className='card peer flex flex-col items-start gap-4 border-0 bg-gradient-to-b from-gray-100 from-15% to-[#14323D] p-10 transition-all ease-out hover:border-gray-900 hover:from-25% md:bg-fixed'
						>
							<h3>Telegram</h3>
							<p className='text-gray-900'>
								{locale === 'ru' ? "Управляйте своими запросами и бронированиями на ходу через приватный чат с нашей командой": "Manage your enquiries and bookings on go via private chat with our team"}
							</p>
							<ArrowTR className='mt-5 h-5 stroke-none text-white peer-hover:translate-x-10' />
						</Link>
					</motion.div>
				</div>
				<motion.div
					className='card p-10 lg:p-16'
					initial={{ opacity: 0, y: -100 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
					transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
				>
					<BookingForm host='contact_us' close={handleClose} />
				</motion.div>
			</div>
		</section>
	)
}
