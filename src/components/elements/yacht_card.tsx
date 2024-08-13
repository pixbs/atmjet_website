import Beds from '@/assets/svg/f7_bed-double-fill.svg'
import Captain from '@/assets/svg/healthicons_security-worker.svg'
import People from '@/assets/svg/ion_people.svg'
import { vehicles } from '@/lib/drizzle'
import { ReactNode } from 'react'

export function YachtCard(props: typeof vehicles.$inferSelect) {
	const name = `${props.yachtLength}m ${props.yachtBuilder}`

	return (
		<div className='relative w-full shrink-0 gap-6 pr-4 md:gap-10 lg:flex-row'>
			<div className='relative w-full overflow-hidden rounded-xl'>
				<div
					className='aspect-video rounded-xl bg-cover bg-center'
					style={{ backgroundImage: `url(https://${props.thumb})` }}
				/>
				<div className='absolute inset-0 z-10 bg-gradient-to-b from-gray-150 via-gray-150/20 to-transparent'></div>
			</div>
			<h3 className='absolute left-8 top-8 z-20'>{name}</h3>
			<div className='flex-row justify-around lg:flex-col'>
				<Numeric title='Guests:' number={props.yachtGuests || 0}>
					<People />
				</Numeric>
				<Numeric title='Cabins:' number={Number(props.yachtGuests) / 2 || 0}>
					<Beds />
				</Numeric>
				<Numeric title='Crew:' number={Number(props.yachtGuests) / 2 || 0}>
					<Captain />
				</Numeric>
			</div>
			<div className='min-w-80'>
				<TextLine title='Year:' value={props.yachtYear} />
				<TextLine title='Pax:' value={props.yachtGuests} />
				<TextLine title='Speed:' value={props.yachtSpeed} />
				<TextLine title='Builder:' value={props.yachtBuilder} />
				<TextLine title='Lenght:' value={props.yachtLength} />
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
	value: string | null
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
