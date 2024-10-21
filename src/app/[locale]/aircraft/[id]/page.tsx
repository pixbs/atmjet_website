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
	const [vehicle] = await db.select().from(vehicles).limit(1).where(eq(vehicles.tailNumber, id))

	const labels = [
		t('tail-number'),
		t('tail-operator'),
		t('tail-vendor'),
		t('tail-weight'),
		t('tail-year'),
		t('tail-maxpax'),
		t('tail-homebase'),
		t('tail-homebase-city'),
		t('tail-homebase-country'),
		t('tail-manufacturer'),
		t('tail-interiorrefit'),
		t('tail-exteriorrefit'),
	]

	const values = [
		vehicle.tailNumber,
		vehicle.tailOperator,
		vehicle.vendor,
		vehicle.weight,
		vehicle.tailYear,
		vehicle.tailMaxpax,
		vehicle.tailHomebase,
		vehicle.tailHomebase_city,
		vehicle.tailHomebase_country,
		vehicle.tailManufacturer,
		vehicle.tailInteriorrefit,
		vehicle.tailExteriorrefit,
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
				<div className='container gap-4'>
					<h1 className=''>{vehicle.tailModel}</h1>
					<p>
						{t('description', {
							tailModel: vehicle.tailModel,
							tailNumber: vehicle.tailNumber,
							tailOperator: vehicle.tailOperator,
							tailVendor: vehicle.vendor,
							tailYear: vehicle.tailYear,
							tailHomebase: vehicle.tailHomebase,
							tailMaxpax: vehicle.tailMaxpax,
						})}
					</p>
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
