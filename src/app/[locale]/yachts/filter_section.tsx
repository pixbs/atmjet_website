'use client'

import { useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface FilterSectionProps {
	lenght?: React.InputHTMLAttributes<HTMLInputElement>
	guests?: React.InputHTMLAttributes<HTMLInputElement>
	price?: React.InputHTMLAttributes<HTMLInputElement>
}

function FilterSection({
	lenght: lenghtRange,
	guests: guestsRange,
	price: priceRange,
}: FilterSectionProps) {
	const locale = useLocale() as 'en' | 'ru'

	const searchParams = useSearchParams()
	const sortBy = searchParams.get('sort')
	const order = searchParams.get('order')
	const price = searchParams.get('price')
	const length = searchParams.get('length')
	const guests = searchParams.get('guests')
	const router = useRouter()

	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set(name, value)

			return params.toString()
		},
		[searchParams],
	)

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)
		const filters = {
			length: formData.get('length'),
			guests: formData.get('guests'),
			price: formData.get('price'),
			sort: formData.get('sort'),
			order: formData.get('order'),
		}
		console.log(filters)
		const params = new URLSearchParams()
		Object.entries(filters).forEach(([key, value]) => {
			if (value) params.set(key, value as string)
		})
		router.push(`?${params.toString()}`, { scroll: false })
	}

	return (
		<section>
			<div className='container'>
				<form
					className='flex flex-col gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 md:p-10'
					onSubmit={handleSubmit}
				>
					<h3 className='col-span-full'>
						{locale === 'en' ? 'Filter yachts' : 'Фильтровать яхты'}
					</h3>
					<div className='grid gap-[2px] overflow-hidden rounded-2xl md:grid-cols-3 md:gap-4 md:rounded-none'>
						<Range
							defaultValue={guests || guestsRange?.max}
							label={locale === 'en' ? 'Guests (up to)' : 'Гости (до)'}
							name='guests'
							id='guests'
							{...guestsRange}
						/>
						<Range
							defaultValue={price || priceRange?.max}
							label={locale === 'en' ? 'Price (up to)' : 'Цена (до)'}
							name='price'
							id='price'
							{...priceRange}
						/>
						<Range
							defaultValue={length || lenghtRange?.max}
							label={locale === 'en' ? 'Length/ft (up to)' : 'Длина/фт (до)'}
							name='length'
							id='length'
							{...lenghtRange}
						/>
						<Select
							name='sort'
							className='w-full'
							defaultValue={sortBy || 'price'}
							label={locale === 'en' ? 'Sort by' : 'Сортировать по'}
							id='sort'
						>
							<option value='price'>{locale === 'en' ? 'Price' : 'Цена'}</option>
							<option value='length'>{locale === 'en' ? 'Length' : 'Длина'}</option>
							<option value='guests'>{locale === 'en' ? 'Guests' : 'Гости'}</option>
						</Select>
						<Select
							name='order'
							className='w-full'
							defaultValue={order || 'asc'}
							label={locale === 'en' ? 'Order' : 'Порядок'}
							id='order'
						>
							<option value='asc'>{locale === 'en' ? 'Ascending' : 'Возрастанию'}</option>
							<option value='desc'>{locale === 'en' ? 'Descending' : 'Убыванию'}</option>
						</Select>
					</div>
					<button type='submit' className='big !px-24 md:self-end'>
						{locale === 'en' ? 'Apply' : 'Применить'}
					</button>
				</form>
			</div>
		</section>
	)
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	children: React.ReactNode[]
	label?: string
}

function Select({ children, className, label, name, id, ...rest }: SelectProps) {
	return (
		<div className='relative w-full overflow-hidden bg-gray-900 text-gray-100 md:rounded-md'>
			<label htmlFor={name} className='absolute left-7 top-4 text-xs font-semibold text-gray-500'>
				{label}
			</label>
			<select
				className={`w-full appearance-none rounded-none border-none bg-gray-900 pb-4 pl-6 pt-9 outline-none focus:outline-none focus:ring-0 ${className}`}
				name={id || name}
				{...rest}
			>
				{children}
			</select>
		</div>
	)
}

interface RangeProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
}

function Range({ className, label, name, id, ...rest }: RangeProps) {
	rest.defaultValue = rest.defaultValue || rest.max
	let calcDefaultToProgress =
		((Number(rest.defaultValue) - Number(rest.min)) / (Number(rest.max) - Number(rest.min))) * 100
	if (Number(rest.defaultValue) <= Number(rest.min)) calcDefaultToProgress = 0
	if (Number(rest.defaultValue) >= Number(rest.max)) calcDefaultToProgress = 100
	const [progress, setProgress] = useState(calcDefaultToProgress)
	const [value, setValue] = useState(rest.defaultValue)
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const target = Number(e.target.value)
		const min = Number(rest.min)
		const max = Number(rest.max)
		const calcProgress = ((target - min) / (max - min)) * 100
		setProgress(calcProgress)
		setValue(target)
	}
	return (
		<div className='relative w-full overflow-hidden bg-gray-900 text-gray-100 md:rounded-md'>
			<label htmlFor={name} className='absolute left-7 top-4 text-xs font-semibold text-gray-500'>
				{label}
			</label>
			<div className='w-full bg-gold px-6' />
			<input
				type='range'
				className={`h-2 w-full cursor-pointer appearance-none rounded-lg pt-11 accent-gray-500 focus:outline-none focus:ring-0 ${className}`}
				name={id || name}
				onChange={onChange}
				{...rest}
			/>
			<div className='absolute inset-x-6 top-10 h-2 flex-row'>
				<div className='h-2 rounded-full bg-gold' style={{ width: `${progress}%` }} />
				<div className='h-2 flex-1 rounded-full bg-gray-600' />
			</div>

			<p className='flex flex-row justify-between px-6 pb-2 text-sm'>
				<span>{rest.min}</span>
				<span className='font-bold'>{value}</span>
				<span>{rest.max}</span>
			</p>
		</div>
	)
}

export default FilterSection
