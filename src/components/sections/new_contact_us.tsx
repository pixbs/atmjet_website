'use client'

import ArrowTR from '@/assets/svg/arrow-tr.svg'
import { motion } from 'framer-motion'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useInView } from 'react-intersection-observer'
import { BookingForm } from '../form'

export default function NewContactUs() {
	const router = useRouter()
	const locale = useLocale()
	const handleClose = () => {
		router.push('')
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
						className='w-full'
						initial={{ opacity: 0, y: -100 }}
						animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
						transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
					>
						<Link
							href='https://t.me/melentev1'
							className='card peer flex flex-col items-start gap-4 border-0 bg-gradient-to-b from-gray-100 from-15% to-[#14323D] p-10 transition-all ease-out hover:border-gray-900 hover:from-25% md:bg-fixed'
						>
							<h3>Telegram</h3>
							<p className='text-gray-900'>
								{locale === 'ru'
									? 'Управляйте своими запросами и бронированиями на ходу через приватный чат с нашей командой'
									: 'Manage your enquiries and bookings on go via private chat with our team'}
							</p>
							<ArrowTR className='mt-5 h-5 stroke-none text-gray-900 peer-hover:translate-x-10' />
						</Link>
					</motion.div>
					<motion.div
						className='w-full'
						initial={{ opacity: 0, y: -100 }}
						animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
						transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
					>
						<Link
							href='https://wa.me/971504589926'
							className='card peer flex flex-col items-start gap-4 border-0 bg-gradient-to-b from-gray-100 from-15% to-[#0e2a15] p-10 transition-all ease-out hover:border-gray-900 hover:from-25% md:bg-fixed'
						>
							<h3>Whatsapp</h3>
							<p className='text-gray-900'>
								{locale === 'ru'
									? 'Получайте мгновенную поддержку и ответы на ваши вопросы непосредственно от нашей команды'
									: 'Get instant support and answers to your questions directly from our team'}
							</p>
							<ArrowTR className='mt-5 h-5 stroke-none text-gray-900 peer-hover:translate-x-10' />
						</Link>
					</motion.div>
				</div>
				<div className='gap-10 lg:flex-row'>
					<motion.div
						className='card w-full p-10 lg:w-2/3 lg:p-16'
						initial={{ opacity: 0, y: -100 }}
						animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -100 }}
						transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
					>
						<BookingForm host='contact_us' close={handleClose} />
					</motion.div>
					<motion.div
						className='card w-full justify-center gap-4 p-10 lg:w-1/3'
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
								+971 (50) 458-99-26
							</h3>
						</Link>
						<p>
							{locale == 'ru' ? 'Телефонная линия открыта 24/7' : 'Telephone line is open 24/7'}
						</p>
					</motion.div>
				</div>
			</div>
		</section>
	)
}
