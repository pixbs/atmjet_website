import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { AutoComplete, CounterInput } from '../elements'

export const directionSchema = z.object({
	from: z.string().nonempty('From is required'),
	to: z.string().optional(),
	date: z
		.string()
		.nonempty('Date is required')
		.refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' }),
	returnDate: z
		.string()
		.refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
		.optional(),
	passengers: z.number().int().positive('passengers must be a positive number'),
})

interface DirectionProps {
	index: number
	showReturn?: boolean
}

export function Direction(props: DirectionProps) {
	const t = useTranslations('form')
	const { index, showReturn = false } = props
	const { control } = useFormContext()

	return (
		<div className='w-full content-stretch items-stretch justify-stretch gap-0.5 rounded-xl lg:flex-row'>
			<Controller
				control={control}
				name={`direction.${index}.from`}
				render={({ field }) => (
					<div className='relative'>
						<label className='absolute left-4 top-4 z-10 text-xs font-semibold'>{t('from')}</label>
						<AutoComplete
							value={field.value}
							onChange={field.onChange}
							placeholder={t('from')}
							className='w-full rounded-t-xl pt-8 lg:h-full lg:min-w-40 lg:rounded-sm lg:rounded-l-xl'
						/>
					</div>
				)}
			/>
			<Controller
				control={control}
				name={`direction.${index}.to`}
				render={({ field }) => (
					<div className='relative'>
						<label className='absolute left-4 top-4 z-10 text-xs font-semibold'>{t('to')}</label>
						<AutoComplete
							value={field.value}
							onChange={field.onChange}
							placeholder={t('to')}
							className='w-full pt-8 lg:h-full lg:min-w-40'
						/>
					</div>
				)}
			/>
			<div className='w-full rounded-sm bg-gray-900'>
				<Controller
					control={control}
					name={`direction.${index}.date`}
					render={({ field }) => (
						<div className='relative'>
							<label className='absolute left-4 top-4 z-10 text-xs font-semibold'>
								{t('date')}
							</label>
							<input
								{...field}
								type='date'
								placeholder={t('date')}
								aria-placeholder={t('date')}
								className='min-h-16 w-full flex-shrink-0 pb-3 pt-7 text-sm lg:h-full'
							/>
						</div>
					)}
				/>
			</div>
			{showReturn && (
				<div className='relative w-full rounded-sm bg-gray-900'>
					<Controller
						control={control}
						name={`direction.${index}.returnDate`}
						render={({ field }) => (
							<input
								{...field}
								type='date'
								placeholder={t('date')}
								aria-placeholder={t('date')}
								className='min-h-16 w-full flex-shrink-0 lg:h-full'
							/>
						)}
					/>
				</div>
			)}
			<Controller
				control={control}
				name={`direction.${index}.passengers`}
				render={({ field }) => (
					<CounterInput
						{...field}
						placeholder={t('passengers')}
						onChange={(e) => field.onChange(Number(e.target.value))}
						className='w-full rounded-b-xl lg:rounded-sm lg:!rounded-r-xl'
					/>
				)}
			/>
		</div>
	)
}
