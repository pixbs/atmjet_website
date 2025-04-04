'use client'
import { Slider } from '@/components/ui/slider'
import React from 'react'

interface DualRangeProps extends React.ComponentProps<typeof Slider> {
	label?: string
	unit?: string
}

function DualRange(props: DualRangeProps) {
	const { label, unit, ...rest } = props

	return (
		<div className='relative rounded-lg bg-white p-4'>
			{label && (
				<label className='pointer-events-none absolute left-6 right-6 top-3 flex justify-between text-xs font-semibold text-gray-500'>
					<span>{label}</span>
					<span className='font-bold text-gray-150'>
						{/*@ts-expect-error */}
						{props.value[0].toLocaleString()}
						{/*@ts-expect-error */}
						{unit} - {props.value[1].toLocaleString()}
						{unit}
					</span>
				</label>
			)}
			<Slider className='h-10 pt-6' {...rest} />
		</div>
	)
}

export default DualRange
