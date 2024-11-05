import { GroupCard } from '@/components/elements'
import { PrivilegeSection, YachtsSection } from '@/components/sections'
import { useTranslations } from 'next-intl'

export default function AtmJetGroupPage() {
	const t = useTranslations()

	return (
		<main>
			<section>
				<div className='container items-center gap-4 pt-32'>
					<p className='rounded-full border border-gray-300 px-4 py-1 text-sm'>
						{t('atm-jet-hero.chip')}
					</p>
					<h1 className='pt-2 text-center'>{t('atm-jet-hero.title')}</h1>
					<p className='max-w-screen-sm pt-8 text-center'>{t('atm-jet-hero.description')}</p>
				</div>
			</section>
			<section>
				<div className='container'>
					<div className='overflow-hidden rounded-2xl'>
						<GroupCard
							title={t('group1.title')}
							description={t('group1.description')}
							button={t('group1.button')}
							imageSrc='/images/atm_jet_group/group1.webp'
							href='/aircrafts'
						/>
						<hr />
						<GroupCard
							title={t('group2.title')}
							description={t('group2.description')}
							button={t('group2.button')}
							imageSrc='/images/atm_jet_group/group2.webp'
							href='/sales_dept'
						/>
					</div>
				</div>
			</section>
			<YachtsSection />
			<PrivilegeSection />
		</main>
	)
}
