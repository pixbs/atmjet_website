'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'

export function TilesSection() {
	const images = Array.from({ length: 8 }, (_, index) => `/images/tiles/slice_${index}.webp`)

	const imageVariants = {
		hidden: { opacity: 0, scale: 0 },
		visible: { opacity: 1, scale: 1 },
	}

	const [ref, inView] = useInView({
		triggerOnce: true, // Only trigger the animation once
		threshold: 0.1, // Percentage of the element's visibility required to trigger the animation
	})

	return (
		<section>
			<div className='container !grid grid-cols-2 md:grid-cols-3'>
				{images.map((image, index) => (
					<motion.div
						key={index}
						className='aspect-w-1 aspect-h-1 relative'
						initial='hidden'
						animate={inView ? 'visible' : 'hidden'} // Start animation only when in view
						variants={imageVariants}
						transition={{ duration: 0.5, delay: index * 0.2 }}
						ref={ref} // Attach the ref to the element being observed
					>
						<Image 
							src={image}
							alt={`Tile ${index + 1}`}
							className='object-cover' 
							width={380}
							height={380}
						/>
					</motion.div>
				))}
			</div>
		</section>
	)
}
