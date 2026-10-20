-- The charter catalogue and the contacts it points at without a foreign key, as
-- `docs/legacy-inventory.md` section 8 and `atmjet-admin/drizzle/0003_*.sql` describe them.
-- Names, numbers and addresses are fictional.
CREATE TABLE {{schema}}.contact (
  id serial PRIMARY KEY,
  name text,
  phone text,
  email text
);

CREATE TABLE {{schema}}.new_yachts (
  id serial PRIMARY KEY,
  name text,
  slug text,
  description text,
  description_ru text,
  manufacturer text,
  owner text,
  contact_id integer,
  bussines_price numeric,
  customer_price numeric,
  currency text,
  captain_id integer,
  location text,
  length numeric,
  guests_day numeric,
  guests_night numeric,
  cabins text,
  bathrooms text,
  refit numeric,
  min_hours numeric,
  included text,
  included_en text,
  photos text[]
);

INSERT INTO {{schema}}.contact (name, phone, email) VALUES
  ('Zed Broker', '+971500000001', 'broker@example.test'),
  (NULL, '+971500000002', 'not-an-email'),
  ('Zed Captain', NULL, NULL);

INSERT INTO {{schema}}.new_yachts (
  name, slug, description, description_ru, manufacturer, owner, contact_id, bussines_price,
  customer_price, currency, captain_id, location, length, guests_day, guests_night, cabins,
  bathrooms, refit, min_hours, included, included_en, photos
) VALUES
  -- Filled in the way the legacy admin filled a row.
  ('Zeta One', 'zeta_one', 'A day on the water.' || chr(10) || 'Crew included.', 'День на воде.',
   'Azimut', 'Zed Owner', 1, 900, 1200, 'aed', 3, 'Dubai Marina', 62, 12, 6, '3+1', '2 / 2',
   2020, 3, 'Капитан, топливо', 'Captain, fuel',
   ARRAY['https://images.example.test/zeta-1.jpg', 'https://images.example.test/zeta-2.jpg', ' https://images.example.test/zeta-3.jpg ']),
  -- A Cyrillic name, which the legacy admin slugged to nothing, a contact that does not exist,
  -- and a currency the site does not price in.
  ('Звезда', '', NULL, NULL, NULL, NULL, 99, NULL, 800, 'Rubles', NULL, 'Sochi', NULL, NULL,
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, ARRAY[]::text[]),
  -- The first yacht's slug again: the legacy admin never refused a duplicate.
  ('Zeta One', 'zeta_one', NULL, NULL, 'Azimut', NULL, 2, NULL, NULL, NULL, NULL, NULL, 55,
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, ARRAY['https://images.example.test/zeta-b.jpg']),
  -- No name at all.
  (NULL, 'nameless', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);
