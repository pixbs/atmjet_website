'use client'
import { useState } from 'react'
import { BookingModal } from './booking_modal'

interface ContactUsSectionProps {
	title: string
	description: string
	buttonText: string
	imageSrc: string
}

export function ContactUsSection(props: ContactUsSectionProps) {
	const [isOpened, setIsOpened] = useState(false)
	const { title, description, buttonText } = props

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
			<section
				className='bg-cover bg-fixed bg-center'
				style={{ backgroundImage: `url(${props.imageSrc})` }}
			>
				<div className='hero-darkening absolute inset-0' />
				<div className='container min-h-svh content-center items-center justify-center lg:min-h-[50svh]'>
					<h2>{title}</h2>
					<p className='pt-4'>{description}</p>
					<button className='big mt-10' onClick={handleOpen}>
						{buttonText}
					</button>
				</div>
			</section>
			{isOpened && <BookingModal closeModal={handleClose} />}
		</>
	)
}
