'use client'

import Checkmark from '@/assets/svg/checkmark.svg'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'

const schema = z.object({
	name: z.string().min(1).max(32),
	phone_number: z.string().min(1).optional(),
	email: z.string().email(),
})

interface BookingFormProps {
	host: string
}

export function BookingForm(props : BookingFormProps) {
	const { host } = props
	const t = useTranslations('contact-form')
	const [submitted, setSubmitted] = useState(false)
	const locale = useLocale()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const booking = searchParams.get('showBooking')

	const methods = useForm({
		resolver: zodResolver(schema),
	})

	const { register, handleSubmit } = methods

	const onSubmit = async (data: any) => {
		console.log(data)

		try {
			await axios.post(`http://${host}/api/post_data?name=${data.name}&phone_number=${data.phone_number}&email=${data.email}&locale=${locale}&from=${booking}&path=${host+pathname}`)
			setSubmitted(true)
		} catch (error) {
			console.error(error)
		}
	}

	if (submitted) {
		return (
			<>
				<h2 className='text-center'>{t('confirm')}</h2>
				<Checkmark className='mx-auto my-10 h-20 stroke-none text-orange-200 duration-500 animate-in fade-in-0 slide-in-from-top-4' />
			</>
		)
	}

	return (
		<>
			<div className='gap-2'>
				<h2 className='text-center'>{t('title')}</h2>
				<p className='text-center'>{t('description')}</p>
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
