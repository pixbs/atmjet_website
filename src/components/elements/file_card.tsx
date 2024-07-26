import Link from 'next/link'

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
			<div
				className='h-56 w-full bg-cover bg-center bg-no-repeat'
				style={{ backgroundImage: `url(${imageUrl})` }}
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
