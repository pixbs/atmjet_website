import {
  pgTable,
  serial,
  varchar
} from 'drizzle-orm/pg-core'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import { sql } from '@vercel/postgres'
import { drizzle } from 'drizzle-orm/vercel-postgres'


export const airports = pgTable("airports", {
  id: serial("id").primaryKey(),
  iataCode: varchar("iata_code", { length: 255 }).notNull(),
  icaoCode: varchar("icao_code", { length: 255 }).notNull(),
  nameRus: varchar("name_rus", { length: 255 }).notNull(),
  nameEng: varchar("name_eng", { length: 255 }).notNull(),
  cityRus: varchar("city_rus", { length: 255 }).notNull(),
  cityEng: varchar("city_eng", { length: 255 }).notNull(),
  gmtOffset: varchar("gmt_offset", { length: 255 }).notNull(),
  countryRus: varchar("country_rus", { length: 255 }).notNull(),
  countryEng: varchar("country_eng", { length: 255 }).notNull(),
  isoCode: varchar("iso_code", { length: 255 }).notNull(),
  latitude: varchar("latitude", { length: 255 }).notNull(),
  longitude: varchar("longitude", { length: 255 }).notNull(),
});

export const cityList = pgTable("city_list", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 30 }).notNull().default("")
});

export const db = drizzle(sql)