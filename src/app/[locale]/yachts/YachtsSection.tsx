'use client'

import { newYachts } from '@/lib/drizzle'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import YachtCard from './yacht_card'

interface YachtsSectionProps {
	yachts: (typeof newYachts.$inferSelect)[]
}

function YachtsSection({ yachts }: YachtsSectionProps) {
	const searchParams = useSearchParams()
	const sortBy = searchParams.get('sort')
	const order = searchParams.get('order')
	let price = [0, 1200]
	let length = [0, 10000000]
	let guests = [0, 20]

	switch (searchParams.get('price')) {
		case '1200':
			price = [0, 1200]
			break
		case '3500':
			price = [0, 3500]
			break
		case 'Lux':
			price = [3500, 10000000]
			break
		case 'All':
			price = [0, 10000000]
			break
		default:
			break
	}

	switch (searchParams.get('length')) {
		case 'all':
			length = [0, 10000000]
			break
		case '20':
			length = [0, 20]
			break
		case '40':
			length = [20, 40]
			break
		case '60':
			length = [40, 60]
			break
	}

	switch (searchParams.get('guests')) {
		case '15':
			guests = [0, 15]
			break
		case '30':
			guests = [15, 30]
			break
		case '60':
			guests = [30, 60]
			break
		case '60+':
			guests = [60, 10000000]
		case 'All':
			guests = [0, 10000000]
			break
	}

	const sortedYachts = yachts.filter(
		(yacht) =>
			(Number(yacht.guestsDay) || 0) >= guests[0] &&
			(Number(yacht.guestsDay) || 0) <= guests[1] &&
			(Number(yacht.length) || 0) >= length[0] &&
			(Number(yacht.length) || 0) <= length[1] &&
			(Number(yacht.customerPrice) || 0) >= price[0] &&
			(Number(yacht.customerPrice) || 0) <= price[1],
	)

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

	const locale = useLocale() as 'en' | 'ru'

	const yachtCards = sortedYachts.map((yacht) => (
		<YachtCard {...yacht} slug={`yachts/${yacht.slug}`} key={yacht.id} />
	))

	const empty = (
		<div className='col-span-full items-center gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 md:p-10'>
			<h3>No yachts found</h3>
			<Link href='/yachts'>
				<button className='btn btn-primary'>Reset filters</button>
			</Link>
		</div>
	)

	return (
		<section className='gap-10 md:py-16 md:pb-24'>
			<div className='container gap-10 md:grid md:grid-cols-2'>
				<h2 className='col-span-full self-center md:text-center'>
					{locale === 'en'
						? 'Yachts available for rent in Dubai'
						: 'Яхты доступные в аренду в Дубае'}
				</h2>
				{sortedYachts.length ? yachtCards : empty}
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
