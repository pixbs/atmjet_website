import { useTranslations } from 'next-intl'
import { CounterInput } from '../elements'
import { z } from 'zod'
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const directionSchema = z.object({
	from: z.string().nonempty('From is required'),
	to: z.string().optional(),
	date: z
		.string()
		.nonempty('Date is required')
		.refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
	passangers: z.number().int().positive('Passangers must be a positive number'),
})

interface DirectionProps {
	index: number
}

export function Direction(props: DirectionProps) {
	const t = useTranslations('form')
	const { index } = props
	const {
		control,
		formState: { errors },
	} = useFormContext()

	return (
		<div className='gap-0.5 overflow-hidden rounded-xl'>
			<Controller
				control={control}
				name={`direction.${index}.from`}
				render={({ field }) => <input {...field} placeholder={t('from')} />}
			/>
			<Controller
				control={control}
				name={`direction.${index}.to`}
				render={({ field }) => <input {...field} placeholder={t('to')} />}
			/>
			<Controller
				control={control}
				name={`direction.${index}.date`}
				render={({ field }) => <input {...field} type='date' placeholder={t('date')} />}
			/>
			<Controller
				control={control}
				name={`direction.${index}.passangers`}
				render={({ field }) => (
					<CounterInput
						{...field}
						placeholder={t('passangers')}
						onChange={(e) => field.onChange(Number(e.target.value))}
					/>
				)}
			/>
		</div>
	)
}
