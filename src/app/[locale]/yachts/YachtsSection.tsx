'use client'

import { newYachts } from '@/lib/drizzle'
import { useLocale } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import YachtCard from './yacht_card'

interface YachtsSectionProps {
	yachts: (typeof newYachts.$inferSelect)[]
}

function YachtsSection({ yachts }: YachtsSectionProps) {
	const searchParams = useSearchParams()
	const sortBy = searchParams.get('sort')
	const order = searchParams.get('order')
	const router = useRouter()
	const sortedYachts = [...yachts]
	switch (sortBy) {
		case 'price':
			sortedYachts.sort((a, b) => (Number(a.customerPrice) ?? 0) - (Number(b.customerPrice) ?? 0))
			break
		case 'length':
			sortedYachts.sort((a, b) => (Number(a.length) ?? 0) - (Number(b.length) ?? 0))
			break
		case 'guests':
			sortedYachts.sort((a, b) => (Number(a.guestsDay) ?? 0) - (Number(b.guestsDay) ?? 0))
			break
		default:
			break
	}
	if (order === 'desc') sortedYachts.reverse()

	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set(name, value)

			return params.toString()
		},
		[searchParams],
	)

	const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const sort = e.target.value
		const querySting = createQueryString('sort', sort)
		router.replace(`?${querySting}`, { scroll: false })
	}

	const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const order = e.target.value
		const querySting = createQueryString('order', order)
		router.replace(`?${querySting}`, { scroll: false })
	}

	const locale = useLocale() as 'en' | 'ru'
	return (
		<section className='gap-10 md:py-16 md:pb-24'>
			<div className='container gap-10 md:grid md:grid-cols-2'>
				<h2 className='col-span-full self-center md:text-center'>
					{locale === 'en'
						? 'Yachts available for rent in Dubai'
						: 'Яхты доступные в аренду в Дубае'}
				</h2>
				<div className='col-span-full gap-x-2 gap-y-10 rounded-3xl border border-gray-300 bg-gray-150 p-6 md:p-10'>
					<h3 className='col-span-full'>
						{locale === 'en' ? 'Filter yachts' : 'Фильтровать яхты'}
					</h3>
					<div className='gap-1 overflow-hidden rounded-2xl border border-gray-300 bg-gray-150 p-0 md:flex-row'>
						<Select
							name='sort'
							className='w-full'
							defaultValue={sortBy || 'price'}
							onChange={handleSortChange}
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
							onChange={handleOrderChange}
							label={locale === 'en' ? 'Order' : 'Порядок'}
							id='order'
						>
							<option value='asc'>{locale === 'en' ? 'Ascending' : 'Возрастанию'}</option>
							<option value='desc'>{locale === 'en' ? 'Descending' : 'Убыванию'}</option>
						</Select>
					</div>
				</div>
				{sortedYachts.map((yacht) => (
					<YachtCard {...yacht} slug={`yachts/${yacht.slug}`} key={yacht.id} />
				))}
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
		<div className={`relative w-full bg-gray-900 pr-6 text-gray-100`}>
			<label htmlFor={name} className='absolute left-7 top-4 text-xs font-semibold text-gray-500'>
				{label}
			</label>
			<select className={`pb-4 pl-6 pt-9 ${className}`} name={id || name} {...rest}>
				{children}
			</select>
		</div>
	)
}

export default YachtsSection
