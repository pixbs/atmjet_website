'use client'

import { useTranslations } from 'next-intl'
import { useRef } from 'react'
import { BookingForm } from '../form'
import Link from 'next/link'
import ArrowTopRight from '@/assets/svg/arrow-top-right.svg'

interface BookingModalProps {
	closeModal: () => void
}

export function BookingModal({ closeModal }: BookingModalProps) {
	const t = useTranslations()
	const containerRef = useRef<HTMLDivElement>(null)

	const handleClickOutside = (event: React.MouseEvent) => {
		if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
			closeModal()
		}
	}

	return (
		<section
			className='fixed inset-0 z-50 bg-gray-150 bg-opacity-40 backdrop-blur-sm duration-300 animate-in fade-in-0'
			onClick={handleClickOutside}
		>
			<div
				ref={containerRef}
				className='container mx-auto gap-8 rounded-2xl bg-gray-150 stroke-gray-800 stroke-1 !p-10'
			>
				<BookingForm />
				<div className='[&>*]:duration-600 flex-row items-center justify-center gap-4 [&>*]:animate-in [&>*]:fade-in'>
					<Link href='/' className='flex items-center text-base'>
						{t('social-media.telegram')}
						<ArrowTopRight className='size-10' />
					</Link>
					<Link href='/' className='flex items-center text-base'>
						{t('social-media.whats-app')}
						<ArrowTopRight className='size-10' />
					</Link>
					<Link href='/' className='flex items-center text-base'>
						{t('social-media.instagram')}
						<ArrowTopRight className='size-10' />
					</Link>
				</div>
				<Link href='tel:+971585940112' className='!-mt-6 text-center text-base text-gray-700'>
					{t('footer.phone')}
				</Link>
			</div>
		</section>
	)
}
