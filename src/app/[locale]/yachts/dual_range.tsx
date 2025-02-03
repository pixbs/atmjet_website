'use client'
import { Slider } from '@/components/ui/slider'

interface DualRangeProps extends React.ComponentProps<typeof Slider> {
	label?: string
    unit?: string
}

function DualRange(props: DualRangeProps) {
	const { label, unit, ...rest } = props

	return (
		<div className='relative rounded-lg bg-white p-4'>
			{label && (
				<label className='pointer-events-none absolute left-6 right-6 flex justify-between top-3 text-xs font-semibold text-gray-500'>
                    <span>
                        {label}
                    </span>
                    <span className='font-bold text-gray-150'>
                        {/*@ts-expect-error */}
                        {props.value[0].toLocaleString()}{unit} - {props.value[1].toLocaleString()}{unit}
                    </span>
				</label>
			)}
			<Slider className='h-10 pt-6' {...rest} />
		</div>
	)
}

export default DualRange
