import { vehicles } from '@/lib/drizzle'
import Link from 'next/link'

export function YachtCard(props: typeof vehicles.$inferSelect) {
	return (
		<Link
			key={props.id}
			href={`/yachts/${props.id}`}
			className='w-full shrink-0 pr-4 md:w-1/2 lg:w-1/3'
		>
			<div
				className='aspect-video rounded-xl bg-cover bg-center'
				style={{ backgroundImage: `url(https://${props.thumb})` }}
			/>
			<h3 className='pt-10'>{props.tailModel}</h3>
			<div className='mt-4 h-10 flex-row content-stretch items-center justify-stretch border-b border-gray-300'>
				<p className='w-full'>Year:</p>
				<p className='w-full'>{props.yachtYear}</p>
			</div>
			<div className='h-10 flex-row items-center justify-between border-b border-gray-300'>
				<p className='w-full'>Pax:</p>
				<p className='w-full'>{props.yachtGuests}</p>
			</div>
		</Link>
	)
}