interface HeroSectionProps {
	title: string
}

export function HeroSection(props: HeroSectionProps) {
	const { title } = props
	const videoSrcDesktop = 'video/background_full.mp4'
	const videoSrcMobile = 'video/background.mp4'

	return (
		<section>
			<div className='container z-20 !my-0 h-svh justify-center gap-2'>
				<p className='text-center text-sm'>ATM JET</p>
				<h1 className='text-center'>{title}</h1>
				<p className='absolute bottom-8 left-5 z-20 text-sm'>©ATM JET</p>
			</div>
			<div className='hero-darkening absolute inset-0 z-10' />
			<video
				autoPlay
				muted
				loop
				playsInline
				className='absolute inset-0 z-0 h-full w-full object-cover'
				preload='auto'
			>
				<source src={videoSrcDesktop} type='video/mp4' className='object-cover' />
				<track src='/path/to/captions.vtt' kind='subtitles' srcLang='en' label='English' />
			</video>
		</section>
	)
}
