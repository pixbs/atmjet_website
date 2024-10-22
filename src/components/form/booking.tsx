'use client'

import { sendMessage } from '@/app/telegramBot'
import Checkmark from '@/assets/svg/checkmark.svg'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
	name: z.string().min(1).max(32),
	phone_number: z.string().min(1).optional(),
	email: z.string().email(),
})

interface BookingFormProps {
	host: string
	close: () => void
}

export function BookingForm(props: BookingFormProps) {
	const searchParams = useSearchParams()
	const showConfirm = searchParams.get('confirm') === 'true'
	const t = useTranslations('contact-form')

	const { host } = props
	const locale = useLocale()
	const pathname = usePathname()
	const booking = searchParams.get('showBooking')

	const directions = JSON.parse(searchParams.get('direction') || '{}')
	const router = useRouter()
	const methods = useForm({
		resolver: zodResolver(schema),
	})

	if (showConfirm) {
		return (
			<>
				<h2 className='text-center'>{t('confirm')}</h2>
				<Checkmark className='mx-auto my-10 h-20 stroke-none text-orange-200 duration-500 animate-in fade-in-0 slide-in-from-top-4' />
			</>
		)
	}

	const { register, handleSubmit } = methods

	const onSubmit = async (data: any) => {
		console.log(data)

		let result = `<i>Directions:</i>`
		if (directions.length) {
			directions.forEach(
				(direction: { from: string; to: string; date: string; passengers: number }) => {
					if (direction) {
						result += `
					<blockquote expandable>
					<i>From:</i>
					${direction.from}
					<i>To:</i>
					${direction.to}
					<i>Date:</i>
					${direction.date}
					<i>Passengers:</i>
					${direction.passengers}
					</blockquote>
					`
					}
				},
			)
		} else {
			result += `<i>None</i>`
		}

		const message = `
		<b>You got new request!</b>
		<i>Name:</i> ${data.name}
		<i>Locale:</i> ${locale}

		<i>Phone:</i>
		<code>${data.phone_number}</code>

		<i>Email:</i>
		${data.email}

		${result}

		<i>From:</i>
		${booking}, https://${host + pathname}
		`
		try {
			const response = await sendMessage(message)
			console.log(response)
		} catch (error) {
			console.error(error)
		} finally {
			props.close()
			// router.push(`?showBooking=true&confirm=true`, { scroll: false })
		}
	}

	return (
		<>
			<div className='gap-2'>
				<h2 className='text-center'>{t('title')}</h2>
				{/* <p className='text-center'>{t('description')}</p> */}
			</div>
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
					<label className='-mb-6 text-sm'>{t('name')}</label>
					<input
						className='dark'
						type='text'
						{...register('name')}
						placeholder={t('name-placeholder')}
					/>
					<label className='-mb-6 text-sm'>{t('phone-number')}</label>
					<input
						className='dark'
						type='tel'
						{...register('phone_number')}
						placeholder={t('phone-placeholder')}
					/>
					<label className='-mb-6 text-sm'>{t('email')}</label>
					<input
						className='dark'
						type='email'
						{...register('email')}
						placeholder={t('email-placeholder')}
					/>
					<button type='submit' className='big self-center !px-24'>
						{t('send')}
					</button>
				</form>
			</FormProvider>
		</>
	)
}
