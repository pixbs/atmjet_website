-- The older mixed catalogue of planes and yachts, as `docs/legacy-inventory.md` section 8
-- describes it. `image` and `thumb` hold a host and path with no scheme, as the legacy rows did.
CREATE TABLE {{schema}}.vehicles (
  id serial PRIMARY KEY,
  article varchar(50),
  price decimal(12, 2) DEFAULT 0.00,
  old_price decimal(12, 2),
  weight decimal(13, 3),
  image varchar(255),
  thumb varchar(255),
  vendor integer DEFAULT 0,
  made_in varchar(100) DEFAULT '',
  new integer DEFAULT 0,
  popular integer DEFAULT 0,
  favorite integer DEFAULT 0,
  tags text,
  color text,
  size text,
  source integer DEFAULT 1,
  yacht_maxspeed varchar(20),
  yacht_speed varchar(20),
  yacht_winter_areas varchar(255),
  yacht_summer_areas varchar(255),
  yacht_guests varchar(20),
  yacht_year varchar(20),
  yacht_builder varchar(100),
  yacht_length varchar(50),
  tail_homebase_country varchar(100),
  tail_maxpax varchar(20),
  tail_homebase_name varchar(255),
  tail_homebase varchar(255),
  tail_operator varchar(100),
  tail_number varchar(50),
  tail_model varchar(100),
  tail_manufacturer varchar(100),
  tail_exteriorrefit varchar(20),
  tail_interiorrefit varchar(20),
  tail_homebase_city varchar(100),
  tail_year varchar(20)
);

INSERT INTO {{schema}}.vehicles (
  image, thumb, vendor, price, source, tail_number, tail_model, tail_manufacturer, tail_year,
  tail_maxpax, tail_operator, tail_interiorrefit, tail_exteriorrefit, tail_homebase,
  tail_homebase_name, tail_homebase_city, tail_homebase_country, yacht_builder
) VALUES
  -- The catalogue's ZZ-001 again, lower case: it only fills what the catalogue left empty.
  ('atmjet.ams3.digitaloceanspaces.com/planes/zz-001.jpg', 'atmjet.ams3.digitaloceanspaces.com/planes/zz-001-thumb.jpg',
   3, 0.00, 1, 'zz-001', 'ZZJet 6000 ER', 'Zed Aerospace', '2015', '16', 'Other Operator', '2021', NULL,
   'ZZAB', 'Bravo Field', 'Bravo', 'Alphaland', NULL),
  -- A plane only this table has.
  ('atmjet.ams3.cdn.digitaloceanspaces.com/planes/zz-777.jpg', NULL,
   0, 1500000.00, 1, 'ZZ-777', NULL, 'Zed Aerospace', '2011', '12', 'Seven Air', NULL, '2019',
   'ZZAA', 'Alpha International', 'Alpha City', 'Alphaland', NULL),
  -- A yacht: no tail number, so not imported.
  ('atmjet.ams3.digitaloceanspaces.com/yachts/zeta.jpg', NULL,
   0, 0.00, 2, '', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Azimut'),
  -- The same plane as the second row, written again with spaces: it merges into that one.
  (NULL, NULL, 0, 0.00, 1, ' ZZ-777 ', 'ZZProp 777', NULL, NULL, NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL, NULL),
  -- A year nobody can read, and a base no airport answers to.
  (NULL, NULL, 0, 0.00, 1, 'ZZ888', 'ZZLight 8', NULL, 'n/a', '6', NULL, NULL, NULL,
   'QQZZ', NULL, NULL, NULL, NULL),
  -- Another yacht, with no tail number at all.
  (NULL, NULL, 0, 0.00, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Sunseeker');
