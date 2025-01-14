import NewContactUs from '@/components/sections/new_contact_us'
import { db, newYachts } from '@/lib/drizzle'
import { ilike, or } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import Gallery from './gallery'

interface YachtsProps {
	params: {
		id: string
	}
}

export default async function Yachts(props: YachtsProps) {
	const t = await getTranslations('vehicle')
	const { id } = props.params
	const [yacht] = await db
		.select()
		.from(newYachts)
		.limit(1)
		.where(or(ilike(newYachts.slug, `%${id}%`)))

	const price = (Number(yacht.customerPrice) ?? 0) * (Number(yacht.minHours) ?? 1)
	if (!yacht) return redirect('/yachts')

	return (
		<main>
			<section className='border-b border-gray-300'>
				{yacht.photos && yacht.photos[0] && (
					<div
						className='relative left-0 top-0 -z-[1] mb-[-80px] h-[40vh] w-full overflow-hidden bg-cover bg-fixed bg-center'
						style={{ backgroundImage: `url(${yacht.photos[0]})` }}
					>
						<div className='absolute inset-0 z-10 bg-gradient-to-b from-gray-100 to-transparent' />
						<div className='absolute inset-0 z-10 bg-gradient-to-t from-gray-100 to-transparent' />
					</div>
				)}
				<div className='container !grid !grid-cols-2 !gap-10'>
					{yacht.photos && yacht.photos[0] && (
						<Gallery
							images={yacht.photos}
							alt={`${yacht.manufacturer} ${yacht.name}`}
							selected={1}
						/>
					)}
					<div className='gap-8 rounded-3xl border border-gray-300 bg-gray-150 p-10'>
						<h1>{`${yacht.manufacturer} "${yacht.name}"`}</h1>
						<form className='flex flex-col gap-8'>
							<div className='flex flex-col gap-[2px] overflow-hidden rounded-2xl'>
								<Input
									name='from'
									id='from'
									className='cursor-not-allowed'
									label='From'
									disabled
									value={String(yacht.location)}
								/>
								<Input name='date' id='date' type='date' label='Date' />
								<div className='flex-row gap-[2px]'>
									<Input
										name='hours'
										id='hours'
										type='number'
										label='Hours'
										min={yacht.minHours || 1}
										defaultValue={yacht.minHours || 1}
									/>
									<Input
										name='guests'
										id='guests'
										type='number'
										label='Guests'
										min={1}
										max={yacht.guestsDay || 10}
										defaultValue={yacht.minHours || 1}
									/>
								</div>
							</div>
							<button className='self-start px-8 py-6'>
								Request for ~{price.toLocaleString()} {yacht.currency}
							</button>
						</form>
						<p>*price will be clarified after request</p>
					</div>
				</div>
			</section>
			<NewContactUs />
		</main>
	)
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string
}

function Input(props: InputProps) {
	const { className, ...rest } = props
	return (
		<div className={`relative w-full bg-gray-900 text-gray-100 ${className}`}>
			<label
				htmlFor={rest.name}
				className='absolute left-7 top-4 text-xs font-semibold text-gray-500'
			>
				{props.label}
			</label>
			<input className='px-7 pb-4 pt-9' name={props.id || props.name} {...rest} />
		</div>
	)
}
