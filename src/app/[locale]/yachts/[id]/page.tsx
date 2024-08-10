import { MakeBookingSection } from '@/components/sections'
import { db, vehicles } from '@/lib/drizzle'
import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'

interface VehiclePageProps {
	params: {
		id: string
	}
}

export default async function VehiclePage(props: VehiclePageProps) {
	const t = await getTranslations('vehicle')
	const { id } = props.params
	const [vehicle] = await db
		.select()
		.from(vehicles)
		.limit(1)
		.where(eq(vehicles.id, parseInt(decodeURIComponent(id))))

	const labels = [
		t('yacht-maxspeed'),
		t('yacht-speed'),
		t('yacht-winter-areas'),
		t('yacht-summer-areas'),
		t('yacht-guests'),
		t('yacht-year'),
		t('yacht-builder'),
		t('yacht-length'),
	]

	const values = [
		vehicle.yachtMaxspeed,
		vehicle.yachtSpeed,
		vehicle.yachtWinter_areas,
		vehicle.yachtSummer_areas,
		vehicle.yachtGuests,
		vehicle.yachtYear,
		vehicle.yachtBuilder,
		vehicle.yachtLength,
	]

	return (
		<main>
			<section
				className='h-[80svh] bg-cover bg-center bg-no-repeat bg-origin-content pb-96 md:bg-fixed'
				style={{ backgroundImage: `url(http://${vehicle.image})` }}
			>
				<div className='hero-darkening absolute inset-0 z-10' />
			</section>
			<section>
				<div className='container'>
					<h1 className='text-center'>{vehicle.tailModel}</h1>
				</div>
			</section>
			<MakeBookingSection />
			<section>
				<div className='container md:flex-row'>
					<div className='card w-full bg-gray-150 p-8 md:p-10'>
						{labels.map((label, index) => (
							<ContextLine key={index} label={label} value={values[index]} />
						))}
					</div>
				</div>
			</section>
		</main>
	)
}

interface ContextLineProps {
	label: string
	value: string | number | null
}

function ContextLine(props: ContextLineProps) {
	const { label, value } = props

	return (
		<div className='h-10 flex-row items-center justify-between border-b border-gray-300'>
			<p className='w-full'>{label}</p>
			<p className='w-full'>{value}</p>
		</div>
	)
}
