import Line from '@/components/animated/line'
import NewContactUs from '@/components/sections/new_contact_us'
import { db, newYachts } from '@/lib/drizzle'
import { ilike, or } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
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

	if (!yacht || !yacht.photos) return redirect('/yachts')
	const price = (Number(yacht.customerPrice) ?? 0) * (Number(yacht.minHours) ?? 1)
	const description = yacht.descriptionEn
		?.split('.')
		.slice(0, -1)
		.map((str) => str.trim() + '.')
	const stats = [
		{
			label: 'pax day/night',
			value: `${yacht.guestsDay} / ${yacht.guestsNight}`,
		},
		{
			label: 'lenght ft/m',
			value: `${yacht.length} / ${Math.round(Number(yacht.length) * 0.3048)}`,
		},
		{
			label: 'cabins',
			value: yacht.cabins,
		},
		{
			label: 'bathrooms',
			value: yacht.bathrooms,
		},
		{
			label: 'min rental hours',
			value: `${yacht.minHours} hours`,
		},
		{
			label: 'refit',
			value: yacht.refit,
		},
	]

	return (
		<main>
			<section className='md:pb-24'>
				{yacht.photos && yacht.photos[0] && (
					<div
						className='relative left-0 top-0 -z-[1] mb-[-80px] h-[40vh] w-full overflow-hidden bg-cover bg-fixed bg-center'
						style={{ backgroundImage: `url(${yacht.photos[0]})` }}
					>
						<div className='absolute inset-0 z-10 bg-gradient-to-b from-gray-100 to-transparent' />
						<div className='absolute inset-0 z-10 bg-gradient-to-t from-gray-100 to-transparent' />
					</div>
				)}
				<div className='container !gap-10 lg:grid lg:grid-cols-2'>
					{yacht.photos && yacht.photos[0] && (
						<Gallery
							images={yacht.photos}
							alt={`${yacht.manufacturer} ${yacht.name}`}
							selected={1}
						/>
					)}
					<div className='gap-8 rounded-3xl border border-gray-300 bg-gray-150 p-6 py-10 md:p-10'>
						<h1>{`${yacht.manufacturer} "${yacht.name}"`}</h1>
						<form className='flex flex-col gap-8'>
							<div className='flex flex-col gap-[2px] overflow-hidden rounded-2xl'>
								<Input
									name='from'
									id='from'
									className='cursor-not-allowed bg-gray-800 text-gray-500'
									label='From'
									disabled
									value={String(yacht.location)}
								/>
								<Input name='date' id='date' type='date' label='Date' />
								<div className='gap-[2px] md:flex-row'>
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
							<div className='grid items-center gap-4 md:grid-cols-2'>
								<button className='self-start px-8 py-6'>Request {yacht.name}</button>
								<p>
									~{price.toLocaleString()} {yacht.currency}/Hour
								</p>
							</div>
						</form>
					</div>
				</div>
			</section>
			<Line />
			<section className='md:py-16 md:pb-24'>
				<div className='container gap-12'>
					<div className='gap-10 md:grid md:grid-cols-2'>
						<div className='overflow-clip'>
							<Image
								src={yacht.photos[yacht.photos.length - 1]}
								className='sticky top-[20vh] rounded-3xl border border-gray-300 bg-gray-150'
								alt={`${yacht.manufacturer} ${yacht.name}`}
								width={600}
								height={400}
							/>
						</div>
						<div className='top-[20vh] gap-10 rounded-3xl border border-gray-300 bg-gray-150 px-6 py-10 md:sticky md:self-start md:px-10 md:py-12 md:pb-14'>
							<h2>Key stats</h2>
							<div className='gap-6 sm:grid sm:grid-cols-2 md:gap-8'>
								{stats.map((stat, index) => (
									<>
										<div key={index}>
											<h3>{stat.value}</h3>
											<p>{stat.label}</p>
										</div>
										<Line className={`col-span-full ${index % 2 === 0 && 'md:hidden'}`} />
									</>
								))}
								<div className='col-span-full'>
									<p>Included in the price:</p>
									<h3>{yacht.included}</h3>
								</div>
							</div>
						</div>
					</div>
					<div className='relative items-start gap-6 md:grid md:grid-cols-2 md:gap-10'>
						<div className='top-[20vh] gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 py-10 pb-16 md:sticky md:gap-10 md:self-start md:p-10'>
							<h2>About {yacht.name}</h2>
							<div className='flex flex-col gap-4'>
								{description?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
							</div>
						</div>
						<div className='gap-10'>
							{yacht.photos
								.slice(2, -1)
								.slice(2)
								.map((photo, index) => (
									<Image
										key={index}
										src={photo}
										className='rounded-3xl border border-gray-300 bg-gray-150'
										alt={`${yacht.manufacturer} ${yacht.name}`}
										width={600}
										height={400}
									/>
								))}
						</div>
					</div>
				</div>
			</section>
			<Line />
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
		<div className={`relative w-full bg-gray-900 text-gray-100`}>
			<label
				htmlFor={rest.name}
				className='absolute left-7 top-4 text-xs font-semibold text-gray-500'
			>
				{props.label}
			</label>
			<input className={`px-7 pb-4 pt-9 ${className}`} name={props.id || props.name} {...rest} />
		</div>
	)
}
