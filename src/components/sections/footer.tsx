import ArrowTopRight from '@/assets/svg/arrow-top-right.svg'
import Logo from '@/assets/svg/logo.svg'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { LocaleSwitch } from '../elements'

export function FooterSection() {
	const t = useTranslations()
	const year = new Date().getFullYear()
	const locale = useLocale()

	return (
		<>
			<section className='overflow-hidden bg-cover bg-top bg-no-repeat md:bg-fixed'>
				<Image
					alt='Footer background image of a plane cabin with a view of two seats'
					className='-z-50 object-cover object-center'
					src='/images/home_page/footer.jpg'
					fill
					loading='lazy'
				/>
				<footer className='container !static !mb-0 !mt-24 gap-8 rounded-t-2xl bg-gray-100 bg-opacity-60 py-10 backdrop-blur-lg'>
					<div className='flex-row content-between justify-between'>
						<Logo className='h-8 text-gray-900' />
						<div className='flex-row gap-4'>
							<LocaleSwitch />
						</div>
					</div>
					<div className='w-full flex-row justify-between'>
						<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
							<Link href={`/${locale}/`}>{t('navigation.home')}</Link>
							<Link href={`/${locale}/partners`}>{t('navigation.partners')}</Link>
							<Link href={`/${locale}/business_agents`}>{t('navigation.business-agents')}</Link>
							<Link href={`/${locale}/medical_aviation`}>{t('navigation.medical-aviation')}</Link>
							<Link href={`/${locale}/empty_legs`}>{t('navigation.empty-legs')}</Link>
							<Link href={`/${locale}/cargo_charter`}>{t('navigation.cargo-charter')}</Link>
						</div>
						<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
							<Link href='https://t.me/melentev1' className='flex items-center'>
								{t('social-media.telegram')}
								<ArrowTopRight className='size-10' />
							</Link>
							<Link href='https://wa.me/971504589926' className='flex items-center'>
								{t('social-media.whats-app')}
								<ArrowTopRight className='size-10' />
							</Link>
							<Link href='https://www.instagram.com/atmjet/' className='flex items-center'>
								{t('social-media.instagram')}
								<ArrowTopRight className='size-10' />
							</Link>
						</div>
					</div>
					<div className='w-full flex-row justify-between'>
						<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
							<Link href={`/${locale}/sales_dept`}>{t('navigation.sales-dept')}</Link>
							<Link href={`/${locale}/sales_yachts`}>{t('navigation.sales-yachts')}</Link>
							<Link href={`/${locale}/group_charters`}>{t('navigation.group-charters')}</Link>
							<Link href={`/${locale}/atm_jet_group`}>{t('navigation.atm-jet-group')}</Link>
							<Link href={`/${locale}/aircraft`}>{t('navigation.aircraft')}</Link>
							<Link href={`/${locale}/yachts`}>{t('navigation.yachts')}</Link>
						</div>
					</div>
					<Link href='?showBooking=Footer' className='md:self-start' scroll={false}>
						<button>{t('footer.button')}</button>
					</Link>
					<div className='items-center gap-2 pr-24 md:pr-0'>
						<p>{t('footer.location')}</p>
						<p>{t('footer.copyright', { year })}</p>
					</div>
				</footer>
			</section>
		</>
	)
}
