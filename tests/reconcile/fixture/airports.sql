-- The legacy airport tables and the empty legs that name them, as `docs/legacy-inventory.md`
-- section 8 describes them. Codes are fictional (ZZ..), so they never meet a seeded airport.
CREATE TABLE {{schema}}.airports (
  id serial PRIMARY KEY,
  iata_code varchar(255) NOT NULL,
  icao_code varchar(255) NOT NULL,
  name_rus varchar(255) NOT NULL,
  name_eng varchar(255) NOT NULL,
  city_rus varchar(255) NOT NULL,
  city_eng varchar(255) NOT NULL,
  gmt_offset varchar(255) NOT NULL,
  country_rus varchar(255) NOT NULL,
  country_eng varchar(255) NOT NULL,
  iso_code varchar(255) NOT NULL,
  latitude varchar(255) NOT NULL,
  longitude varchar(255) NOT NULL
);

CREATE TABLE {{schema}}.new_airports (
  id serial PRIMARY KEY,
  icao text, iata text,
  label_en text, label_ru text,
  city_en text, city_ru text,
  country_en text, country_ru text,
  passengers_per_year text,
  type_en text, type_ru text,
  alies_en text, alies_ru text,
  wikidata text
);

CREATE TABLE {{schema}}.atmjet_admin__empty_legs (
  id serial PRIMARY KEY,
  "start" timestamptz NOT NULL,
  "end" timestamptz NOT NULL,
  "from" varchar(4) NOT NULL,
  "to" varchar(4) NOT NULL,
  type varchar(255),
  category varchar(255),
  company varchar(255),
  safety varchar(255),
  price integer DEFAULT 0,
  "order" integer
);

INSERT INTO {{schema}}.airports
  (iata_code, icao_code, name_rus, name_eng, city_rus, city_eng, gmt_offset, country_rus, country_eng, iso_code, latitude, longitude)
VALUES
  -- In both tables, spelled differently in each.
  ('ZAA', 'ZZAA', 'Альфа', 'Alpha Intl', 'Альфа-Сити', 'Alpha City', '+4', 'Альфия', 'Alphaland', 'za', '25.2528', '55.3644'),
  -- Only here: its offset and position come from nowhere else.
  ('ZAB', 'ZZAB', 'Браво', 'Bravo Field', 'Браво', 'Bravo', '-5', 'Альфия', 'Alphaland', 'ZA', '-33,9', '151.17'),
  -- Lower case with stray spaces, and a position out of range.
  ('zac', ' zzac ', 'Чарли', 'Charlie', 'Чарли', 'Charlie', '0', 'Альфия', 'Alphaland', 'ZA', '95', 'east'),
  -- No ICAO code at all: kept on its IATA code.
  ('ZAD', '', 'Дельта', 'Delta Strip', 'Дельта', 'Delta', '+1', 'Альфия', 'Alphaland', 'ZA', '', '');

INSERT INTO {{schema}}.new_airports
  (icao, iata, label_en, label_ru, city_en, city_ru, country_en, country_ru, passengers_per_year, type_en, type_ru, alies_en, alies_ru, wikidata)
VALUES
  ('ZZAA', 'ZAA', 'Alpha International', 'Альфа', 'Alpha City', 'Альфа-Сити', 'Alphaland', 'Альфия', '49 837 000', 'large airport', 'крупный аэропорт', 'Alpha, Big A', 'Альфа, Большая А', 'Q900001'),
  ('ZZAC', 'ZAC', 'Charlie Regional', 'Чарли', 'Charlie', 'Чарли', 'Alphaland', 'Альфия', '1,200', NULL, NULL, NULL, NULL, 'Q900003'),
  ('ZZAE', 'ZAE', 'Echo', 'Эхо', 'Echo', 'Эхо', 'Alphaland', 'Альфия', 'n/a', NULL, NULL, NULL, NULL, 'Q900005'),
  -- Neither code: kept on its Wikidata item.
  (NULL, NULL, 'Foxtrot Heliport', 'Фокстрот', 'Foxtrot', 'Фокстрот', 'Alphaland', 'Альфия', NULL, 'heliport', 'вертодром', NULL, NULL, 'Q900006');

INSERT INTO {{schema}}.atmjet_admin__empty_legs ("start", "end", "from", "to", price, "order")
VALUES
  ('2026-10-01T08:00:00Z', '2026-10-01T12:00:00Z', 'ZZAA', 'ZZAE', 9000, 1),
  ('2026-10-02T08:00:00Z', '2026-10-02T12:00:00Z', 'zzab', 'ZZAC', 12000, 2);
