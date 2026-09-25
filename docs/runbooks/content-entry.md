# Checklist: content entry and verification on staging

Implements E12.1 (#179). Before the domain moves (`docs/runbooks/domain-switch.md`), every page,
global and collection the site renders is filled in or checked on the staging domain, in each
language the site serves, and signed here by the owner. A row is signed when what staging shows
matches the legacy page (`docs/legacy-inventory.md` section 4) or the owner accepts the
difference in writing.

The seed (`bun run seed`) gives every environment something to render, but its copy and its two
images (`seed-gold.png`, `seed-surface.png`) are placeholders. Everything below that the seed
wrote has to be replaced or confirmed. The imported collections are filled by
`bun run import:legacy` (`docs/runbooks/cutover.md`) and are checked, not edited: the delta
import at cutover rewrites them.

Sign with a date and initials, for example `2026-10-02 DK`.

## Before starting

- [ ] Staging answers on its own domain, in `en` and `ru`, with the production build of `master`.
- [ ] `NEXT_PUBLIC_SITE_URL` is unset or names the staging host (#17); the canonical links on a
      page name that host.
- [ ] Images load from the bucket: the bucket allows public reads under `media/` and `legacy/`
      (#17).
- [ ] The media import has run (#84), so the legacy pictures and PDFs are in Media. The pictures
      of the pages come from `legacy/v1`, once, and their manifest names the Media file each legacy
      address became; a section takes the one `docs/legacy-inventory.md` section 12.2 lists for it:

      ```bash
      git fetch origin tag legacy/v1
      bun run import:legacy assets | tee assets-manifest.tsv   # attach to #84
      bun run import:legacy pictures                           # into the seeded sections
      ```

      `pictures` puts each legacy picture where the seed drew a placeholder, and leaves any
      section an editor has already given a picture. It writes outside the site, so the pages
      show the change after the next save in the admin, which drops every cached page.

- [ ] The editors who will enter content have their own accounts (Users), and the seeded
      administrator `dev@atmjet.local` has been removed or given a new password.

## Globals

| Global        | What to fill in or check                                                                                 | Signed |
| ------------- | -------------------------------------------------------------------------------------------------------- | ------ |
| Site settings | Phone and email; Telegram, Telegram channel, WhatsApp and Instagram handles; the downloadable documents  |        |
| Site settings | Enabled locales: `en` and `ru` public, `uk` left off until its catalogue is complete (ADR-0003)          |        |
| Header        | Primary and secondary navigation, in the legacy order and wording, in both languages; the call to action |        |
| Footer        | Navigation, social links, background image, call to action and legal line, in both languages             |        |

## Pages

Every page is published, has its `en` and `ru` title and meta description, and shows the sections
listed, in this order, with the legacy copy and pictures rather than the placeholders.

| Page                | Sections, in order                                                                                                        | `en` | `ru` | Signed |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- | ---- | ---- | ------ |
| `/` (home)          | hero video, make booking, why us, empty legs, key features, options tiles, privilege, yachts promo, tiles, transfer, FAQ  |      |      |        |
| `/aircraft`         | hero, contact card, aircraft listing, contact us                                                                          |      |      |        |
| `/atm_jet_group`    | hero, group cards, yachts promo, privilege                                                                                |      |      |        |
| `/business_agents`  | guide, why us, documents (the two checklists and the presentation), transfer, best price                                  |      |      |        |
| `/cargo_charter`    | hero, why us, contact us                                                                                                  |      |      |        |
| `/citizens`         | hero, wordmark note, quote, quote, make booking, why us, contact us                                                       |      |      |        |
| `/empty_legs`       | hero, descriptor, empty legs, contact us                                                                                  |      |      |        |
| `/group_charters`   | hero, make booking, why us, contact us                                                                                    |      |      |        |
| `/medical_aviation` | hero, key features, contact us                                                                                            |      |      |        |
| `/partners`         | hero, why us, why us, personal manager, contact us                                                                        |      |      |        |
| `/sales_dept`       | hero, personal manager, catalogue aircraft, options selection, advantages, why us, contact us                             |      |      |        |
| `/sales_yachts`     | hero, key features, framed descriptor, recent yachts, we inspect, options selection, photo descriptor, why us, contact us |      |      |        |
| `/yachts`           | hero, yachts listing, contact us                                                                                          |      |      |        |

For each page also check: every section's pictures are the legacy ones (none shows the plain gold
or dark placeholder), every button opens what the legacy button opened, and the page passes its
visual test against the legacy baseline.

## Imported collections

Checked, not edited. The cutover reconciliation (`bun run import:legacy reconcile`) must pass
first; these rows are the human sample on top of it.

| Collection | Check                                                                                                                   | Signed |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- | ------ |
| Aircraft   | Five detail pages, rich and basic layout, show the same values as the legacy pages; the listing sorts as the legacy did |        |
| Yachts     | Five charter yachts and their detail pages, and the sale carousel, match the legacy cards                               |        |
| Empty legs | The block shows the legacy legs; any leg listed as unresolved by the import has its airport added or is accepted        |        |
| Airports   | The booking form's airport search finds a sample of airports in both languages                                          |        |
| Contacts   | Administrators only; nothing of a contact appears on a public page                                                      |        |
| Redirects  | A sample of old `/planes/<id>` and `/aircrafts/<id>` URLs lands on the aircraft (#172); `/jets` goes home               |        |

## Forms and delivery

| Check                                                                                                 | Signed |
| ----------------------------------------------------------------------------------------------------- | ------ |
| A booking request from the home page arrives in Telegram with the legacy message format (section 7.4) |        |
| A request from a yacht page and one from an aircraft page arrive, naming what was asked for           |        |
| A request whose Telegram delivery fails is still stored as a Lead, with the failure recorded          |        |
| The cookie banner records the visitor's choice, and the tag manager follows it (E11.5)                |        |

## Tests against staging

- [ ] `bun run test:e2e`, `bun run test:visual` and `bun run test:a11y` with
      `PLAYWRIGHT_BASE_URL` set to the staging URL: green. Link the run.
- [ ] `bun run test:lighthouse` within budget (#43, #177).

## Sign-off

| Owner | Date | Staging deployment | Notes |
| ----- | ---- | ------------------ | ----- |
|       |      |                    |       |
