'use client'

import Select from '@/components/form/select'
import { aircrafts as aircraftScheme } from '@/lib/drizzle'
import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'
import { getAircraftCovers, getAircrafts } from './actions'
import AircraftCard from './aircraft_card'

function AircraftsList() {
	const [aircrafts, setAircrafts] = useState<(typeof aircraftScheme.$inferSelect)[]>([])
	const [covers, setCovers] = useState<string[]>([])
	const [passangers, setPassangers] = useState([0, 400])
	const [sort, setSort] = useState<'size' | 'range' | 'passengers' | undefined>('size')
	const [order, setOrder] = useState<'asc' | 'desc'>('asc')
	const locale = useLocale()

	useEffect(() => {
		const fetchData = async () => {
			const fetchedAircrafts = await getAircrafts(0, passangers, sort, order)
			setAircrafts(fetchedAircrafts)
			const fetchedCovers = await getAircraftCovers(fetchedAircrafts.map((aircraft) => aircraft.id))
			setCovers(fetchedCovers.map((cover) => cover.url))
		}
		fetchData()
	}, [passangers, sort, order])

	const loadMore = async () => {
		const newAircrafts = await getAircrafts(aircrafts.length)
		setAircrafts([...aircrafts, ...newAircrafts])
		const newCovers = await getAircraftCovers(newAircrafts.map((aircraft) => aircraft.id))
		setCovers([...covers, ...newCovers.map((cover) => cover.url)])
	}

	return (
		<>
			<section>
				<div className='container'>
					<div className='flex flex-col gap-6 rounded-3xl border border-gray-300 bg-gray-150 p-6 md:p-10'>
						<h3 className='col-span-full'>
							{locale === 'en' ? 'Filter aircraft' : 'Фильтровать самолеты'}
						</h3>
						<div className='grid gap-[2px] overflow-hidden rounded-2xl md:grid-cols-2 md:gap-4 md:rounded-none'>
							{/* <Select
                            name='type'
                            className='w-full'
                            multiple
                            defaultValue={'light'}
                            label={locale === 'en' ? 'Type' : 'Тип'}
                            id='type'
                        >
                            <option value='light'>{locale === 'en' ? 'Light' : 'Легковой'}</option>
                            <option value='midsize'>{locale === 'en' ? 'Midsize' : 'Средний'}</option>
                            <option value='heavy'>{locale === 'en' ? 'Heavy' : 'Тяжелый'}</option>
                            <option value='Airliner'>{locale === 'en' ? 'Airliner' : 'Пассажирский'}</option>
                            <option value='Super midsize'>{locale === 'en' ? 'Super midsize' : 'Супер средний'}</option>
                            <option value='Ultra long range'>{locale === 'en' ? 'Ultra long range' : 'Ультра дальнего действия'}</option>
                            <option value='VIP airliner'>{locale === 'en' ? 'VIP airliner' : 'VIP пассажирский'}</option>
                        </Select> */}
							{/* <DualRange
								value={passangers}
								onValueChange={setPassangers}
								min={0}
								max={400}
								label={locale === 'en' ? 'Passangers' : 'Пассажиры'}
								name='passangers'
								id='passangers'
							/> */}
							<Select
								name='sort'
								className='w-full'
								defaultValue='size'
								label={locale === 'en' ? 'Sort by' : 'Сортировать по'}
								id='sort'
								value={sort}
								onChange={(e) => setSort(e.target.value as typeof sort)}
							>
								<option value='size'>{locale === 'en' ? 'Size' : 'Размер'}</option>
								<option value='passangers'>{locale === 'en' ? 'Passangers' : 'Пассажиры'}</option>
								<option value='range'>{locale === 'en' ? 'Range' : 'Дальность'}</option>
							</Select>
							<Select
								name='order'
								className='w-full'
								defaultValue='asc'
								label={locale === 'en' ? 'Order' : 'Порядок'}
								id='order'
								value={order}
								onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
							>
								<option value='asc'>{locale === 'en' ? 'Ascending' : 'Возрастанию'}</option>
								<option value='desc'>{locale === 'en' ? 'Descending' : 'Убыванию'}</option>
							</Select>
						</div>
					</div>
				</div>
			</section>
			<section>
				<div className='container gap-10 md:grid md:grid-cols-2 lg:grid-cols-3'>
					{aircrafts.map((aircraft, index) => (
						<AircraftCard key={index} cover={covers[index]} {...aircraft} />
					))}
					<button className='big col-span-full self-center' onClick={loadMore}>
						{locale === 'ru' ? 'Показать еще' : 'Show more'}
					</button>
				</div>
			</section>
		</>
	)
}

export default AircraftsList
