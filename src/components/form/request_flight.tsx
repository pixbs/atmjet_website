'use client'

import { useTranslations } from 'next-intl'
import { CounterInput } from '../elements'
import { z } from 'zod'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
	from: z.string().nonempty('From is required'),
	to: z.string().nonempty('To is required'),
	date: z
		.string()
		.nonempty('Date is required')
		.refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
	passangers: z.number().min(1, 'At least one passenger is required'),
})

export function RequestForm() {
	const t = useTranslations('form')
	type FormData = z.infer<typeof schema>
	const methods = useForm<FormData>({
		resolver: zodResolver(schema),
	})

	const { register, handleSubmit } = methods

	const onSubmit = (data: FormData) => {
		console.log(data)
	}

	const handleClick = () => {
		const input = document.querySelector('input[type="date"]') as HTMLInputElement
		if (input) {
			input.focus()
		}
	}

	return (
		<FormProvider {...methods}>
			<form className='flex flex-col gap-1' onSubmit={handleSubmit(onSubmit)}>
				<input placeholder={t('from')} {...register('from')} />
				<input placeholder={t('to')} {...register('to')} />
				<div className='rounded-2xl bg-gray-900' onClick={handleClick}>
					<input type='date' placeholder={t('date')} {...register('date')} />
				</div>
				<CounterInput label={t('passangers')} id='passangers' />
				<button type='submit' className='big mt-3 bg-gold bg-fixed'>
					{t('request-quote')}
				</button>
			</form>
		</FormProvider>
	)
}
