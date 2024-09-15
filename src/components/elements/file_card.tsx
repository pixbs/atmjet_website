import Link from 'next/link'
import Image from 'next/image'
interface FileCardProps {
	url: string
	title: string
	imageUrl: string
	button: string
}

export function FileCard(props: FileCardProps) {
	const { url, title, imageUrl, button } = props

	return (
		<div className='overflow-hidden rounded-2xl bg-gray-150 md:min-w-80'>
			<Image
				src={imageUrl}
				alt={title}
				width={560}
				height={320}
				className='h-56 w-full object-cover object-center'
				loading='lazy'
			/>
			<div className='gap-6 p-6'>
				<h3>{title}</h3>
				<Link href={url} className='md:self-start'>
					<button>{button}</button>
				</Link>
			</div>
		</div>
	)
}
