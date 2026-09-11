# Runbook: snapshot the legacy database and restore it as the `legacy` schema

Implements ADR-0002 steps 1–3. Nothing here writes to the legacy database.

## Prerequisites

- The legacy Neon project's facts recorded in the migration epic: Postgres major version, database size, extensions (`\dx`), roles, direct and pooled endpoints.
- `pg_dump`/`pg_restore` at least as new as the legacy server major (use the `postgres:<major>` container image if the workstation client is older).
- `age` (or another reviewed tool) to encrypt the dump; a private bucket for the encrypted artefact.
- The new Neon project created with the same major version and two roles: `owner` and `app`.

## 1. Freeze window and checksums (legacy database, read-only)

```bash
export DATABASE_URL='postgres://<user>@<direct-endpoint>/<db>?sslmode=require'   # DIRECT endpoint, not -pooler
scripts/db/legacy-checksums.sh public > legacy-checksums.before.tsv
```

Record the file with the migration issue. Take the dump in the same window.

## 2. Dump

```bash
pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --file=legacy.dump
pg_dump "$DATABASE_URL" --schema-only --no-owner --no-privileges --file=legacy-schema.sql
pg_restore --list legacy.dump > legacy.toc
age -r <recipient-public-key> -o legacy.dump.age legacy.dump && shred -u legacy.dump
```

Keep `legacy-schema.sql` and `legacy.toc` with the issue (they contain no data); upload `legacy.dump.age` to the private bucket and note its checksum.

## 3. Restore into the new project

```bash
export NEW_URL='postgres://owner@<new-direct-endpoint>/<db>?sslmode=require'
age -d -i <key> legacy.dump.age > legacy.dump
pg_restore --dbname="$NEW_URL" --no-owner --no-privileges --jobs=4 legacy.dump
psql "$NEW_URL" -c '\dx'                                   # extensions installed in public? move them if any
psql "$NEW_URL" -c 'ALTER SCHEMA public RENAME TO legacy;' -c 'CREATE SCHEMA public;' \
                -c 'GRANT USAGE, CREATE ON SCHEMA public TO owner;' \
                -c 'GRANT USAGE ON SCHEMA legacy TO app;' -c 'GRANT SELECT ON ALL TABLES IN SCHEMA legacy TO app;' \
                -c 'ALTER DEFAULT PRIVILEGES IN SCHEMA legacy GRANT SELECT ON TABLES TO app;'
shred -u legacy.dump
```

## 4. Verify

```bash
DATABASE_URL="$NEW_URL" scripts/db/legacy-checksums.sh legacy > legacy-checksums.after.tsv
diff <(cut -f2- legacy-checksums.before.tsv) <(cut -f2- legacy-checksums.after.tsv) && echo "legacy schema is byte-for-byte identical"
```

Any difference stops the process. Sequences are restored with their values; `text[]` columns keep their element order; `timestamptz` values are compared in UTC.

## 5. Freeze

- Create the Neon branch `legacy-snapshot` from the new project's main branch immediately after step 4 (immutable copy for audits and reconciliation fixtures).
- Only `owner` may write to the new project; `app` has `SELECT` on `legacy`. Nobody alters `legacy`.
- Run Payload's first migration (`bun run migrate`) only after this step.

## Rollback

The legacy database was never touched; the rollback of any later step is to stop the rewrite's cutover. If the new project must be rebuilt, restore from `legacy-snapshot` or from `legacy.dump.age` and repeat steps 3–5.
