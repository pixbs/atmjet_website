import { sql as vercelSql } from '@vercel/postgres'
import { config } from 'dotenv'
import { relations } from 'drizzle-orm'
import {
	boolean,
	decimal,
	index,
	integer,
	numeric,
	pgTable,
	real,
	serial,
	text,
	timestamp,
	varchar,
} from 'drizzle-orm/pg-core'
import { drizzle } from 'drizzle-orm/vercel-postgres'

config({ path: '.env.local' })

export const airports = pgTable('airports', {
	id: serial('id').primaryKey(),
	iataCode: varchar('iata_code', { length: 255 }).notNull(),
	icaoCode: varchar('icao_code', { length: 255 }).notNull(),
	nameRus: varchar('name_rus', { length: 255 }).notNull(),
	nameEng: varchar('name_eng', { length: 255 }).notNull(),
	cityRus: varchar('city_rus', { length: 255 }).notNull(),
	cityEng: varchar('city_eng', { length: 255 }).notNull(),
	gmtOffset: varchar('gmt_offset', { length: 255 }).notNull(),
	countryRus: varchar('country_rus', { length: 255 }).notNull(),
	countryEng: varchar('country_eng', { length: 255 }).notNull(),
	isoCode: varchar('iso_code', { length: 255 }).notNull(),
	latitude: varchar('latitude', { length: 255 }).notNull(),
	longitude: varchar('longitude', { length: 255 }).notNull(),
})

export const emptyLegs = pgTable('atmjet_admin__empty_legs', {
	id: serial('id').primaryKey(),
	start: timestamp('start', { withTimezone: true }).notNull(),
	end: timestamp('end', { withTimezone: true }).notNull(),
	from: varchar('from', { length: 4 }).notNull(),
	to: varchar('to', { length: 4 }).notNull(),
	type: varchar('type', { length: 255 }),
	category: varchar('category', { length: 255 }),
	company: varchar('company', { length: 255 }),
	safety: varchar('safety', { length: 255 }),
	price: integer('price').default(0),
	order: integer('order'),
})

export const cityList = pgTable('city_list', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 30 }).notNull().default(''),
})

export const vehicles = pgTable(
	'vehicles',
	{
		id: serial('id').primaryKey().notNull(),
		article: varchar('article', { length: 50 }),
		price: decimal('price', { precision: 12, scale: 2 }).default('0.00'),
		old_price: decimal('old_price', { precision: 12, scale: 2 }).default('0.00'),
		weight: decimal('weight', { precision: 13, scale: 3 }).default('0.000'),
		image: varchar('image', { length: 255 }),
		thumb: varchar('thumb', { length: 255 }),
		vendor: integer('vendor').default(0),
		madeIn: varchar('made_in', { length: 100 }).default(''),
		new: integer('new').default(0),
		popular: integer('popular').default(0),
		favorite: integer('favorite').default(0),
		tags: text('tags'),
		color: text('color'),
		size: text('size'),
		source: integer('source').default(1),
		yachtMaxspeed: varchar('yacht_maxspeed', { length: 20 }),
		yachtSpeed: varchar('yacht_speed', { length: 20 }),
		yachtWinter_areas: varchar('yacht_winter_areas', { length: 255 }),
		yachtSummer_areas: varchar('yacht_summer_areas', { length: 255 }),
		yachtGuests: varchar('yacht_guests', { length: 20 }),
		yachtYear: varchar('yacht_year', { length: 20 }),
		yachtBuilder: varchar('yacht_builder', { length: 100 }),
		yachtLength: varchar('yacht_length', { length: 50 }),
		tailHomebase_country: varchar('tail_homebase_country', { length: 100 }),
		tailMaxpax: varchar('tail_maxpax', { length: 20 }),
		tailHomebase_name: varchar('tail_homebase_name', { length: 255 }),
		tailHomebase: varchar('tail_homebase', { length: 255 }),
		tailOperator: varchar('tail_operator', { length: 100 }),
		tailNumber: varchar('tail_number', { length: 50 }),
		tailModel: varchar('tail_model', { length: 100 }),
		tailManufacturer: varchar('tail_manufacturer', { length: 100 }),
		tailExteriorrefit: varchar('tail_exteriorrefit', { length: 20 }),
		tailInteriorrefit: varchar('tail_interiorrefit', { length: 20 }),
		tailHomebase_city: varchar('tail_homebase_city', { length: 100 }),
		tailYear: varchar('tail_year', { length: 20 }),
	},
	(table) => {
		return {
			articleIdx: index('article_idx').on(table.article),
			priceIdx: index('price_idx').on(table.price),
			oldPriceIdx: index('old_price_idx').on(table.old_price),
			vendorIdx: index('vendor_idx').on(table.vendor),
			newIdx: index('new_idx').on(table.new),
			favoriteIdx: index('favorite_idx').on(table.favorite),
			popularIdx: index('popular_idx').on(table.popular),
			madeInIdx: index('made_in_idx').on(table.madeIn),
		}
	},
)

export const yachts = pgTable('yachts', {
	id: serial('id').primaryKey(),
	name: text('name'),
	shipyard: text('shipyard'),
	year: integer('year'),
	length: numeric('length'),
	beam: numeric('beam'),
	draft: numeric('draft'),
	cabins: integer('cabins'),
	guests: integer('guests'),
	crew: integer('crew'),
	cruisingSpeed: integer('cruising_speed'),
	maxSpeed: integer('max_speed'),
	location: text('location'),
	pictures: text('pictures').array(),
})

export const newAirports = pgTable(
	'new_airports',
	{
		id: serial('id').primaryKey(),
		icao: text('icao'),
		iata: text('iata'),
		labelEn: text('label_en'),
		labelRu: text('label_ru'),
		cityEn: text('city_en'),
		cityRu: text('city_ru'),
		countryEn: text('country_en'),
		countryRu: text('country_ru'),
		passengers: text('passengers_per_year'),
		typeEn: text('type_en'),
		typeRu: text('type_ru'),
		aliesEn: text('alies_en'),
		aliesRu: text('alies_ru'),
		wikidata: text('wikidata'),
	},
	(table) => {
		return {
			icaoIdx: index('icao_idx').on(table.icao),
			iataIdx: index('iata_idx').on(table.iata),
			cityEnIdx: index('idx_airports_city_en').on(table.cityEn),
			cityRuIdx: index('idx_airports_city_ru').on(table.cityRu),
			labelEnIdx: index('idx_airports_label_en').on(table.labelEn),
			labelRuIdx: index('idx_airports_label_ru').on(table.labelRu),
			countryEnIdx: index('idx_airports_country_en').on(table.countryEn),
			countryRuIdx: index('idx_airports_country_ru').on(table.countryRu),
			aliesEnIdx: index('idx_airports_alies_en').on(table.aliesEn),
			aliesRuIdx: index('idx_airports_alies_ru').on(table.aliesRu),
		}
	},
)

export const person = pgTable('contact', {
	id: serial('id').primaryKey(),
	name: text('name'),
	phone: text('phone'),
	email: text('email'),
})

export const newYachts = pgTable(
	'new_yachts',
	{
		id: serial('id').primaryKey(),
		name: text('name'),
		slug: text('slug'),
		descriptionEn: text('description'),
		descriptionRu: text('description_ru'),
		manufacturer: text('manufacturer'),
		owner: text('owner'),
		contact: integer('contact_id'),
		bussinesPrice: numeric('bussines_price'),
		customerPrice: numeric('customer_price'),
		currency: text('currency'),
		captain: integer('captain_id'),
		location: text('location'),
		length: numeric('length'),
		guestsDay: numeric('guests_day'),
		guestsNight: numeric('guests_night'),
		cabins: text('cabins'),
		bathrooms: text('bathrooms'),
		refit: numeric('refit'),
		minHours: numeric('min_hours'),
		includedRu: text('included'),
		includedEn: text('included_en'),
		photos: text('photos').array(),
	},
	(table) => {
		return {
			contactIdx: index('contact_idx').on(table.contact),
			captainIdx: index('captain_idx').on(table.captain),
			yachtNameIdx: index('yacht_name_idx').on(table.name),
		}
	},
)

export const newYachtsRelations = relations(newYachts, ({ one }) => ({
	contact: one(person, {
		fields: [newYachts.contact],
		references: [person.id],
	}),
	captain: one(person, {
		fields: [newYachts.captain],
		references: [person.id],
	}),
}))

export const users = pgTable('atmjet_admin__users', {
	id: serial('id').primaryKey(),
	username: varchar('username', { length: 256 }).notNull(),
	password: text('password').notNull(),
})

export const aircrafts = pgTable('aircrafts', {
	id: serial('id').primaryKey().notNull().unique(),
	slug: text('slug').notNull().unique(),

	registrationNumber: text('registration_number'),
	yearOfProduction: integer('year_of_production'),
	passengersMax: integer('passengers_max'),
	serialNumber: text('serial_number'),
	hoursFlown: integer('hours_flown'),
	cycles: integer('cycles'),
	verifiedAt: text('verified_at'),
	techOperator: text('tech_operator'),

	isCargo: boolean('is_cargo').default(false),
	isForSale: boolean('is_for_sale').default(false),
	isForLease: boolean('is_for_lease').default(false),
	isForCharter: boolean('is_for_charter').default(false),

	pdfAttachment: text('pdf_attachment'),
	pdfAttachmentName: text('pdf_attachment_name'),

	companySlug: text('company_slug'),
	companyName: text('company_name'),

	extensionRefurbishment: boolean('extension_refurbishment').default(false),
	extensionView360: text('extension_view_360'),
	extensionCabinCrew: boolean('extension_cabin_crew').default(false),
	extensionDivanSeats: integer('extension_divan_seats'),
	extensionLavatory: boolean('extension_lavatory').default(false),
	extensionBeds: integer('extension_beds'),
	extensionHotMeal: boolean('extension_hot_meal').default(false),
	extensionWirelessInternet: boolean('extension_wireless_internet').default(false),
	extensionPetsAllowed: boolean('extension_pets_allowed').default(false),
	extensionCabinHeight: text('extension_cabin_height'),
	extensionCabinLength: text('extension_cabin_length'),
	extensionCabinWidth: text('extension_cabin_width'),
	extensionLuggageVolume: text('extension_luggage_volume'),
	extensionShower: boolean('extension_shower').default(false),
	extensionSatellitePhone: boolean('extension_satellite_phone').default(false),
	extensionSleepingPlaces: integer('extension_sleeping_places'),
	extensionDescription: text('extension_description'),
	extensionSpecEquipment: text('extension_spec_equipment'),

	airportIata: text('airport_iata'),
	airportIcao: text('airport_icao'),
	airportName: text('airport_name'),

	aircraftTypeSlug: text('aircraft_type_slug'),
	aircraftTypeName: text('aircraft_type_name'),
	aircraftTypeSpeedTypical: real('aircraft_type_speed_typical'),
	aircraftTypeRangeMaximum: integer('aircraft_type_range_maximum'),
	aircraftTypeCabinHeight: real('aircraft_type_cabin_height'),
	aircraftTypeCabinLength: real('aircraft_type_cabin_length'),
	aircraftTypeCabinWidth: real('aircraft_type_cabin_width'),
	aircraftTypePaxMaximum: integer('aircraft_type_pax_maximum'),
	aircraftTypeAircraftClassName: text('aircraft_type_aircraft_class_name'),
})

export const aircraftImagesTable = pgTable('aircraft_images', {
	id: serial('id').primaryKey().notNull(),
	aircraftId: integer('aircraft_id')
		.notNull()
		.references(() => aircrafts.id, { onDelete: 'cascade' }),
	type: text('type', { enum: ['exterior', 'cabin', 'cockpit'] }).notNull(),
	url: text('url').notNull(),
})

export const migrationStatusTable = pgTable('migration_status', {
	id: serial('id').primaryKey().notNull(),
	lastProcessedPage: integer('last_processed_page'),
	lastProcessedSlug: text('last_processed_slug'),
})

export const aircraftsRelations = relations(aircrafts, ({ many }) => ({
	images: many(aircraftImagesTable),
}))

export const aircraftImagesRelations = relations(aircraftImagesTable, ({ one }) => ({
	aircraft: one(aircrafts, {
		fields: [aircraftImagesTable.aircraftId],
		references: [aircrafts.id],
	}),
}))

export const db = drizzle(vercelSql)
