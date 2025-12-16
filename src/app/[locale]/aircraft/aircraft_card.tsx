import Line from '@/components/animated/line'
import { aircrafts } from '@/lib/drizzle'
import Image from 'next/image'
import Link from 'next/link'

type AicraftProps = typeof aircrafts.$inferSelect

interface AircraftCardProps extends AicraftProps {
	cover: string
}

async function AircraftCard({
	slug,
	id,
	aircraftTypeName,
	registrationNumber,
	cover,
	aircraftTypeAircraftClassName,
}: AircraftCardProps) {
	// const images = await getImages(id)
	if (!cover) {
		return null
	}

	return (
		<Link
			href={`/aircraft/${slug}` || '/aircraft'}
			className='group overflow-hidden rounded-2xl border border-gray-300 bg-gray-150 p-0'
		>
			<div className='relative aspect-video overflow-hidden'>
				<Image
					src={cover}
					alt={`${aircraftTypeName} ${registrationNumber}`}
					width={800}
					height={450}
					className='transition-transform duration-300 ease-out group-hover:scale-125'
				/>
				<img src={cover} alt={aircraftTypeName || ''} />
			</div>
			<div className='gap-3 p-6 pb-8'>
				<h3>
					{aircraftTypeName} {registrationNumber}
				</h3>
				<Line />
				<p>{aircraftTypeAircraftClassName}</p>
			</div>
		</Link>
	)
}

export default AircraftCard
