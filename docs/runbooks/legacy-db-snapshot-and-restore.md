# Runbook: snapshot the legacy database and restore it as the `legacy` schema

Implements ADR-0002 steps 1–3. Nothing here writes to the legacy database.

## Prerequisites

- The legacy Neon project's facts recorded in the migration epic: Postgres major version, database size, extensions (`\dx`), roles, direct and pooled endpoints.
- `pg_dump`/`pg_restore` at least as new as the legacy server major (use the `postgres:<major>` container image if the workstation client is older), and a scratch Postgres of the new project's major (`docker compose up -d` with the image overridden if it differs; a scratch server older than the client rejects the `SET` lines `pg_restore` emits).
- `age` (or another reviewed tool) to encrypt the dump; a private bucket for the encrypted artefact.
- The new Neon project created with the same major version and two roles: `owner` and `app`. A Vercel-marketplace project comes with its owner role only (`neondb_owner`); `app` is created when a runtime needs it, and until then the freeze below revokes everything from every other role.

## 1. Freeze window and checksums (legacy database, read-only)

```bash
export DATABASE_URL='postgres://<user>@<direct-endpoint>/<db>?sslmode=require'   # DIRECT endpoint, not -pooler
scripts/db/legacy-checksums.sh public > legacy-checksums.before.tsv
```

Record the file with the migration issue and commit it under `docs/runbooks/checksums/`. Take the dump in the same window, then run the script again: the window is stable only when the second file is identical to the first (the legacy site and admin stay live while the dump runs).

## 2. Dump

```bash
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --file=legacy.dump
pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges --file=legacy-schema.sql
pg_restore --list legacy.dump > legacy.toc
age -r <recipient-public-key> -o legacy.dump.age legacy.dump && shred -u legacy.dump
```

Keep `legacy-schema.sql` and `legacy.toc` with the issue and under `docs/runbooks/legacy-snapshot/` (they contain no data); upload `legacy.dump.age` to the private bucket and note its checksum. macOS has no `shred`; `rm -P` overwrites before unlinking.

## 3. Restore into the new project

The new project's `public` already holds Payload's tables by the time this runs (#18 applies the migrations to every deployment), so the dump is never restored into it: the rename happens in a scratch database, and only the renamed schema travels to the new project. The legacy `pg_trgm` extension lives in `public` (`\dx`), and a schema-only dump carries no extension: if the DDL uses it (an index with a `trgm` operator class, a function calling `similarity`), create it in `legacy` on the new project before the restore, which leaves Payload's `public` untouched. The 2026-10-05 DDL uses only btree indexes and `to_tsvector`, so nothing was created. The dump's `drizzle` schema (the legacy site's own migration journal, one table) stays in the encrypted dump and is not restored.

```bash
export SCRATCH_URL='postgres://payload:payload@localhost:5432/atmjet_dev'            # empty scratch database, new project's major
export NEW_URL='postgres://owner@<new-direct-endpoint>/<db>?sslmode=require'
age -d -i <key> legacy.dump.age > legacy.dump
pg_restore --dbname="$SCRATCH_URL" --no-owner --no-privileges --jobs=4 --exit-on-error legacy.dump
DATABASE_URL="$SCRATCH_URL" scripts/db/legacy-checksums.sh public > legacy-checksums.scratch.tsv   # must equal the before file (cut -f2-)
psql "$SCRATCH_URL" -c 'ALTER SCHEMA public RENAME TO legacy;' -c 'CREATE SCHEMA public;'
pg_dump "$SCRATCH_URL" --format=custom --no-owner --no-privileges --schema=legacy --file=legacy-schema-only.dump
# A Neon branch of the new project first (console or neonctl): the rollback point of what follows.
psql "$NEW_URL" -v ON_ERROR_STOP=1 -c 'CREATE SCHEMA legacy;'      # plus CREATE EXTENSION ... WITH SCHEMA legacy when the DDL needs one
pg_restore --dbname="$NEW_URL" --no-owner --no-privileges --exit-on-error --section=pre-data --use-list=<(pg_restore --list legacy-schema-only.dump | grep -v ' SCHEMA ') legacy-schema-only.dump
pg_restore --dbname="$NEW_URL" --no-owner --no-privileges --exit-on-error --section=data --jobs=4 legacy-schema-only.dump
pg_restore --dbname="$NEW_URL" --no-owner --no-privileges --exit-on-error --section=post-data legacy-schema-only.dump
rm -P legacy.dump legacy-schema-only.dump
```

## 4. Verify

```bash
DATABASE_URL="$NEW_URL" scripts/db/legacy-checksums.sh legacy > legacy-checksums.after.tsv
diff <(cut -f2- legacy-checksums.before.tsv) <(cut -f2- legacy-checksums.after.tsv) && echo "legacy schema is byte-for-byte identical"
```

Any difference stops the process. Sequences are restored with their values; `text[]` columns keep their element order; `timestamptz` values are compared in UTC.

## 5. Freeze

- Create the Neon branch `legacy-snapshot` from the new project's main branch immediately after step 4 (immutable copy for audits and reconciliation fixtures).
- Only `owner` may write to the new project; `app` has `SELECT` on `legacy`. Nobody alters `legacy`:

  ```bash
  psql "$NEW_URL" -c 'REVOKE ALL ON SCHEMA legacy FROM PUBLIC;' -c 'REVOKE ALL ON ALL TABLES IN SCHEMA legacy FROM PUBLIC;' \
                  -c 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA legacy FROM PUBLIC;'
  # once `app` exists:
  psql "$NEW_URL" -c 'GRANT USAGE ON SCHEMA legacy TO app;' -c 'GRANT SELECT ON ALL TABLES IN SCHEMA legacy TO app;' \
                  -c 'ALTER DEFAULT PRIVILEGES IN SCHEMA legacy GRANT SELECT ON TABLES TO app;'
  ```

- `bun run migrate:status` must still report every Payload migration applied; `tests/reconcile/legacy-snapshot.reconcile.spec.ts` compares `legacy.vehicles` and `legacy.aircrafts` with the committed counts wherever a database holds the schema.

## Rollback

The legacy database was never touched; the rollback of any later step is to stop the rewrite's cutover. If the new project must be rebuilt, restore from `legacy-snapshot` or from `legacy.dump.age` and repeat steps 3–5.
