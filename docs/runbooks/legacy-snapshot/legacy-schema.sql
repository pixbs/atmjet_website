--
-- PostgreSQL database dump
--

\restrict 9nwyRSogklg3wiOY32gf1OcUXaLxPsHz84REMvjelkcH4LgiDBnEd1SiwdjWy9v

-- Dumped from database version 16.15 (eb11870)
-- Dumped by pg_dump version 18.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: airports_search_vector_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.airports_search_vector_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple',
    COALESCE(NEW.city_en, '') || ' ' ||
    COALESCE(NEW.label_en, '') || ' ' ||
    COALESCE(NEW.country_en, '') || ' ' ||
    COALESCE(NEW.iata, '') || ' ' ||
    COALESCE(NEW.icao, '') || ' ' ||
    COALESCE(NEW.city_ru, '') || ' ' ||
    COALESCE(NEW.label_ru, '') || ' ' ||
    COALESCE(NEW.country_ru, '')
  );
  RETURN NEW;
END
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: aircraft_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aircraft_images (
    id integer NOT NULL,
    aircraft_id integer NOT NULL,
    type text NOT NULL,
    url text NOT NULL
);


--
-- Name: aircraft_images_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.aircraft_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: aircraft_images_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.aircraft_images_id_seq OWNED BY public.aircraft_images.id;


--
-- Name: aircrafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aircrafts (
    id integer NOT NULL,
    slug text NOT NULL,
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
    extension_refurbishment boolean DEFAULT false,
    extension_view_360 text,
    extension_cabin_crew boolean DEFAULT false,
    extension_divan_seats integer,
    extension_lavatory boolean DEFAULT false,
    extension_beds integer,
    extension_hot_meal boolean DEFAULT false,
    extension_wireless_internet boolean DEFAULT false,
    extension_pets_allowed boolean DEFAULT false,
    extension_cabin_height text,
    extension_cabin_length text,
    extension_cabin_width text,
    extension_luggage_volume text,
    extension_shower boolean DEFAULT false,
    extension_satellite_phone boolean DEFAULT false,
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


--
-- Name: aircrafts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.aircrafts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: aircrafts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.aircrafts_id_seq OWNED BY public.aircrafts.id;


--
-- Name: airports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.airports (
    id integer NOT NULL,
    iata_code character varying(255) NOT NULL,
    icao_code character varying(255) NOT NULL,
    name_rus character varying(255) NOT NULL,
    name_eng character varying(255) NOT NULL,
    city_rus character varying(255) NOT NULL,
    city_eng character varying(255) NOT NULL,
    gmt_offset character varying(255) NOT NULL,
    country_rus character varying(255) NOT NULL,
    country_eng character varying(255) NOT NULL,
    iso_code character varying(255) NOT NULL,
    latitude character varying(255) NOT NULL,
    longitude character varying(255) NOT NULL
);


--
-- Name: airports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.airports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: airports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.airports_id_seq OWNED BY public.airports.id;


--
-- Name: atmjet_admin__empty_legs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.atmjet_admin__empty_legs (
    id integer NOT NULL,
    start timestamp with time zone NOT NULL,
    "end" timestamp with time zone NOT NULL,
    "from" character varying(4) NOT NULL,
    "to" character varying(4) NOT NULL,
    type character varying(255),
    company character varying(255),
    safety character varying(255),
    price integer DEFAULT 0,
    "order" integer,
    category character varying(255)
);


--
-- Name: atmjet_admin__empty_legs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.atmjet_admin__empty_legs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: atmjet_admin__empty_legs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.atmjet_admin__empty_legs_id_seq OWNED BY public.atmjet_admin__empty_legs.id;


--
-- Name: atmjet_admin__users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.atmjet_admin__users (
    id integer NOT NULL,
    username character varying(256) NOT NULL,
    password text NOT NULL
);


--
-- Name: atmjet_admin__users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.atmjet_admin__users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: atmjet_admin__users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.atmjet_admin__users_id_seq OWNED BY public.atmjet_admin__users.id;


--
-- Name: city_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.city_list (
    id integer NOT NULL,
    name character varying(30) DEFAULT ''::character varying NOT NULL
);


--
-- Name: city_list_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.city_list_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: city_list_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.city_list_id_seq OWNED BY public.city_list.id;


--
-- Name: contact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact (
    id integer NOT NULL,
    name text,
    phone text,
    email text
);


--
-- Name: contact_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: contact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_id_seq OWNED BY public.contact.id;


--
-- Name: new_yachts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.new_yachts (
    id integer NOT NULL,
    name text,
    description text,
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
    photos text[],
    slug text,
    description_ru text,
    included_en text
);


--
-- Name: localYachts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."localYachts_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: localYachts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."localYachts_id_seq" OWNED BY public.new_yachts.id;


--
-- Name: migration_status; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migration_status (
    id integer NOT NULL,
    last_processed_page integer,
    last_processed_slug text
);


--
-- Name: migration_status_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migration_status_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migration_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migration_status_id_seq OWNED BY public.migration_status.id;


--
-- Name: new_airports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.new_airports (
    id integer NOT NULL,
    icao text,
    iata text,
    label_en text,
    label_ru text,
    city_en text,
    city_ru text,
    country_en text,
    country_ru text,
    passengers_per_year text,
    type_en text,
    type_ru text,
    alies_en text,
    alies_ru text,
    wikidata text
);


--
-- Name: new_airports_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.new_airports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: new_airports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.new_airports_id_seq OWNED BY public.new_airports.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    article character varying(50),
    price numeric(12,2) DEFAULT 0.00,
    old_price numeric(12,2) DEFAULT 0.00,
    weight numeric(13,3) DEFAULT 0.000,
    image character varying(255),
    thumb character varying(255),
    vendor integer DEFAULT 0,
    made_in character varying(100) DEFAULT ''::character varying,
    new integer DEFAULT 0,
    popular integer DEFAULT 0,
    favorite integer DEFAULT 0,
    tags text,
    color text,
    size text,
    source integer DEFAULT 1,
    yacht_maxspeed character varying(20),
    yacht_speed character varying(20),
    yacht_winter_areas character varying(255),
    yacht_summer_areas character varying(255),
    yacht_guests character varying(20),
    yacht_year character varying(20),
    yacht_builder character varying(100),
    yacht_length character varying(50),
    tail_homebase_country character varying(100),
    tail_maxpax character varying(20),
    tail_homebase_name character varying(255),
    tail_homebase character varying(255),
    tail_operator character varying(100),
    tail_number character varying(50),
    tail_model character varying(100),
    tail_manufacturer character varying(100),
    tail_exteriorrefit character varying(20),
    tail_interiorrefit character varying(20),
    tail_homebase_city character varying(100),
    tail_year character varying(20)
);


--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: yachts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.yachts (
    id integer NOT NULL,
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


--
-- Name: yachts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.yachts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: yachts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.yachts_id_seq OWNED BY public.yachts.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: aircraft_images id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircraft_images ALTER COLUMN id SET DEFAULT nextval('public.aircraft_images_id_seq'::regclass);


--
-- Name: aircrafts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircrafts ALTER COLUMN id SET DEFAULT nextval('public.aircrafts_id_seq'::regclass);


--
-- Name: airports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airports ALTER COLUMN id SET DEFAULT nextval('public.airports_id_seq'::regclass);


--
-- Name: atmjet_admin__empty_legs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atmjet_admin__empty_legs ALTER COLUMN id SET DEFAULT nextval('public.atmjet_admin__empty_legs_id_seq'::regclass);


--
-- Name: atmjet_admin__users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atmjet_admin__users ALTER COLUMN id SET DEFAULT nextval('public.atmjet_admin__users_id_seq'::regclass);


--
-- Name: city_list id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_list ALTER COLUMN id SET DEFAULT nextval('public.city_list_id_seq'::regclass);


--
-- Name: contact id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact ALTER COLUMN id SET DEFAULT nextval('public.contact_id_seq'::regclass);


--
-- Name: migration_status id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migration_status ALTER COLUMN id SET DEFAULT nextval('public.migration_status_id_seq'::regclass);


--
-- Name: new_airports id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_airports ALTER COLUMN id SET DEFAULT nextval('public.new_airports_id_seq'::regclass);


--
-- Name: new_yachts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_yachts ALTER COLUMN id SET DEFAULT nextval('public."localYachts_id_seq"'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: yachts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yachts ALTER COLUMN id SET DEFAULT nextval('public.yachts_id_seq'::regclass);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: aircraft_images aircraft_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircraft_images
    ADD CONSTRAINT aircraft_images_pkey PRIMARY KEY (id);


--
-- Name: aircrafts aircrafts_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircrafts
    ADD CONSTRAINT aircrafts_id_unique PRIMARY KEY (id);


--
-- Name: aircrafts aircrafts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircrafts
    ADD CONSTRAINT aircrafts_slug_unique UNIQUE (slug);


--
-- Name: airports airports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airports
    ADD CONSTRAINT airports_pkey PRIMARY KEY (id);


--
-- Name: atmjet_admin__empty_legs atmjet_admin__empty_legs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atmjet_admin__empty_legs
    ADD CONSTRAINT atmjet_admin__empty_legs_pkey PRIMARY KEY (id);


--
-- Name: atmjet_admin__users atmjet_admin__users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.atmjet_admin__users
    ADD CONSTRAINT atmjet_admin__users_pkey PRIMARY KEY (id);


--
-- Name: city_list city_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city_list
    ADD CONSTRAINT city_list_pkey PRIMARY KEY (id);


--
-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id);


--
-- Name: new_yachts localYachts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_yachts
    ADD CONSTRAINT "localYachts_pkey" PRIMARY KEY (id);


--
-- Name: migration_status migration_status_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migration_status
    ADD CONSTRAINT migration_status_pkey PRIMARY KEY (id);


--
-- Name: new_airports new_airports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.new_airports
    ADD CONSTRAINT new_airports_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: yachts yachts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.yachts
    ADD CONSTRAINT yachts_pkey PRIMARY KEY (id);


--
-- Name: article_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX article_idx ON public.vehicles USING btree (article);


--
-- Name: captain_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX captain_idx ON public.new_yachts USING btree (captain_id);


--
-- Name: contact_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX contact_idx ON public.new_yachts USING btree (contact_id);


--
-- Name: favorite_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX favorite_idx ON public.vehicles USING btree (favorite);


--
-- Name: iata_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX iata_idx ON public.new_airports USING btree (iata);


--
-- Name: icao_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX icao_idx ON public.new_airports USING btree (icao);


--
-- Name: idx_airports_alies_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_airports_alies_en ON public.new_airports USING btree (alies_en);


--
-- Name: idx_airports_alies_ru; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_airports_alies_ru ON public.new_airports USING btree (alies_ru);


--
-- Name: idx_airports_city_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_airports_city_en ON public.new_airports USING btree (city_en);


--
-- Name: idx_airports_city_ru; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_airports_city_ru ON public.new_airports USING btree (city_ru);


--
-- Name: idx_airports_country_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_airports_country_en ON public.new_airports USING btree (country_en);


--
-- Name: idx_airports_country_ru; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_airports_country_ru ON public.new_airports USING btree (country_ru);


--
-- Name: idx_airports_label_en; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_airports_label_en ON public.new_airports USING btree (label_en);


--
-- Name: idx_airports_label_ru; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_airports_label_ru ON public.new_airports USING btree (label_ru);


--
-- Name: made_in_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX made_in_idx ON public.vehicles USING btree (made_in);


--
-- Name: new_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX new_idx ON public.vehicles USING btree (new);


--
-- Name: old_price_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX old_price_idx ON public.vehicles USING btree (old_price);


--
-- Name: popular_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX popular_idx ON public.vehicles USING btree (popular);


--
-- Name: price_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX price_idx ON public.vehicles USING btree (price);


--
-- Name: vendor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX vendor_idx ON public.vehicles USING btree (vendor);


--
-- Name: yacht_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX yacht_name_idx ON public.new_yachts USING btree (name);


--
-- Name: aircraft_images aircraft_images_aircraft_id_aircrafts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircraft_images
    ADD CONSTRAINT aircraft_images_aircraft_id_aircrafts_id_fk FOREIGN KEY (aircraft_id) REFERENCES public.aircrafts(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 9nwyRSogklg3wiOY32gf1OcUXaLxPsHz84REMvjelkcH4LgiDBnEd1SiwdjWy9v

