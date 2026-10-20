# Legacy database: real schema and data profile

What the legacy database actually holds, measured rather than read from code (issue #75,
E5.3). It answers the data questions `docs/legacy-inventory.md` marked **UNVERIFIED** (section
15.1 and section 8) and records what the importers in `scripts/migrate/` meet in the real rows.

## How it was produced, and how to run it again

`scripts/db/profile.sh [schema] [out-dir]` runs every query of `scripts/db/profile/` in a
read-only transaction against one schema of `DATABASE_URL` and writes one TSV per query to
`docs/legacy-schema/`. Each section below names the query its numbers come from.

The committed snapshot was taken on 2026-10-05 from the legacy Neon database itself (schema
`public`, Postgres 16.15), before the snapshot and restore of #73 and #74, with the same
read-only, `search_path` and UTC settings the script sets. The environment that took it could
not open a Postgres connection, so the statements went through Neon's SQL-over-HTTPS endpoint;
the script is what to run anywhere else. After the restore, `scripts/db/profile.sh legacy`
against the new project must reproduce these files byte for byte, except the two that list what
the restore (#74) leaves out by design: `05` has no `pg_trgm` row and `18` only its header. Any
other difference is something the restore changed.

The database is the production one: its 85 charter yachts are the 85 the live `/en/yachts`
links to, and the live site shows no empty leg, which matches the empty table (both checked on
the same day).

Personal data never reaches a file: `contact` and `atmjet_admin__users` appear as counts only,
without even value lengths (`06-column-profile.sql`), and every query that prints values names
its columns explicitly (`07`, `08`, `11`), none of them personal.

## Tables (`01-tables.sql`)

| Table                      |   Rows | DDL before this profile                       |
| -------------------------- | -----: | --------------------------------------------- |
| `aircraft_images`          | 18,570 | none                                          |
| `aircrafts`                |  8,842 | none                                          |
| `airports`                 |  9,375 | none                                          |
| `atmjet_admin__empty_legs` |      0 | `atmjet-admin/drizzle` (migrations 0000-0002) |
| `atmjet_admin__users`      |      3 | `atmjet-admin/drizzle` (0000)                 |
| `city_list`                |      0 | none                                          |
| `contact`                  |      9 | none                                          |
| `migration_status`         |      0 | none                                          |
| `new_airports`             | 27,087 | none                                          |
| `new_yachts`               |     85 | `atmjet-admin/drizzle` (0003)                 |
| `vehicles`                 | 10,016 | none                                          |
| `yachts`                   |      2 | none                                          |

Beside `public`, the database has a `drizzle` schema with the legacy admin's migration journal
(`18-admin-migrations.sql`), which the dump carries and the restore (#74) leaves in the encrypted
dump: eleven entries, dated 2024-07-20 to 2025-02-25. Four carry the dates of the four files in
`atmjet-admin/drizzle` (2024-08-11, 2024-08-12 twice, 2025-02-25), so the migration section
8.8 calls corrupt is recorded as applied in production; the other seven match no file the
inventory lists.

## Real definitions (`02-columns.sql` to `05-extensions.sql`)

The nine tables without DDL have exactly the columns, types and nullability the Drizzle schema
quoted in `docs/legacy-inventory.md` section 8 gives them, which is also what the reconcile
fixture (`tests/reconcile/fixture/`) declares. What differs from that fixture:

- `aircraft_images.type` is plain `text` with **no check constraint**; the fixture's
  `CHECK (type IN ('exterior', 'cabin', 'cockpit'))` exists only in the fixture, and the real
  column holds six values (finding 1 below).
- The twelve `aircrafts` booleans default to `false`, and `vehicles.old_price` and `weight`
  default to `0.00` and `0.000`; the rows hold `true` or `NULL` in those booleans, never `false`.
- `new_yachts` was created as `localYachts`: its sequence is `"localYachts_id_seq"` and its
  primary key `"localYachts_pkey"`. The primary key of `aircrafts` is named
  `aircrafts_id_unique`.
- The only foreign key is `aircraft_images.aircraft_id → aircrafts(id) ON DELETE CASCADE`;
  `new_yachts.contact_id` and `captain_id` reference `contact` by convention only.
- Every index is btree; the ten `new_airports` and eight `vehicles` indexes are the ones
  section 8 lists. `pg_trgm` 1.6 is installed **in `public`** and indexes nothing, so the
  restore (#74) did not create it in the new project (`05-extensions.sql`).

## Answers to the inventory's unverified data questions

| Question (inventory)                                       | Answer                                                                                                                                                                                                                                                                   | Query            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| Host of `vehicles.image` and `thumb` (8.9)                 | All 10,016 rows: `atmjet.ams3.digitaloceanspaces.com/image_<id>.jpg` and `…/thumb_<id>.jpg`, named after the row id, without a scheme, on the Space's origin host rather than its CDN one.                                                                               | `09`, `08`, `12` |
| Host of `yachts.pictures` (8.9)                            | All 29 pictures: `https://atmjet.ams3.cdn.digitaloceanspaces.com`.                                                                                                                                                                                                       | `09`             |
| Host of `aircraft_images.url` (8.9)                        | All 18,570: `https://atmjet.s3.eu-north-1.amazonaws.com` (the `atmjet` bucket), never padded.                                                                                                                                                                            | `09`             |
| Older `new_yachts.photos` (8.9)                            | 377 photos on the same S3 bucket, 244 on `atmjet.ams3.cdn.digitaloceanspaces.com`; no yacht mixes the two. The 1,313 `aircrafts.pdf_attachment` brochures are on the S3 bucket too.                                                                                      | `09`, `13`       |
| Production types and constraints of the tables without DDL | As the Drizzle schema, with the differences listed above.                                                                                                                                                                                                                | `02`, `03`, `04` |
| Shape of `aircrafts.slug` (15.1)                           | Not `<REG>-<NUM>-…`: the lower-cased registration on 8,722 rows. The other 120 are listed: 38 digits only (`998`), 63 another registration or a misspelling (`n47nf` for N47HF), 11 the registration without its hyphen, 6 with a suffix, 2 rows without a registration. | `11`, `08`       |
| Meaning of `vehicles.source` (8.4)                         | Nothing: every row holds `2` (the column defaults to `1`). What a row is shows in its columns: 3,422 planes, 6,593 yachts, 1 row with neither.                                                                                                                           | `07`, `12`       |
| Contents of `city_list` (8, 15.1)                          | Empty, as is `migration_status`.                                                                                                                                                                                                                                         | `01`             |

The other items of section 15.1 are facts about the legacy front end and its deployment, not
about its data, and stay with the issues that port those parts.

## What the importers meet in the real rows

Numbered so the follow-ups can point at them.

1. **Six image types where the new schema takes three.** `aircraft_images.type` is `cabin`
   9,929, `exterior` 7,919, `cockpit` 477, `notail` 124, `plan` 112 and `other` 9 (`07`). The
   245 images of the last three types belong to 158 aircraft (`14`); the aircraft collection's
   `images.type` is an enum of `exterior`, `cabin` and `cockpit`, and
   `scripts/migrate/aircraft.ts` passes the legacy value through, so those 158 aircraft would be
   refused as the importer stands. The legacy detail page showed every image whatever its type.
2. **Registrations the canonical form does not clean.** Two aircraft have none, three are padded
   with a tab or spaces, one is written with a Unicode hyphen (`HH‐YET`, U+2010) and one with
   asterisks (`RA-67***`) (`10`, `11`). `canonicalRegistration` removes whitespace and ASCII
   hyphens only; none of these has a twin in `vehicles`, so no merge is missed today. The
   issue's `upper(replace(x, '-', ''))` differs from the code's form on the three padded rows.
3. **How many aircraft to expect.** No canonical registration repeats in `aircrafts`; 22 repeat
   among the 3,422 planes of `vehicles`. 1,917 planes share a registration with the catalogue
   and merge into it, and 1,496 registrations are only in `vehicles`, so the two imports should
   leave 8,842 + 1,496 = **10,338** aircraft documents (`10`).
4. **The 120 slugs that are not the registration** were broken on the legacy site already: the
   detail page split the slug on hyphens to find the registration, and on the live site such a
   link answers 200 with the header, the footer and nothing between them (`/en/aircraft/998`,
   `/n47nf`, `/hb-jfc`, `/g-dags-to-germany`, checked 2026-10-05). They are the URLs the
   listing published, so they are the ones the per-aircraft redirects have to answer (`11`).
5. **`real` columns gain digits as doubles** on 4,019 to 6,328 values each (`1.1` reads
   `1.100000023841858`), which is why the importer reads them as text (`15`).
6. **Aircraft without pictures:** 3,907 have no image at all and 180 have images but no exterior
   one, so no listing cover (`14`); the most images on one aircraft is 14.
7. **Airports are keyed, not counted.** `airports` has 1,424 blank ICAO codes and 298 ICAO
   codes on more than one row; `new_airports` has 13,192 rows with neither ICAO nor IATA (keyed
   by their Wikidata item), 1,599 ICAO codes and 1,713 Wikidata items on more than one row, and
   19 ICAO values that are not four letters or digits, 11 of them Wikidata blank-node URLs
   (`http://www.wikidata.org/.well-known/genid/…`) that `normaliseCode` upper-cases into a code.
   Every one of the 6,176 passenger counts parses (`17`). The airport documents will therefore
   be far fewer than the 36,462 rows, and the reconciliation has to compare keys, not counts.
8. **Charter yachts:** slugs are unique and none is blank, and no name has a letter outside ASCII,
   so the admin rule's collapse of Cyrillic names never happened in the data. 3 slugs are not
   what the rule gives for the name: one yacht has no name, and two keep a misspelling their
   name no longer has (`dolche_vita` for Dolce Vita, `my_choise` for My Choice). 6 slugs sit
   inside another (`grey` in `grey_shark`, `lana` in `solana`, `lucien`, `santorini`,
   `serenity`, `white`), which is inventory bug 44 in practice: live, `/en/yachts/lana` opens
   Solana and `/en/yachts/grey` opens Grey Shark. Every price is in `AED` (one row has no
   currency), none is zero or fractional, and one yacht has no photos (`16`, `07`, `13`).
9. **Contacts:** one yacht (`atm_jet`) names a contact and a captain, two different rows; no
   reference is an orphan, and 7 of the 9 contact rows are referenced by no yacht (`14`).
10. **Empty legs:** the table is empty in production (`01`), so the empty-legs import has
    nothing to bring, and the live site shows no empty leg either.
