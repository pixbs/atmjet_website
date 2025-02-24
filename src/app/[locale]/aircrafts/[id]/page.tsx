import Guests from '@/assets/icons/guests.svg'
import Length from '@/assets/icons/length.svg'
import Refit from '@/assets/icons/tools.svg'
import Line from '@/components/animated/line'
import Gallery from '@/components/elements/gallery'
import Autocomplete from '@/components/form/autocomplete'
import Input from '@/components/form/input'
import NewContactUs from '@/components/sections/new_contact_us'
import { aircraftImagesTable, aircrafts, db } from '@/lib/drizzle'
import { eq, ilike } from 'drizzle-orm'
import { getLocale, getTranslations } from 'next-intl/server'
import { headers } from 'next/headers'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import VehiclePage from './old'

interface AircraftProps {
	params: {
		id: string
	}
}

const statsLabel = {
	maxpax: {
		en: 'max pax',
		ru: 'макc пассажиров',
	},
	type: {
		en: 'type',
		ru: 'тип',
	},
	height: {
		en: 'cabin height',
		ru: 'высота салона',
	},
	length: {
		en: 'lenght/width',
		ru: 'длина/ширина',
	},
	year: {
		en: 'year',
		ru: 'год',
	},
	range: {
		en: 'range',
		ru: 'дальность',
	},
}

async function Aircraft({ params }: AircraftProps) {
	const names = params.id ? params.id.split('-') : []
	const registrationNumber = `${names[0]}-${names[1]}`
	const t = await getTranslations('vehicle')
	const locale = (await getLocale()) as 'en' | 'ru'
	const aircraft = (
		await db
			.select()
			.from(aircrafts)
			.limit(1)
			.where(ilike(aircrafts.registrationNumber, `${registrationNumber.toUpperCase()}`))
	)[0]

	if (!aircraft) {
		return VehiclePage({ params })
	}

	const images = await db
		.select()
		.from(aircraftImagesTable)
		.where(eq(aircraftImagesTable.aircraftId, aircraft.id))

	const iconClass = 'size-10 color-gray text-gray-300 shrink-0'
	const stats = [
		{
			show: !!aircraft.passengersMax,
			label: statsLabel.maxpax[locale],
			value: aircraft.passengersMax,
			icon: <Guests className={iconClass} />,
		},
		{
			show: !!aircraft.aircraftTypeAircraftClassName,
			label: statsLabel.type[locale],
			value: aircraft.aircraftTypeAircraftClassName,
			icon: <Refit className={iconClass} />,
		},
		{
			show: !!aircraft.aircraftTypeCabinHeight,
			label: statsLabel.height[locale],
			value: `${aircraft.aircraftTypeCabinHeight || 0}m`,
			icon: <Length className={iconClass} />,
		},
		{
			show: !!aircraft.aircraftTypeCabinLength,
			label: statsLabel.length[locale],
			value: `${aircraft.aircraftTypeCabinLength || 0}m/${aircraft.aircraftTypeCabinWidth || 0}m`,
			icon: <Length className={iconClass} />,
		},
		{
			show: !!aircraft.yearOfProduction,
			label: statsLabel.year[locale],
			value: aircraft.yearOfProduction,
			icon: <Refit className={iconClass} />,
		},
		{
			show: !!aircraft.aircraftTypeRangeMaximum,
			label: statsLabel.range[locale],
			value: `${(aircraft.aircraftTypeRangeMaximum || 0).toLocaleString()}km`,
			icon: <Refit className={iconClass} />,
		},
	]

	return (
		<main>
			<section className='md:pb-24'>
				<div className='relative left-0 top-0 -z-[1] mb-[-80px] h-[40vh] w-full overflow-hidden bg-cover bg-center'>
					<div className='absolute inset-0 z-10 bg-gradient-to-b from-gray-100 to-transparent' />
					<div className='absolute inset-0 z-10 bg-gradient-to-t from-gray-100 to-transparent' />
					<Image
						src={images[0].url}
						alt={`${aircraft.aircraftTypeName} ${aircraft.registrationNumber}`}
						fill
						className='object-cover object-center'
					/>
				</div>
				<div className='container !gap-10 lg:grid lg:grid-cols-2'>
					<Gallery
						images={images.map((image) => image.url)}
						alt={`${aircraft.aircraftTypeName} ${aircraft.registrationNumber}`}
						selected={images.length > 1 ? 1 : 0}
					/>
					<div className='gap-8 rounded-3xl border border-gray-300 bg-gray-150 p-6 py-10 md:p-10'>
						<h1>{`${aircraft.aircraftTypeName} ${aircraft.registrationNumber}`}</h1>
						<form className='flex flex-col gap-8' action={formAction}>
							<div className='flex flex-col gap-[2px] rounded-2xl'>
								<Autocomplete
									id='from'
									label={locale === 'ru' ? 'Откуда' : 'From'}
									className='overflow-hidden rounded-t-2xl'
								/>
								<Autocomplete id='to' label={locale === 'ru' ? 'Куда' : 'To'} />
								<Input
									id='date'
									label={locale === 'ru' ? 'Дата' : 'Date'}
									type='date'
									className='overflow-hidden rounded-b-2xl'
								/>
							</div>
							<button className='px-8 py-6'>Request {aircraft.registrationNumber}</button>
						</form>
					</div>
				</div>
			</section>
			<Line />
			<section>
				<div className='container gap-12'>
					<div className='gap-10 md:grid md:grid-cols-2'>
						{aircraft.extensionView360 ? (
							<iframe
								src={aircraft.extensionView360}
								allowFullScreen
								allow='autoplay; fullscreen; web-share; xr-spatial-tracking;'
								className='h-full min-h-80 w-full overflow-hidden rounded-3xl border border-gray-300'
							/>
						) : (
							<Image
								width={600}
								height={600}
								alt={`${aircraft.aircraftTypeName} ${aircraft.registrationNumber}`}
								src={images[1]?.url || images[0].url}
								className='rounded-3xl border-gray-400'
							/>
						)}
						<div className='top-[20vh] gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 py-10 pb-16 md:sticky md:gap-10 md:self-start md:p-10'>
							<h2>{`${aircraft.aircraftTypeName} ${aircraft.registrationNumber}`}</h2>
							<p>
								{t('description', {
									tailModel: aircraft.aircraftTypeName,
									tailNumber: aircraft.registrationNumber,
									tailOperator: aircraft.companyName,
									tailYear: aircraft.yearOfProduction,
									tailHomebase: aircraft.airportIcao,
									tailMaxpax: aircraft.passengersMax,
								})
									.split('\\n')
									.map((line, index) => (
										<>
											<span key={index}>{line}</span>
											<br key={`${index}-break`} />
											<br key={`${index}-second-break`} />
										</>
									))}
							</p>
						</div>
					</div>
					<div className='gap-10 md:grid md:grid-cols-2'>
						<div className='top-[20vh] gap-10 rounded-3xl border border-gray-300 bg-gray-150 px-6 py-10 md:sticky md:self-start md:px-10 md:py-12 md:pb-14'>
							<h2>{locale === 'en' ? 'Key stats' : 'Основые факты'}</h2>
							<div className='gap-6 sm:grid sm:grid-cols-2 md:gap-8'>
								{stats.map(
									(stat, index) =>
										stat.show && (
											<>
												<div key={`stat-${index}`} className='flex-row items-center gap-4'>
													{stat.icon}
													<div>
														<h3>{stat.value}</h3>
														<p>{stat.label}</p>
													</div>
												</div>
												{stats.length - 1 !== index && (
													<Line
														className={`col-span-full ${index % 2 === 0 && 'md:hidden'}`}
														key={`lines-${index}`}
													/>
												)}
											</>
										),
								)}
							</div>
						</div>
						<div className='gap-10'>
							{images.reverse().map((image, index) => (
								<Image
									key={`image-${index}`}
									src={image.url}
									className='rounded-3xl border border-gray-300 bg-gray-150'
									alt={`${aircraft.aircraftTypeName} ${aircraft.registrationNumber}`}
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
export default Aircraft

async function formAction(formData: FormData) {
	'use server'
	const headersList = await headers()
	const ip = headersList.get('x-forwarded-for')
	const direction = {
		from: formData.get('from') as string,
		to: formData.get('to') as string,
		date: formData.get('date') as string,
	}
	redirect(`?showBooking=Yachts&direction=[${encodeURIComponent(JSON.stringify(direction))}]`)
}
