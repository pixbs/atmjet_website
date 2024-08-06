import ArrowTopRight from '@/assets/svg/arrow-top-right.svg'
import Logo from '@/assets/svg/logo.svg'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { LocaleSwitch } from '../elements'

export function FooterSection() {
	const t = useTranslations()
	const year = new Date().getFullYear()

	return (
		<>
			<section
				className='bg-cover bg-fixed bg-top bg-no-repeat'
				style={{ backgroundImage: 'url(/images/home_page/footer.jpg)' }}
			>
				<footer className='container !static !mb-0 !mt-24 gap-8 rounded-t-2xl bg-gray-100 bg-opacity-60 py-10 backdrop-blur-lg'>
					<div className='flex-row content-between justify-between'>
						<Logo className='h-8 text-gray-900' />
						<div className='flex-row gap-4'>
							<LocaleSwitch />
						</div>
					</div>
					<div className='w-full flex-row justify-between'>
						<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
							<Link href='/'>{t('navigation.home')}</Link>
							<Link href='/partners'>{t('navigation.partners')}</Link>
							<Link href='/business_agents'>{t('navigation.business-agents')}</Link>
							<Link href='/medical_aviation'>{t('navigation.medical-aviation')}</Link>
							<Link href='/empty_legs'>{t('navigation.empty-legs')}</Link>
							<Link href='/cargo_charter'>{t('navigation.cargo-charter')}</Link>
						</div>
						<div className='[&>*]:duration-600 [&>*]:animate-in [&>*]:fade-in'>
							<Link href='tg://resolve?domain=@atmjet1' className='flex items-center'>
								{t('social-media.telegram')}
								<ArrowTopRight className='size-10' />
							</Link>
							<Link
								href='https://m.sitehelp.me/whatsappOfficial?siteId=kdjz1r9wpcb00x6o5ksiqxahidz566ll&clientId=kG1xsAPIwQrDwTJfGPC3vMikfU3QrfWo&url=whatsapp%3A%2F%2Fsend%3Fphone%3D971585940112'
								className='flex items-center'
							>
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
							<Link href='/sales_dept'>{t('navigation.sales-dept')}</Link>
							<Link href='/group_charters'>{t('navigation.group-charters')}</Link>
							<Link href='/atm_jet_group'>{t('navigation.atm-jet-group')}</Link>
							<Link href='/aircraft'>{t('navigation.aircraft')}</Link>
							<Link href='/yachts'>{t('navigation.yachts')}</Link>
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
