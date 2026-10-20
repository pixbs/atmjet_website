-- The sale catalogue `/sales_yachts` read, as `docs/legacy-inventory.md` section 8 describes it:
-- no slug and no price. Names and addresses are fictional.
CREATE TABLE {{schema}}.yachts (
  id serial PRIMARY KEY,
  name text,
  shipyard text,
  year integer,
  length numeric,
  beam numeric,
  draft numeric,
  cabins integer,
  guests integer,
  crew integer,
  cruising_speed integer,
  max_speed integer,
  location text,
  pictures text[]
);

INSERT INTO {{schema}}.yachts
  (name, shipyard, year, length, beam, draft, cabins, guests, crew, cruising_speed, max_speed, location, pictures)
VALUES
  ('Zephyr', 'Benetti', 2019, 120.5, 25, 8, 6, 12, 9, 12, 16, 'Monaco',
   ARRAY['https://images.example.test/zephyr-1.jpg', 'https://images.example.test/zephyr-2.jpg']),
  -- The same name again: the second needs a URL of its own.
  ('Zephyr', 'Feadship', NULL, 90, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  ('Звезда Моря', NULL, 2001, NULL, NULL, NULL, 3, 6, 2, NULL, NULL, 'Sochi', ARRAY['', 'https://images.example.test/zvezda.jpg']);
