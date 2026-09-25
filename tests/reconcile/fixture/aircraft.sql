-- The aircraft catalogue and its images, as `docs/legacy-inventory.md` section 8 describes
-- them (no DDL survives for either). Registrations and slugs are fictional.
CREATE TABLE {{schema}}.aircrafts (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  registration_number text,
  year_of_production integer,
  passengers_max integer,
  serial_number text,
  hours_flown integer,
  cycles integer,
  verified_at text,
  tech_operator text,
  is_cargo boolean DEFAULT false,
  is_for_sale boolean DEFAULT false,
  is_for_lease boolean DEFAULT false,
  is_for_charter boolean DEFAULT false,
  pdf_attachment text,
  pdf_attachment_name text,
  company_slug text,
  company_name text,
  extension_refurbishment boolean,
  extension_view_360 text,
  extension_cabin_crew boolean,
  extension_divan_seats integer,
  extension_lavatory boolean,
  extension_beds integer,
  extension_hot_meal boolean,
  extension_wireless_internet boolean,
  extension_pets_allowed boolean,
  extension_cabin_height text,
  extension_cabin_length text,
  extension_cabin_width text,
  extension_luggage_volume text,
  extension_shower boolean,
  extension_satellite_phone boolean,
  extension_sleeping_places integer,
  extension_description text,
  extension_spec_equipment text,
  airport_iata text,
  airport_icao text,
  airport_name text,
  aircraft_type_slug text,
  aircraft_type_name text,
  aircraft_type_speed_typical real,
  aircraft_type_range_maximum integer,
  aircraft_type_cabin_height real,
  aircraft_type_cabin_length real,
  aircraft_type_cabin_width real,
  aircraft_type_pax_maximum integer,
  aircraft_type_aircraft_class_name text
);

CREATE TABLE {{schema}}.aircraft_images (
  id serial PRIMARY KEY,
  aircraft_id integer NOT NULL REFERENCES {{schema}}.aircrafts (id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('exterior', 'cabin', 'cockpit')),
  url text NOT NULL
);

INSERT INTO {{schema}}.aircrafts (
  slug, registration_number, year_of_production, passengers_max, serial_number, hours_flown, cycles,
  verified_at, tech_operator, is_cargo, is_for_sale, is_for_lease, is_for_charter,
  company_slug, company_name, extension_view_360, extension_cabin_crew, extension_lavatory,
  extension_cabin_height, extension_luggage_volume, extension_description,
  airport_iata, airport_icao, airport_name,
  aircraft_type_slug, aircraft_type_name, aircraft_type_speed_typical, aircraft_type_range_maximum,
  aircraft_type_cabin_height, aircraft_type_cabin_length, aircraft_type_cabin_width,
  aircraft_type_pax_maximum, aircraft_type_aircraft_class_name
) VALUES
  -- Filled in far enough for the rich layout, with three images.
  ('zzjet-zz-001', 'ZZ-001', 2016, 14, '6101', 3200, 1400, '2024-05-01', 'Zed Aviation',
   false, false, false, true, 'zed-air', 'Zed Air', 'https://example.test/360/zz-001', true, true,
   '1.9 m', '5.4 m3', 'A long-range jet.', 'ZAA', 'ZZAA', 'Alpha International',
   'zzjet-6000', 'ZZJet 6000', 904.5, 12964, 1.85, 13.97, 2.49, 19, 'Heavy jet'),
  -- Its base is an airport no table has, and it is for sale and for cargo.
  ('zzprop-zz002', 'zz002', 2009, 8, NULL, NULL, NULL, NULL, NULL,
   true, true, false, false, NULL, NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL, 'QQZZ', NULL,
   'zzprop-8', 'ZZProp 8', NULL, 2600, 1.46, 5.2, 1.5, 8, 'Turboprop'),
  -- No registration at all.
  ('zzlight-unregistered', '', NULL, 6, NULL, NULL, NULL, NULL, NULL,
   false, false, false, true, NULL, NULL, NULL, NULL, NULL,
   NULL, NULL, NULL, NULL, NULL, NULL,
   NULL, 'ZZLight', NULL, NULL, NULL, NULL, NULL, NULL, 'Light jet');

-- Interleaved between aircraft, so the order is by id rather than by insertion per aircraft.
INSERT INTO {{schema}}.aircraft_images (aircraft_id, type, url) VALUES
  (1, 'exterior', 'https://images.example.test/zz-001/exterior.jpg'),
  (2, 'exterior', 'https://images.example.test/zz002/exterior.jpg'),
  (1, 'cabin', 'https://images.example.test/zz-001/cabin.jpg '),
  (1, 'cockpit', 'https://images.example.test/zz-001/cockpit.jpg');
