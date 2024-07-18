'use client'

import { useEffect, useState } from "react"

interface HeroSectionProps {
	title: string
}

export function HeroSection(props: HeroSectionProps) {
	const [isClient, setIsClient] = useState(false)
 
	useEffect(() => {
	  setIsClient(true)
	}, [])

	const { title } = props
	const videoSrc = 'video/hero_background.mp4'
	return (
		<section>
			<div className='container z-20 !my-0 h-svh justify-center gap-2'>
				<p className='text-center text-sm'>ATMJET</p>
				<h1 className='text-center duration-1000 animate-in fade-in slide-in-from-top-10'>
					{title}
				</h1>
				<p className='absolute bottom-8 left-5 z-20 text-sm'>©ATM JET</p>
				{/* <RequestForm /> */}
			</div>
			<div className='hero-darkening absolute inset-0 z-10' />
{isClient &&			<video
				autoPlay
				muted
				loop
				playsInline
				className='absolute inset-0 z-0 h-full w-full object-cover'
			>
				<source src={videoSrc} type='video/mp4' />
				<track src='/path/to/captions.vtt' kind='subtitles' srcLang='en' label='English' />
			</video>}
		</section>
	)
}
