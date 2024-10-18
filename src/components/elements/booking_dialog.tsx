'use client'

import ArrowTopRight from '@/assets/svg/arrow-top-right.svg'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { BookingForm } from '../form'

interface BookingDialogProps {
	host: string
	onClose?: () => void
	onConfirm?: () => void
}

export function BookingDialog(props: BookingDialogProps) {
	const { onClose, onConfirm, host } = props
	const t = useTranslations()
	const searchParams = useSearchParams()
	const pathname = usePathname()
	const router = useRouter()
	const dialogRef = useRef<null | HTMLDivElement>(null)
	const contentRef = useRef<null | HTMLDivElement>(null)
	const showDialog = searchParams.has('showBooking')

	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set(name, value)

			return params.toString()
		},
		[searchParams],
	)

	useEffect(() => {
		if (dialogRef.current) {
			if (showDialog) {
				dialogRef.current.style.display = 'flex'
				document.body.style.overflow = 'hidden'
			} else {
				dialogRef.current.style.display = 'none'
			}
		}
	}, [showDialog])

	if (!showDialog) {
		return null
	}

	const handleClickOutside = (event: React.MouseEvent) => {
		if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
			handleClose()
		}
	}

	const handleClose = () => {
		const confirm = searchParams.get('confirm') === 'true'
		document.body.style.overflow = 'auto'
		if (dialogRef.current) {
			dialogRef.current.style.display = 'none'
		}
		router.push(confirm ? '?confirm=true' : pathname, { scroll: false })

		onClose?.()
	}

	const handleConfirm = () => {
		onConfirm?.()
		handleClose()
	}

	return (
		<section
			className='fixed inset-0 z-50 overflow-y-auto bg-gray-150 bg-opacity-40 backdrop-blur-sm duration-300 animate-in fade-in-0'
			ref={dialogRef}
			onClick={handleClickOutside}
		>
			<div
				className='container mx-auto rounded-2xl bg-gray-150 stroke-gray-800 stroke-1 !p-10'
				ref={contentRef}
			>
				<div className='max-w-screen-md gap-8 self-center'>
					<BookingForm host={host} />
					<div className='[&>*]:duration-600 flex-row flex-wrap items-center justify-center gap-4 [&>*]:animate-in [&>*]:fade-in'>
						<Link href='tg:\\nesolve?domain=@atmjet1' className='flex items-center text-base'>
							{t('social-media.telegram')}
							<ArrowTopRight className='size-10' />
						</Link>
						<Link
							href='https://m.sitehelp.me/whatsappOfficial?siteId=kdjz1r9wpcb00x6o5ksiqxahidz566ll&clientId=kG1xsAPIwQrDwTJfGPC3vMikfU3QrfWo&url=whatsapp%3A%2F%2Fsend%3Fphone%3D971585940112'
							className='flex items-center text-base'
						>
							{t('social-media.whats-app')}
							<ArrowTopRight className='size-10' />
						</Link>
						<Link href='https://www.instagram.com/atmjet/' className='flex items-center text-base'>
							{t('social-media.instagram')}
							<ArrowTopRight className='size-10' />
						</Link>
					</div>
					<Link href='tel:+971585940112' className='!-mt-6 text-center text-base text-gray-700'>
						{t('footer.phone')}
					</Link>
				</div>
			</div>
		</section>
	)
}
