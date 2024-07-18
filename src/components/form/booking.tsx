'use client'

import { useTranslations } from 'next-intl'
import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import Checkmark from '@/assets/svg/checkmark.svg'

const schema = z.object({
	name: z.string().min(1).max(32),
	'phone-number': z.string().min(1).optional(),
	email: z.string().email(),
})

export function BookingForm() {
	const t = useTranslations('contact-form')
	const [submitted, setSubmitted] = useState(false)

	const methods = useForm({
		resolver: zodResolver(schema),
	})

	const { register, handleSubmit } = methods

	const onSubmit = (data: any) => {
		console.log(data)
		setSubmitted(true)
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
						{...register('phone-number')}
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
