import Beds from '@/assets/svg/f7_bed-double-fill.svg'
import Captain from '@/assets/svg/healthicons_security-worker.svg'
import People from '@/assets/svg/ion_people.svg'
import { yachts } from '@/lib/drizzle'
import { ReactNode } from 'react'
import { ImagesCarousel } from './images_carousel'

export function YachtCard(props: typeof yachts.$inferSelect) {
	const name = `${props.length}m ${props.shipyard} yacht ${props.name} (${props.location})`

	return (
		<div className='relative w-full shrink-0 gap-6 pr-4 md:gap-10 lg:flex-row'>
			<div className='relative w-full overflow-hidden rounded-xl'>
				<ImagesCarousel slides={props.pictures || []} />
			</div>
			<div className='flex-row justify-around lg:flex-col'>
				<Numeric title='Guests:' number={props.guests || 0}>
					<People />
				</Numeric>
				<Numeric title='Cabins:' number={props.cabins || 0}>
					<Beds />
				</Numeric>
				<Numeric title='Crew:' number={props.crew || 0}>
					<Captain />
				</Numeric>
			</div>
			<div className='min-w-80'>
				<TextLine title='Shipyard:' value={props.shipyard} />
				<TextLine title='Year built:' value={props.year} />
				<TextLine title='Length:' value={`${props.length} feet`} />
				<TextLine title='Beam:' value={props.beam} />
				<TextLine title='Draft:' value={props.draft} />
				<TextLine title='Cruising speed:' value={props.cruisingSpeed} />
				<TextLine title='Max speed:' value={props.maxSpeed} />
				<TextLine title='Location:' value={props.location} />
			</div>
		</div>
	)
}

interface NumericProps {
	children: ReactNode
	title: string
	number: string | number
}

function Numeric(props: NumericProps) {
	const { children, title, number } = props

	return (
		<div className='gap-2'>
			<p className='font-semibold text-gray-900'>{title}</p>
			<div className='flex-row gap-2'>
				{children}
				<h3>{number}</h3>
			</div>
		</div>
	)
}

interface TextLineProps {
	title: string
	value: string | number | null
}

function TextLine(props: TextLineProps) {
	const { title, value } = props

	return (
		<div className='h-10 flex-row items-center justify-between border-b border-gray-300'>
			<p className='w-full'>{title}</p>
			<p className='w-full'>{value}</p>
		</div>
	)
}
