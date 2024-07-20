import { decimal, index, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core'
import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { config } from 'dotenv';

config({ path: '.env.local' });

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

export const cityList = pgTable('city_list', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 30 }).notNull().default(''),
})

export const vehicles = pgTable('vehicles', {
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
    };
  });

export const db = drizzle(sql, { logger: true })
