'use client'

import { Slider } from '@/components/ui/slider'
import { useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState } from 'react'

interface FilterSectionProps {
	lenght?: React.ComponentProps<typeof Slider>
	guests?: React.ComponentProps<typeof Slider>
	price?: React.ComponentProps<typeof Slider>
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
	const [length, setLength] = useState([
		Number(searchParams.get('lengthMin')) || 0,
		Number(searchParams.get('lengthMax')) || 62,
	])
	const [price, setPrice] = useState([
		Number(searchParams.get('priceMin')) || 0,
		Number(searchParams.get('priceMax')) || 1200,
	])

	const [guests, setGuests] = useState([
		Number(searchParams.get('guestsMin')) || 0,
		Number(searchParams.get('guestsMax')) || 20,
	])
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
		console.log(JSON.stringify(Object.fromEntries(formData.entries())))
		const filters = {
			guests: formData.get('guests'),
			price: formData.get('price'),
			length: formData.get('lenght'),
			sort: formData.get('sort'),
			order: formData.get('order'),
			yearBuilt: formData.get('year-built'),
		}
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
						{/* <DualRange
							value={guests}
							onValueChange={setGuests}
							label={locale === 'en' ? 'Guests' : 'Гости'}
							name='guests'
							id='guests'
							{...guestsRange}
						/> */}
						<Select
							label={locale === 'en' ? 'Guests' : 'Гости'}
							name='guests'
							id='guests'
							className='w-full'
							defaultValue='15'
						>
							<option value='15'>{locale === 'en' ? 'To 15 guests' : 'До 15 гостей'}</option>
							<option value='30'>
								{locale === 'en' ? 'From 15 to 30 guests' : 'От 15 до 30 гостей'}
							</option>
							<option value='60'>
								{locale === 'en' ? 'From 30 to 60 guests' : 'От 30 до 60 гостей'}
							</option>
							<option value='60+'>{locale === 'en' ? 'More than 60' : 'Более 60 гостей'}</option>
							<option value='All'>{locale === 'en' ? 'All' : 'Все'}</option>
						</Select>
						{/* <DualRange
							value={price}
							onValueChange={setPrice}
							label={locale === 'en' ? 'Price' : 'Цена'}
							name='price'
							unit='AED'
							id='price'
							{...priceRange}
						/> */}
						<Select
							label={locale === 'en' ? 'Price' : 'Цена'}
							name='price'
							id='price'
							className='w-full'
							defaultValue='1200'
						>
							<option value='1200'>{locale === 'en' ? 'To 1200 AED' : 'До 1200 AED'}</option>
							<option value='3500'>{locale === 'en' ? 'To 3500 AED' : 'До 3500 AED'}</option>
							<option value='Lux'>{locale === 'en' ? 'Lux' : 'Люкс'}</option>
							<option value='All'>{locale === 'en' ? 'All' : 'Все'}</option>
						</Select>
						{/* <DualRange
							value={length}
							onValueChange={setLength}
							label={locale === 'en' ? 'Length' : 'Длина'}
							unit='/ft'
							name='length'
							id='length'
							{...lenghtRange}
						/> */}
						<Select
							name='lenght'
							className='w-full'
							defaultValue='all'
							label={locale === 'en' ? 'Length ft' : 'Длина футы'}
							id='lenght'
						>
							<option value='all'>{locale === 'en' ? 'All' : 'Все'}</option>
							<option value='20'>{locale === 'en' ? 'To 20 ft' : 'До 20 фт'}</option>
							<option value='40'>{locale === 'en' ? 'From 20 to 40 ft' : 'От 20 до 40 фт'}</option>
							<option value='60'>{locale === 'en' ? 'From 40 to 60 ft' : 'От 40 до 60 фт'}</option>
						</Select>
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
			<label
				htmlFor={name}
				className='pointer-events-none absolute left-6 top-3 text-xs font-semibold text-gray-500'
			>
				{label}
			</label>
			<div className='w-full bg-gold px-6' />
			<input
				type='range'
				className={`w-full cursor-pointer appearance-none !bg-none py-0 accent-gray-500 focus:outline-none focus:ring-0 ${className}`}
				name={id || name}
				onChange={onChange}
				{...rest}
			/>
			<div className='pointer-events-none absolute inset-x-6 inset-y-0 flex-row items-center'>
				<div className='h-2 rounded-full bg-gold' style={{ width: `${progress}%` }} />
				<div className='h-2 flex-1 rounded-full bg-gray-600' />
			</div>

			<p className='pointer-events-none absolute inset-x-6 bottom-2 flex flex-row justify-between text-sm'>
				<span>{rest.min}</span>
				<span className='font-bold'>{value}</span>
				<span>{rest.max}</span>
			</p>
		</div>
	)
}

export default FilterSection
