# String-extraction audit

Every string the legacy site rendered that did **not** come from a message catalogue, where it came from, and where it goes (issue #163, feeds E10.3, E10.4 and E10.5).

The catalogue itself — 13 namespaces, 384 keys per locale, and which of them nothing uses — is `docs/legacy-inventory.md` section 11.1 to 11.4. This document covers what the catalogue missed.

## Why this exists

The legacy site shipped `messages/uk/*.json` and never served Ukrainian. That was not an oversight in the routing: `src/i18n.ts` refused any locale outside `['en', 'ru']`, and even if it had not, **77 comparisons across 18 files** would have fallen through to English, because every one of them is a two-way `locale === 'en' ? … : …`. A third language could not be added without editing components.

So the audit has two outputs: this list, and the lint rule that stops the pattern coming back (`eslint.config.mjs`, tested in `tests/unit/no-locale-ternaries.test.ts`).

## How it was produced

Against `origin/legacy` (the preserved legacy tree, commit `8b8f375`):

```sh
git archive origin/legacy src messages | tar -x -C <scratch>
grep -rEn "(locale|lang|language)\s*[=!]==?\s*['\"](ru|en|uk)['\"]" <scratch>/src --include=*.tsx --include=*.ts
```

77 matches in 18 files. The result is cross-checked against `docs/legacy-inventory.md` section 11.5, which catalogues the same strings by file from the other direction; the two agree, and where the inventory says "about 20 files" the exact figure is 18.

## Targets

| Target       | Meaning                                                                | Lands in                                                                           |
| ------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **content**  | Copy an editor owns and may change without a deploy.                   | A localized Payload field: a block field (E7), a page field or a collection field. |
| **message**  | Interface furniture: labels, options, validation, empty states, units. | `messages/{en,ru,uk}.json`, read through next-intl (E10.3).                        |
| **settings** | One value for the whole site, not a translation.                       | The `SiteSettings` global (E4.2).                                                  |
| **none**     | Not language at all, or dead code.                                     | Nothing; the reason is in the row.                                                 |

Every **content** and **message** row needs `en`, `ru` and `uk`. The legacy site has `en` and `ru` for all of them; `uk` is new work and is what E10.6 completes before the locale is enabled.

## 1. Locale branches

Each of these decides what to render by comparing the locale. All are removed: the string becomes a message or a field, and the component stops knowing which language it is in.

| File (legacy)                             | Branches | What it decides                                                                                                                                                                                                                                                                                     | Target                                                                                                                             |
| ----------------------------------------- | -------: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `app/[locale]/yachts/filter_section.tsx`  |       28 | Every label and option of the yacht filter: `Filter yachts`, `Guests`, `Price`, `Length`, `Length ft`, `Sort by`, `Order`, the range options (`To 15 guests`, `From 15 to 30 guests`, `More than 60`, `To 1200 AED`, `Lux`, `To 20 ft`, …), `Ascending`, `Descending`, `All`, `Apply`.              | message                                                                                                                            |
| `app/[locale]/aircraft/aircraft_list.tsx` |       18 | The aircraft filter and sort: `Filter aircraft`, `Passangers` (legacy spelling), `Sort by`, `Size`, `Range`, `Order`, `Ascending`, `Descending`, `Show more`, plus the commented-out `Type` options (`Light`, `Midsize`, `Heavy`, `Airliner`, `Super midsize`, `Ultra long range`, `VIP airliner`). | message                                                                                                                            |
| `app/[locale]/yachts/[id]/page.tsx`       |        5 | `Hour`, `Key stats` / `Основые факты` (legacy typo), `About`; and which **column** of the row to read for the description and the "included" list.                                                                                                                                                  | message, plus content for the two columns                                                                                          |
| `app/[locale]/aircraft/[id]/page.tsx`     |        4 | Form labels `From`, `To`, `Date`; `Key stats` / `Основые факты`.                                                                                                                                                                                                                                    | message                                                                                                                            |
| `utils/getAiport.ts`                      |        3 | Which column of `new_airports` to read: `cityRu`/`cityEn`, `countryRu`/`countryEn`, `labelRu`/`labelEn`, each with the other as a fallback.                                                                                                                                                         | content — the Airports collection is localized (#64), so the field resolves itself                                                 |
| `components/sections/new_contact_us.tsx`  |        3 | The two card descriptions and `Telephone line is open 24/7` / `Телефонная линия открыта 24/7`.                                                                                                                                                                                                      | content                                                                                                                            |
| `components/elements/localeSwitcher.tsx`  |        3 | Which of the three links is dimmed.                                                                                                                                                                                                                                                                 | none — the switch reads the active locale, which is legitimate; it becomes `LocaleSwitch` (E6.3) driven by the enabled-locale list |
| `app/actions.ts`                          |        2 | Dead server action.                                                                                                                                                                                                                                                                                 | none                                                                                                                               |
| `app/[locale]/page.tsx`                   |        2 | The home page title and description.                                                                                                                                                                                                                                                                | content — `plugin-seo` fields on the page (E11.1)                                                                                  |
| `app/[locale]/business_agents/page.tsx`   |        2 | Which locale's PDF documents are listed.                                                                                                                                                                                                                                                            | settings — per-locale documents on `SiteSettings` (E4.2)                                                                           |
| `components/sections/angle_bar.tsx`       |        1 | Whether a Russian-only item appears in the floating bar.                                                                                                                                                                                                                                            | content — an availability flag on the item, not a language test                                                                    |
| `components/sections/all_aircrafts.tsx`   |        1 | `Show more`. Dead section.                                                                                                                                                                                                                                                                          | none                                                                                                                               |
| `components/form/booking.tsx`             |        1 | The chips: `Запрос на партнерство / пресс / другое` and `Partnership request / press / other`.                                                                                                                                                                                                      | content — the chip list is editable (E7, E9.2)                                                                                     |
| `app/[locale]/yachts/yacht_card.tsx`      |        1 | `per hour` / `за час`.                                                                                                                                                                                                                                                                              | message                                                                                                                            |
| `app/[locale]/yachts/YachtsSection.tsx`   |        1 | `Yachts available for rent in Dubai` / `Яхты доступные в аренду в Дубае`.                                                                                                                                                                                                                           | content                                                                                                                            |
| `app/[locale]/partners/page.tsx`          |        1 | The why-us title `Clients benefit` / `Клиенты выбирают нас`.                                                                                                                                                                                                                                        | content                                                                                                                            |
| `app/[locale]/layout.tsx`                 |        1 | The root description (never emitted — the layout's `generateMetadata` never returns, section 2.4).                                                                                                                                                                                                  | content                                                                                                                            |
| `app/[locale]/citizens/page.tsx`          |        1 | Redirects every locale but `ru` away from the page.                                                                                                                                                                                                                                                 | none — a page-level availability rule, decided in #149                                                                             |

## 2. English-only strings every visitor sees

No branch at all: a Russian visitor reads these in English.

| File (legacy)                               | Strings                                                                                                                                                                                                                                                           | Target                                                                                                                                            |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/[locale]/yachts/YachtsSection.tsx`     | `No yachts found`, `Reset filters`                                                                                                                                                                                                                                | message                                                                                                                                           |
| `components/elements/yacht_card.tsx` (sale) | `Guests:`, `Cabins:`, `Crew:`, `Shipyard:`, `Year built:`, `Length:`, `feet`, `Beam:`, `Draft:`, `Cruising speed:`, `Max speed:`, `Location:`, and the composed alt text `${length}m ${shipyard} yacht …`                                                         | message                                                                                                                                           |
| `components/elements/vehicle_card.tsx`      | `Year:`, `Pax:`                                                                                                                                                                                                                                                   | message                                                                                                                                           |
| `components/form/booking.tsx`               | zod messages `Required`, `Invalid email`, `Invalid phone number`; the country search placeholder `Search`; the Telegram message labels (`Name`, `Locale`, `Component`, `Phone`, `Email`, `Tags`, `From`, `To`, `Date`, `Return`, `Passengers`, `Guests`, `Hours`) | message for the form; **none** for the Telegram labels, which are read by staff and stay English (E9.4)                                           |
| `components/form/direction.tsx`             | `From is required`, `Date is required`, `Invalid date format`, `passengers must be a positive number`                                                                                                                                                             | message                                                                                                                                           |
| `components/sections/header.tsx`            | aria-labels `Open/Close menu button` (one string for both states) and `Logotype, leads to home page`                                                                                                                                                              | message - an aria-label is read aloud, so it is a translation like any other; the menu label should also say which state it is in (E6.1)          |
| alt texts across 11 files                   | `Image of black car`, `For Business Agents`, `Best price`, `Hero sales`, `yacht`, `personal manager`, `Tile {n}`, `Slide {i}`, `Image of a yacht`, `aircraft`, the footer cabin description, the privilege icon alts                                              | content where the image is a Media document (the alt is a localized field on Media, #62); message for the composed ones (`Tile {n}`, `Slide {i}`) |
| `app/[locale]/yachts/[id]/page.tsx`         | `statsLabel` English half: `pax day`, `pax night`, `lenght ft/m` (legacy typo), `cabins`, `bathrooms`, `min rental hours`, `refit`, `Included in the price:`; `inputLabel` `From`, `Date`, `Hours`, `Guests`; `${minHours} hours` even in Russian                 | message, with the hours pluralised (E10.7)                                                                                                        |
| `app/[locale]/aircraft/[id]/page.tsx`       | `statsLabel` English half: `max pax`, `type`, `cabin height`, `lenght/width` (legacy typo), `year`, `range`; units `m`, `km`; `Request {registration}`                                                                                                            | message                                                                                                                                           |
| `app/[locale]/yachts/yacht_card.tsx`        | `ft`, `m`, `guests`, `cabins`, `bathrooms`, `refit`, and the Russian hour plural `час / часа / часов` written by hand                                                                                                                                             | message, pluralised (E10.7)                                                                                                                       |
| `components/elements/empty_leg_card.tsx`    | `N/A`, `->`, the `$` sign, and an `en-US` date in every locale                                                                                                                                                                                                    | message for `N/A` and the arrow; the currency and the date format are handled by #66 and #104                                                     |

## 3. Inline Russian content

Russian text written into components, which an English visitor also sees.

| File (legacy)                                 | Strings                                                                                                             | Target                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `app/[locale]/citizens/page.tsx:67-72`        | The founder quote (`С 2004 года наша миссия в ATM JET …`) and the attribution `Артем Румянцев - основатель ATM JET` | content — a quote block (E7), localized |
| `app/[locale]/sales_dept/page.tsx:87`         | The why-us title, the literal `ATM JET`                                                                             | content                                 |
| `components/sections/personal_manager.tsx:14` | The stray literal `aaa` next to a `bg-red-50` debug class                                                           | none — a defect, decided in #124        |

## 4. Strings that are not translations

These look like hard-coded copy but are one value for the whole site. They belong in `SiteSettings` (E4.2), not in a catalogue, and translating them would be wrong.

| Where                                                    | Value                                                                                           |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `sections/hero.tsx`, `hero_sales.tsx`, `hero_yachts.tsx` | `ATM JET`, `©ATM JET`                                                                           |
| `sections/new_contact_us.tsx`                            | `Telegram`, `Whatsapp`, `info@atmjet.com`, `+971 (50) 458-99-26`                                |
| `app/[locale]/layout.tsx:19`                             | The title `ATM JET - Flying private made simple`                                                |
| `components/form/booking.tsx:112`                        | The phone placeholder `${code} 123 456 789` — a format, filled from the selected country (#108) |

## 5. Dead code, not ported

Listed so nobody ports them by accident. The disposition is #110.

`form/phone-input.tsx` (`Search country...`, `No country found.`), `elements/range_slider.tsx` (`Price Range`, `Use slider or enter min and max price`, `Min`, `Max`), `sections/all_aircrafts.tsx` (`Show more`), `aircraft/[id]/old.tsx` (`ATM JET | {tailModel}`), `app/actions.ts`.

## 6. The rule that keeps it from coming back

`eslint.config.mjs` refuses a comparison of `locale`, `lang` or `language` against `'en'`, `'ru'` or `'uk'` anywhere under `src/app`, `src/components` or `src/blocks`, in either order and through a member expression (`params.locale === 'ru'`). It is scoped to the code that renders: `src/i18n` compares locales because that is its job, and so do the collections that enumerate them.

`tests/unit/no-locale-ternaries.test.ts` runs ESLint over fixtures for every spelling of the pattern, and over the paths that are deliberately exempt. The fixtures are strings rather than files, because a file containing the pattern would be flagged by the repository's own lint run.

## 7. Counting

The legacy site pluralised exactly one string, by hand and in Russian only: `pluralizeHours` in `yachts/yacht_card.tsx`, choosing between `час`, `часа` and `часов` with `% 10` and `% 100` arithmetic. Everything else it counted was printed in one fixed form whatever the number, so a Russian visitor read `1 гостей` and `1 каюты`, and an English one read `min 1 hours`.

The `units` namespace of `src/messages/{en,ru,uk}.json` is the vocabulary that replaces both (#167). `hours` reproduces the legacy Russian rule exactly, teens included; `guests`, `cabins`, `bathrooms` and `passengers` are correct plurals that nothing reaches yet, because whether a page keeps the legacy fixed form is a parity question for the page issue that renders it (E8.6 and E8.7), not for the catalogue.

## 8. What is left over

Two things in this audit are decisions, not work:

- Whether the citizens page stays Russian-only (#149) — it is the only page-level locale restriction.
- Whether the legacy typos an editor will now see in a catalogue (`Passangers`, `lenght`, `Основые факты`) are reproduced or corrected. Visual parity says reproduce; the question belongs to the page issues that render them, E8.2 for the aircraft listing and E8.7 for the yacht detail.
