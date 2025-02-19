'use client'

import Image from 'next/image'
import { useState } from 'react'

interface GalleryProps {
	images: string[]
	alt: string
	selected?: number
}

export default function Gallery({ images, alt, selected = 0 }: GalleryProps) {
	const [selectedImage, setSelectedImage] = useState(selected)

	const handleSelectImage = (index: number) => {
		setSelectedImage(index)
		const element = document.getElementById(`image-${index}`)
		if (element) element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
	}

	return (
		<div className='gap-10'>
			<Image
				width={600}
				height={600}
				alt={alt}
				src={images[selectedImage]}
				className='rounded-3xl border-gray-400'
			/>
			<div className='snap no-scrollbar snap-x snap-mandatory flex-row gap-2 overflow-y-hidden overflow-x-scroll'>
				{images.map((image, index) => (
					<div
						key={index}
						id={`image-${index}`}
						onClick={handleSelectImage.bind(null, index)}
						className={`aspect-video h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg ${index === selectedImage ? '' : 'opacity-50'}`}
					>
						<Image width={100} height={100} alt={alt} src={image} />
					</div>
				))}
			</div>
		</div>
	)
}
