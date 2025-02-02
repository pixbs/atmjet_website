import { useLocale } from 'next-intl'
import Link from 'next/link'

interface GroupCardProps {
	title: string
	description: string
	button: string
	imageSrc: string
	href: string
}

export function GroupCard(props: GroupCardProps) {
	const { title, description, button, imageSrc, href } = props
	const locale = useLocale()

	return (
		<div
			className='relative w-full bg-cover bg-center p-8 md:flex-row md:p-10'
			style={{ backgroundImage: `url(${imageSrc})` }}
		>
			<div className='z-10'>
				<h2>{title}</h2>
				<p className='pt-3'>{description}</p>
				<Link href={`/${locale}/${href}`}>
					<button className='mt-6'>{button}</button>
				</Link>
			</div>
			<div className='absolute inset-0 bg-gradient-to-r from-gray-150 via-gray-150 to-gray-150/80 md:from-0% md:via-40% md:to-transparent' />
		</div>
	)
}
