'use client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { BookingModal } from './booking_modal'

export function PersonalFlightManagerSection() {
	const t = useTranslations('personal-flight-manager')
	const [isOpened, setIsOpened] = useState(false)

	const handleOpen = () => {
		setIsOpened(true)
		isOpened ? (document.body.style.overflow = 'auto') : (document.body.style.overflow = 'hidden')
	}

	const handleClose = () => {
		setIsOpened(false)
		document.body.style.overflow = 'auto'
	}

	return (
		<>
			<section>
				<div className='container'>
					<div className='card gap-8 bg-gray-150 p-8 md:gap-10 md:p-10'>
						<div className='gap-4'>
							<h2 className='md:text-center'>{t('title')}</h2>
							<p className='md:text-center'>{t('description')}</p>
						</div>
						<div className='gap-6'>
							<hr />
							<h3 className='bg-gold bg-clip-text text-transparent lg:text-center'>
								{t('subtitle')}
							</h3>
							<hr />
						</div>
						<button className='big self-center' onClick={handleOpen}>
							{t('button')}
						</button>
					</div>
				</div>
			</section>
			{isOpened && <BookingModal closeModal={handleClose} />}
		</>
	)
}
