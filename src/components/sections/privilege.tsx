import Plane from '@/assets/svg/plane-two.svg'
import { useTranslations } from 'next-intl'

// export function PrivilegeSection() {
// 	const t = useTranslations('privilege')

// 	return (
// 		<section>
// 			<div className='container'>
// 				<div className='gap-10 overflow-hidden rounded-2xl bg-gold lg:flex-row-reverse lg:items-center'>
// 					<div
// 						className='h-64 w-full bg-cover bg-center lg:h-80'
// 						style={{ backgroundImage: 'url(/images/home_page/artem.jpg)' }}
// 					/>
// 					<div className='w-full items-center gap-4 px-6 pb-10 lg:h-80 lg:items-start lg:py-10 lg:pb-0'>
// 						<h2 className='text-center text-gray-100 lg:text-left'>{t('title')}</h2>
// 						<p className='text-center text-gray-100 lg:text-left'>{t('description')}</p>
// 						<Link href='tg://resolve?domain=@atmjet1'>
// 							<button className='big'>{t('button')}</button>
// 						</Link>
// 					</div>
// 				</div>
// 			</div>
// 		</section>
// 	)
// }

export function PrivilegeSection() {
	const t = useTranslations('privilege')

	const cards = ['card1', 'card2']

	return (
		<section>
			<div className='container gap-10 lg:flex-row'>
				<div className='top-40 flex-shrink-0 gap-6 self-start lg:sticky lg:w-72'>
					<h2 className='bg-gold bg-clip-text font-serif text-transparent'>{t('title')}</h2>
					<p>{t('description')}</p>
					<button className='big self-start'>{t('button')}</button>
				</div>
				<div className='relative w-full gap-4 self-stretch overflow-clip rounded-2xl'>
					{cards.map((card, index) => (
						<PrivilegeCard
							key={index}
							title={t(`${card}.title`)}
							description={t(`${card}.description`)}
						/>
					))}
				</div>
			</div>
		</section>
	)
}

interface PrivilegeCardProps {
	title: string
	description: string
}

function PrivilegeCard(props: PrivilegeCardProps) {
	const { title, description } = props

	return (
		<div className='sticky flex-row items-center gap-2 overflow-hidden bg-opacity-90 py-8 backdrop-blur-lg md:gap-4'>
			<Plane className='h-24 w-24 shrink-0 md:h-32 md:w-32' />
			<div className='gap-4 md:w-full'>
				<h3 className='bg-gold bg-clip-text font-serif text-transparent'>{title}</h3>
				<p>{description}</p>
			</div>
		</div>
	)
}
