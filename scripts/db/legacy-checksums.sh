#!/usr/bin/env bash
# Row counts and order-independent checksums of every table in a Postgres database,
# printed as TSV: schema, table, count, md5 of the rows ordered by primary key.
# Run the same script against the legacy database (freeze window) and against the
# restored `legacy` schema; the outputs must be identical (docs/adr/0002).
# Usage: DATABASE_URL=postgres://... scripts/db/legacy-checksums.sh [schema]
set -euo pipefail

schema="${1:-public}"
: "${DATABASE_URL:?set DATABASE_URL to the DIRECT (unpooled) connection string}"

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -Atq \
  -c "SET timezone = 'UTC'" \
  -c "SELECT table_name FROM information_schema.tables WHERE table_schema = '$schema' AND table_type = 'BASE TABLE' ORDER BY table_name" |
  while read -r table; do
    [[ -z "$table" ]] && continue
    order="$(psql "$DATABASE_URL" -Atq -c "SELECT string_agg(quote_ident(a.attname), ', ' ORDER BY k.ord) FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY (i.indkey) CROSS JOIN LATERAL unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord) WHERE i.indrelid = '\"$schema\".\"$table\"'::regclass AND i.indisprimary AND k.attnum = a.attnum")"
    [[ -z "$order" ]] && order="1"
    count="$(psql "$DATABASE_URL" -Atq -c "SELECT count(*) FROM \"$schema\".\"$table\"")"
    checksum="$(psql "$DATABASE_URL" -Atq \
      -c "SET timezone = 'UTC'" \
      -c "COPY (SELECT t.*::text FROM \"$schema\".\"$table\" t ORDER BY $order COLLATE \"C\") TO STDOUT" | md5sum | cut -d' ' -f1)"
    printf '%s\t%s\t%s\t%s\n' "$schema" "$table" "$count" "$checksum"
  done
