import { useTranslations } from 'next-intl'
import { AutoComplete, CounterInput } from '../elements'
import { z } from 'zod'
import { useFormContext, Controller } from 'react-hook-form'

export const directionSchema = z.object({
	from: z.string().nonempty('From is required'),
	to: z.string().optional(),
	date: z
		.string()
		.nonempty('Date is required')
		.refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
	passengers: z.number().int().positive('passengers must be a positive number'),
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
		<div className='gap-0.5 rounded-xl'>
			<Controller
				control={control}
				name={`direction.${index}.from`}
				render={({ field }) => (
					<AutoComplete
						value={field.value}
						onChange={field.onChange}
						placeholder={t('from')}
						className='rounded-t-xl'
					/>
				)}
			/>
			<Controller
				control={control}
				name={`direction.${index}.to`}
				render={({ field }) => (
					<AutoComplete value={field.value} onChange={field.onChange} placeholder={t('to')} />
				)}
			/>
			<div className='rounded-sm bg-gray-900'>
				<Controller
					control={control}
					name={`direction.${index}.date`}
					render={({ field }) => (
						<input {...field} type='date' placeholder={t('date')} className='w-full' />
					)}
				/>
			</div>
			<Controller
				control={control}
				name={`direction.${index}.passengers`}
				render={({ field }) => (
					<CounterInput
						{...field}
						placeholder={t('passengers')}
						onChange={(e) => field.onChange(Number(e.target.value))}
						className='rounded-b-xl'
					/>
				)}
			/>
		</div>
	)
}