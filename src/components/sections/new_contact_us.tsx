'use client'

import ArrowTR from '@/assets/svg/arrow-tr.svg'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { BookingForm } from '../form'

export default function NewContactUs() {
	const t = useTranslations()
	const handleClose = () => {
		console.log('done')
	}

	return (
		<section>
			<div className='container gap-10 py-20'>
				<div className='gap-10 lg:flex-row'>
					<div className='card w-full justify-center gap-4 p-10'>
						<Link href='mailto:info@atmjet.com' className=''>
							<h3 className='transition-opacity duration-300 ease-in-out hover:opacity-40'>
								info@atmjet.com
							</h3>
						</Link>
						<Link href='tel:+971(585)940-112'>
							<h3 className='transition-opacity duration-300 ease-in-out hover:opacity-40'>+971 (585) 940-112</h3>
						</Link>
						<p>Telephone line is open 24/7</p>
					</div>
					<Link href='tg:\\nesolve?domain=@atmjet1' className='peer flex flex-col card w-full items-start gap-4 border-0 bg-gradient-to-b from-gray-200 from-15% to-[#14323D] p-10 md:bg-fixed hover:from-25% hover:border-gray-900 transition-all ease-out'>
						<h3>Telegram</h3>
						<p className='text-gray-900'>Manage your enquiries and bookings on go via private chat with our team</p>
                        <ArrowTR className='stroke-none text-white h-5 mt-5 peer-hover:translate-x-10' />
					</Link>
				</div>
				<div className='card p-10 lg:p-16'>
					<BookingForm host='contact_us' close={handleClose} />
				</div>
			</div>
		</section>
	)
}
