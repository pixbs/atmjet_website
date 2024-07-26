import { VehicleCard } from '@/components/elements'

interface VehiclePageProps {
	params: {
		id: string
	}
}

export default function VehiclePage(props: VehiclePageProps) {
	const { id } = props.params

	return (
		<section>
			<div className='container'>
				<VehicleCard id={Number(id)} />
			</div>
		</section>
	)
}
