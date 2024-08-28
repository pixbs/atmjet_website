'use server'

import { Counter, VehiclesCarousel } from '@/components/elements'
import { MakeBookingSection } from '@/components/sections'
import { db, vehicles } from '@/lib/drizzle'
import { sql } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function Aircraft() {
	const t = await getTranslations()
	const vehiclesList = await db.select().from(vehicles).limit(10)
	const smallJets = (await db
		.select()
		.from(vehicles)
		.where(
			sql`CASE 
              WHEN trim(${vehicles.tailMaxpax}) ~ '^[0-9]+$' 
              THEN (${vehicles.tailMaxpax}::integer > 1 AND ${vehicles.tailMaxpax}::integer < 7) 
              ELSE false 
            END`,
		)
		.limit(15)) as (typeof vehicles.$inferSelect)[]
	const midJets = (await db
		.select()
		.from(vehicles)
		.where(
			sql`CASE 
              WHEN trim(${vehicles.tailMaxpax}) ~ '^[0-9]+$' 
              THEN (${vehicles.tailMaxpax}::integer > 6 AND ${vehicles.tailMaxpax}::integer < 11) 
              ELSE false 
            END`,
		)
		.limit(15)) as (typeof vehicles.$inferSelect)[]
	const heavyJets = (await db
		.select()
		.from(vehicles)
		.where(
			sql`CASE 
              WHEN trim(${vehicles.tailMaxpax}) ~ '^[0-9]+$' 
              THEN (${vehicles.tailMaxpax}::integer > 10) 
              ELSE false 
            END`,
		)
		.limit(15)) as (typeof vehicles.$inferSelect)[]

	return (
		<main>
			<section>
				<div className='container gap-20 pt-32'>
					<div className='items-center gap-4'>
						<h1 className='text-center'>
							{t('aircraft-hero.title')}
							<Counter>{t('aircraft-hero.num')}</Counter>
							{t('aircraft-hero.title2')}
						</h1>
						<p className='text-center md:max-w-screen-sm'>{t('aircraft-hero.description')}</p>
					</div>
				</div>
			</section>
			<section>
				<div className='container gap-10'>
					<div className='card items-center gap-4 bg-gray-150 p-8 md:p-10'>
						<h2>{t('aircraft-contact-us.title')}</h2>
						<p className='text-center md:max-w-screen-sm'>{t('aircraft-contact-us.description')}</p>
						<Link href='?showBooking=Contact_us_aircraft' className='mt-4' scroll={false}>
							<button>{t('aircraft-contact-us.button')}</button>
						</Link>
					</div>
				</div>
			</section>
			<section>
				<div className='container gap-10'>
					<div className='gap-4'>
						<h2>{t('our-fleet.light-jets')}</h2>
						<VehiclesCarousel vehicles={smallJets} />
					</div>
					<div className='gap-4'>
						<h2>{t('our-fleet.midsize-jets')}</h2>
						<VehiclesCarousel vehicles={midJets} />
					</div>
					<div className='gap-4'>
						<h2>{t('our-fleet.heavy-jets')}</h2>
						<VehiclesCarousel vehicles={heavyJets} />
					</div>
				</div>
			</section>
			<MakeBookingSection isCard/>
			{/* <ContactUsSection
				title={t('partners-contact-us.title')}
				description={t('partners-contact-us.description')}
				buttonText={t('partners-contact-us.button')}
				imageSrc='/images/partners/contact_us.jpg'
			/> */}
		</main>
	)
}
