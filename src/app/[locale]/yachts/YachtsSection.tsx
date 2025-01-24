'use client'

import { newYachts } from '@/lib/drizzle'
import { useLocale } from 'next-intl'
import Link from 'next/link'
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
	const price = searchParams.get('price')
	const length = searchParams.get('length')
	const guests = searchParams.get('guests')
	const router = useRouter()
	const sortedYachts = yachts.filter(
		(yacht) =>
			(Number(yacht.customerPrice) || 0) <= (Number(price) || 1000000) &&
			(Number(yacht.length) || 0) <= (Number(length) || 100) &&
			(Number(yacht.guestsDay) || 0) <= (Number(guests) || 100),
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

	const createQueryString = useCallback(
		(name: string, value: string) => {
			const params = new URLSearchParams(searchParams.toString())
			params.set(name, value)

			return params.toString()
		},
		[searchParams],
	)

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
