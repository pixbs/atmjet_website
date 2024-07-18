'use client'

import { useTranslations } from 'next-intl'
import { CounterInput } from '../elements'
import { z } from 'zod'
import { useForm, FormProvider, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
	const { buttonText, buttonClassName, max = 4 } = props
	const t = useTranslations('form')
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
		console.log(data)
	}

	const handleAppend = () => {
		append({ from: '', to: '', date: '', passengers: 1 })
	}

	const handleRemove = (index: number) => {
		remove(index)
	}

	return (
		<FormProvider {...methods}>
			<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
				{fields.map((field, index) => (
					<div key={field.id} className='flex flex-col gap-2'>
						<Direction index={index} />
						{index != 0 && (
							<button type='button' onClick={() => handleRemove(index)} className='self-end'>
								{t('delete-leg')}
							</button>
						)}
					</div>
				))}
				{fields.length < max && (
					<button type='button' onClick={handleAppend} className='self-start'>
						{t('add-leg')}
					</button>
				)}
				<button type='submit' className={buttonClassName || 'big'}>
					{buttonText || t('request-quote')}
				</button>
			</form>
		</FormProvider>
	)
}
