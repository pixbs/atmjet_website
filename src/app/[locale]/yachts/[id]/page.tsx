import Bathrooms from '@/assets/icons/bathrooms.svg'
import Cabins from '@/assets/icons/cabins.svg'
import Hours from '@/assets/icons/clock.svg'
import Guests from '@/assets/icons/guests.svg'
import Length from '@/assets/icons/length.svg'
import Refit from '@/assets/icons/tools.svg'
import Line from '@/components/animated/line'
import NewContactUs from '@/components/sections/new_contact_us'
import { db, newYachts } from '@/lib/drizzle'
import { ilike, or } from 'drizzle-orm'
import { getLocale } from 'next-intl/server'
import { headers } from 'next/headers'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import Gallery from './gallery'

const statsLabel = [
	{
		en: 'pax day/night',
		ru: 'пассажиры день/ночь',
	},
	{
		en: 'lenght ft/m',
		ru: 'длина футы/метры',
	},
	{
		en: 'cabins',
		ru: 'каюты',
	},
	{
		en: 'bathrooms',
		ru: 'ванные',
	},
	{
		en: 'min rental hours',
		ru: 'минимальное время аренды',
	},
	{
		en: 'refit',
		ru: 'ремонт',
	},
	{
		en: 'Included in the price:',
		ru: 'Включено в стоимость:',
	},
]

const inputLabel = {
	en: {
		from: 'From',
		date: 'Date',
		hours: 'Hours',
		guests: 'Guests',
	},
	ru: {
		from: 'Откуда',
		date: 'Дата',
		hours: 'Часы',
		guests: 'Гости',
	},
}

interface YachtsProps {
	params: {
		id: string
	}
}

export default async function Yachts(props: YachtsProps) {
	const locale = (await getLocale()) as 'en' | 'ru'
	const { id } = props.params
	const [yacht] = await db
		.select()
		.from(newYachts)
		.limit(1)
		.where(or(ilike(newYachts.slug, `%${id}%`)))

	if (!yacht || !yacht.photos) return redirect('/yachts')
	const description = yacht.descriptionEn
		?.split('.')
		.slice(0, -1)
		.map((str) => str.trim() + '.')
	const stats = [
		{
			label: statsLabel[0][locale],
			value: `${yacht.guestsDay} / ${yacht.guestsNight}`,
		},
		{
			label: statsLabel[1][locale],
			value: `${yacht.length} / ${Math.round(Number(yacht.length) * 0.3048)}`,
		},
		{
			label: statsLabel[2][locale],
			value: yacht.cabins,
		},
		{
			label: statsLabel[3][locale],
			value: yacht.bathrooms,
		},
		{
			label: statsLabel[4][locale],
			value: `${yacht.minHours} hours`,
		},
		{
			label: statsLabel[5][locale],
			value: yacht.refit,
		},
	]

	const iconClass = 'size-10 color-gray text-gray-300 shrink-0'
	const icons = [
		<Guests className={iconClass} />,
		<Length className={iconClass} />,
		<Cabins className={iconClass} />,
		<Bathrooms className={iconClass} />,
		<Hours className={iconClass} />,
		<Refit className={iconClass} />,
	]

	return (
		<main>
			<section className='md:pb-24'>
				{yacht.photos && yacht.photos[0] && (
					<div
						className='relative left-0 top-0 -z-[1] mb-[-80px] h-[40vh] w-full overflow-hidden bg-cover bg-fixed bg-center'
						style={{ backgroundImage: `url("${yacht.photos[0]}")` }}
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
						<form className='flex flex-col gap-8' action={formAction}>
							<div className='flex flex-col gap-[2px] overflow-hidden rounded-2xl'>
								<Input
									name='from'
									id='from'
									className='cursor-not-allowed bg-gray-800 text-gray-500'
									label={inputLabel[locale].from}
									disabled
									value={String(yacht.location)}
								/>
								<Input name='date' id='date' type='date' label={inputLabel[locale].date} />
								<div className='gap-[2px] md:flex-row'>
									<Input
										name='hours'
										id='hours'
										type='number'
										label={inputLabel[locale].hours}
										min={yacht.minHours || 1}
										defaultValue={yacht.minHours || 1}
									/>
									<Input
										name='guests'
										id='guests'
										type='number'
										label={inputLabel[locale].guests}
										min={1}
										max={yacht.guestsDay || 10}
										defaultValue={yacht.minHours || 1}
									/>
								</div>
							</div>
							<div className='grid items-center gap-4 md:grid-cols-2'>
								<button className='self-start px-8 py-6'>Request {yacht.name}</button>
								<p>
									{(yacht.customerPrice || 1000).toLocaleString()} {yacht.currency}/
									{locale === 'en' ? 'Hour' : 'Час'}
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
							<h2>{locale === 'en' ? 'Key stats' : 'Основые факты'}</h2>
							<div className='gap-6 sm:grid sm:grid-cols-2 md:gap-8'>
								{stats.map((stat, index) => (
									<>
										<div key={index} className='flex-row items-center gap-4'>
											{icons[index]}
											<div>
												<h3>{stat.value}</h3>
												<p>{stat.label}</p>
											</div>
										</div>
										<Line
											className={`col-span-full ${index % 2 === 0 && 'md:hidden'}`}
											key={`line-${index}`}
										/>
									</>
								))}
								<div className='col-span-full'>
									<p>{statsLabel[6][locale]}</p>
									<h3>{yacht.included}</h3>
								</div>
							</div>
						</div>
					</div>
					<div className='relative items-start gap-6 md:grid md:grid-cols-2 md:gap-10'>
						<div className='top-[20vh] gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 py-10 pb-16 md:sticky md:gap-10 md:self-start md:p-10'>
							<h2>
								{locale === 'en' ? 'About' : 'Об'} {yacht.name}
							</h2>
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

function Input({ className, label, id, name, ...rest }: InputProps) {
	return (
		<div className={`relative w-full bg-gray-900 text-gray-100`}>
			<label htmlFor={name} className='absolute left-7 top-4 text-xs font-semibold text-gray-500'>
				{label}
			</label>
			<input className={`px-7 pb-4 pt-9 ${className}`} name={id || name} {...rest} />
		</div>
	)
}

async function formAction(formData: FormData) {
	'use server'
	const headersList = await headers()
	const ip = headersList.get('x-forwarded-for')
	const direction = {
		from: formData.get('from') as string,
		date: formData.get('date') as string,
		guests: formData.get('guests') as string,
		hours: formData.get('hours') as string,
	}
	redirect(`?showBooking=Yachts&direction=[${JSON.stringify(direction)}]`)
}
