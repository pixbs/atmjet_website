'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Direction, directionSchema } from './direction'

const schema = z.object({
	direction: z.array(directionSchema),
})

type FormSchemaType = z.infer<typeof schema>

interface RequestFormProps {
	buttonText?: string
	buttonClassName?: string
	max?: number
}

export function RequestForm(props: RequestFormProps) {
	const searchParams = useSearchParams()
	const showConfirm = searchParams.get('confirm') === 'true'
	const t = useTranslations('form')

	const router = useRouter()
	const { buttonText, buttonClassName, max = 4 } = props
	const [isRoundTrip, setIsRoundTrip] = useState(false)
	const methods = useForm<FormSchemaType>({
		resolver: zodResolver(schema),
		defaultValues: {
			direction: [{ from: '', to: '', date: '', passengers: 1 }],
		},
	})
	const { control, handleSubmit } = methods
	const { fields, append, remove } = useFieldArray({
		control,
		name: 'direction',
	})

	const onSubmit = (data: FormSchemaType) => {
		methods.reset()
		router.push(`?showBooking=Flight_request&direction=${JSON.stringify(data.direction)}`, {
			scroll: false,
		})
	}

	const handleAppend = () => {
		append({ from: '', to: '', date: '', passengers: 1 })
	}

	const handleRemove = (index: number) => {
		remove(index)
	}

	const handeleRoundTrip = (state: boolean) => {
		if (!isRoundTrip) {
			remove()
			handleAppend()
		}
		setIsRoundTrip(!isRoundTrip)
	}

	// if (showConfirm) {
	// 	return (
	// 		<>
	// 			<h2 className='text-center'>{t('confirm')}</h2>
	// 			<Checkmark className='mx-auto my-10 h-20 stroke-none text-orange-200 duration-500 animate-in fade-in-0 slide-in-from-top-4' />
	// 		</>
	// 	)
	// }

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6 lg:gap-3'>
				{fields.map((field, index) => (
					<div key={field.id} className='flex flex-col gap-2 lg:flex-row'>
						<Direction index={index} showReturn={isRoundTrip} />
						{index != 0 && (
							<button
								type='button'
								onClick={() => handleRemove(index)}
								className='self-end border border-gray-300 bg-gray-100 text-gray-900 lg:h-14 lg:w-48'
							>
								{t('delete-leg')}
							</button>
						)}
						{index == 0 && (
							<button
								type='submit'
								className={`w-48 ${buttonClassName} hidden lg:flex lg:items-center lg:justify-center`}
							>
								{buttonText || t('request-quote')}
							</button>
						)}
					</div>
				))}
				<div className='flex-row flex-wrap justify-between gap-4'>
					<div className='flex-row gap-1 rounded-full border border-gray-500 p-0.5'>
						<button
							onClick={() => handeleRoundTrip(false)}
							className={`${isRoundTrip ? 'bg-gray-100 text-gray-900' : 'bg-gray-300 text-gray-800'}`}
						>
							{t('multi-leg')}
						</button>
						<button
							onClick={() => handeleRoundTrip(true)}
							className={`${isRoundTrip ? 'bg-gray-300 text-gray-800' : 'bg-gray-100 text-gray-900'}`}
						>
							{t('round-trip')}
						</button>
					</div>
					{fields.length < max && !isRoundTrip && (
						<button
							type='button'
							onClick={handleAppend}
							className='self-start border border-gray-300 bg-gray-100 text-gray-900'
						>
							{t('add-leg')}
						</button>
					)}
				</div>
				<button type='submit' className={`big lg:hidden ${buttonClassName}`}>
					{buttonText || t('request-quote')}
				</button>
			</form>
		</FormProvider>
	)
}
