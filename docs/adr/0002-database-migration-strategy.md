# ADR-0002: Zero-data-loss migration from the legacy database

Status: accepted (2026-09-11); the development workflow of item 4 (`push: false` everywhere) amended by [ADR-0008](0008-lean-conventions.md) (2026-09-13)

## Context

The legacy site and the legacy admin share one Neon Postgres database with twelve tables. Aircraft live in two tables: the newer `aircrafts` + `aircraft_images` (a catalogue import; slugs, specs, images) and the older mixed `vehicles` table (planes and yachts with `tail_*` and `yacht_*` columns, single scheme-less image URLs, and a column already named `source`). The legacy detail page reads `aircrafts` first and falls back to `vehicles` when the aircraft is missing **or has no images**; the aircraft sitemap still enumerates `vehicles`. Yachts also live in two tables (`new_yachts` for charter, `yachts` for sale), `contact` rows are referenced without a foreign key, `atmjet_admin__users` stores plaintext passwords, and nine of the twelve tables have no DDL in any repository. Any data loss is unacceptable, and the legacy site must keep running untouched until cutover.

## Decision

1. **The legacy database is never modified.** This project only reads it, over its direct (unpooled) endpoint, with a `pg_dump` client at least as new as the server major version.
2. **Snapshot first, forever.** `pg_dump -Fc --no-owner --no-privileges` plus `--schema-only` and the `pg_restore --list` TOC, taken in one freeze window together with per-table row counts and ordered-CSV `md5` checksums (`scripts/db/legacy-checksums.sh`, UTC, `COLLATE "C"`). The dump contains PII and plaintext passwords: it is encrypted and stored privately. See `docs/runbooks/legacy-db-snapshot-and-restore.md`.
3. **A new Neon project** hosts the rewrite with two roles: `owner` (migrations, CI) and `app` (runtime, `SELECT` only on `legacy`). The snapshot is restored into it and `public` is renamed to `legacy` (`CREATE SCHEMA public` afterwards, extensions checked first). A Neon branch `legacy-snapshot` taken right after the restore is the durable immutability guarantee.
4. **Payload owns `public`.** `postgresAdapter({ push: false })`; every schema change is a committed migration; CI applies migrations against a fresh Postgres and fails on drift; Vercel builds run `payload migrate` against per-PR preview branches, never against production.
5. **Schema archaeology and profiling before any import** (`docs/legacy-schema.md`): the real DDL of all tables, null and format statistics, `vehicles` versus `aircrafts` duplicates on a canonical registration (`upper(replace(x,'-',''))`), the slug-to-registration invariant, image hosts per column, orphan `contact_id`/`captain_id`, `real` columns that render raw, `text[]` order semantics.
6. **Import framework** (`scripts/migrate/*`, run with `payload run`): batches of about 500 rows with per-chunk transactions, `depth: 0`, `overrideAccess`, hooks skipped through `context`, idempotent upserts by natural key, resumable through a `migration-runs` collection keyed by `(sourceTable, sourceId)`, dry-run mode, unit-tested transforms. Every imported document carries `legacyTable` and `legacyId`.
7. **Order:** airports (`airports` + `new_airports`) → contacts → aircraft catalogue (`aircrafts` + images; slugs kept; `real` values read as text) → legacy planes from `vehicles` (`tail_number <> ''`; only registrations not already present; generated slugs; `https://` normalisation; redirect entries for the old unlocalised URLs) → charter yachts (photo order preserved, contact/captain mapped, orphans logged) → sale yachts → empty legs (UTC preserved). Admin users are recreated in Payload; passwords are never migrated. The disposition of `vehicles` yacht rows and shop-like columns is a separate decision issue.
8. **Provenance instead of a `new` flag.** The merged `aircraft` collection carries a `provenance` group: `origin` (`aircrafts-catalog` | `vehicles-legacy` | `manual`), `legacyAircraftId`, `legacyVehicleId`, `legacyTailNumber`, `legacySlug`, `mergedFrom[]`, `importRunId`, `importedAt`, `verifiedAt`. The rich versus basic detail layout is derived from the presence of images, never stored.
9. **Media:** phase 1 keeps external URLs after a `HEAD` verification; DigitalOcean-hosted objects are mirrored to S3 before cutover (the legacy admin can delete S3 objects while it lives); `public/` images and videos are uploaded with a manifest.
10. **Reconciliation suite** in CI against a `legacy` fixture: per-table counts, `EXCEPT` diffs in both directions, registration uniqueness, image counts, element-wise photo arrays, every legacy sitemap URL resolving (200 or the intended redirect), sampled deep compares of rendered strings.
11. **Cutover:** content freeze → delta import → verification → domain move → the legacy stack stays untouched for rollback. Decommissioning needs written sign-off.

## Lessons taken from the legacy admin (not adopted)

Plaintext password comparison, unauthenticated write routes, no S3 deletion on photo removal, ASCII-only slugs that empty Cyrillic names, `revalidatePath('page')`, a hard-coded S3 endpoint, a missing MIME allowlist on edit, and a tracked `.env`. The Payload admin gets hashed auth, explicit access control tested per collection, storage hooks that delete objects, Unicode-safe slugs, correct revalidation, MIME allowlists and secrets only in the environment.

## Consequences

- Two databases exist until cutover; the legacy one is read-only for us.
- Every migration step is an issue with counts, verification and rollback (`.github/ISSUE_TEMPLATE/20-data-migration.yml`).
- Byte-for-byte fidelity is checked with rendered strings, not numeric equality, because of `real`/`numeric` precision differences.
