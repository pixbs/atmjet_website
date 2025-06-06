import Bathrooms from '@/assets/icons/bathrooms.svg'
import Cabins from '@/assets/icons/cabins.svg'
import Hours from '@/assets/icons/clock.svg'
import Guests from '@/assets/icons/guests.svg'
import Length from '@/assets/icons/length.svg'
import Refit from '@/assets/icons/tools.svg'
import Line from '@/components/animated/line'
import { newYachts } from '@/lib/drizzle'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

export default function YachtCard({
	name,
	manufacturer,
	photos,
	slug,
	customerPrice,
	currency,
	length,
	guestsDay,
	cabins,
	bathrooms,
	refit,
	minHours,
}: typeof newYachts.$inferSelect) {
	const locale = useLocale() as 'en' | 'ru'

	const statsLabel = [
		{
			en: `${guestsDay} guests`,
			ru: `${guestsDay} гостей`,
		},
		{
			en: `${length}ft / ${Math.round(Number(length) * 0.3048)}m`,
			ru: `${length}фт / ${Math.round(Number(length) * 0.3048)}м`,
		},
		{
			en: `${cabins} cabins`,
			ru: `${cabins} каюты`,
		},
		{
			en: `min ${minHours} hours`,
			ru: `мин ${pluralizeHours(minHours)}`,
		},
		{
			en: `${bathrooms} bathrooms`,
			ru: `${bathrooms} ванные`,
		},
		{
			en: `${refit} refit`,
			ru: `${refit} ремонт`,
		},
	]
	const iconClass = 'w-6 h-6 text-gray-300 mr-2'
	const icons = [
		<Guests className={iconClass} />,
		<Length className={iconClass} />,
		<Cabins className={iconClass} />,
		<Hours className={iconClass} />,
		<Bathrooms className={iconClass} />,
		<Refit className={iconClass} />,
	]

	return (
		<Link
			href={slug || '/yachts'}
			className='group overflow-hidden rounded-2xl border border-gray-300 bg-gray-150 p-0'
		>
			<div className='relative aspect-video overflow-hidden'>
				{photos && photos[0] && (
					<Image
						src={photos[0]}
						alt={name || ''}
						width={800}
						height={450}
						className='transition-transform duration-300 ease-out group-hover:scale-125'
					/>
				)}
			</div>
			<div className='gap-3 p-6 pb-8'>
				<h3>
					{manufacturer} {name ? `"${name}"` : ''}
				</h3>
				<span className='self-start rounded-md bg-gold px-2 py-0.5 font-bold text-gray-150'>
					{customerPrice} {currency} / {locale === 'en' ? 'per hour' : 'за час'}
				</span>
				<Line />
				<div className='grid grid-cols-2 gap-2 lg:grid-cols-3'>
					{statsLabel.map((stat, i) => (
						<div key={i} className={`flex-row items-center gap-2 ${i > 3 ? 'hidden lg:flex' : ''}`}>
							{icons[i]}
							<span>{stat[locale]}</span>
						</div>
					))}
				</div>
			</div>
		</Link>
	)
}

function pluralizeHours(hours: number | string | null) {
	if (!hours) return
	if (typeof hours === 'string') hours = Number(hours)

	if (hours % 10 === 1 && hours % 100 !== 11) {
		return `${hours} час`
	} else if ([2, 3, 4].includes(hours % 10) && !(hours % 100 >= 12 && hours % 100 <= 14)) {
		return `${hours} часа`
	} else {
		return `${hours} часов`
	}
}
