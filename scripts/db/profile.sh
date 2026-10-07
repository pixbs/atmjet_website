#!/usr/bin/env bash
# Runs every profiling query of scripts/db/profile/ against one schema of a database and writes
# each result as TSV under docs/legacy-schema/, the snapshot docs/legacy-schema.md is read from
# (issue #75). Read-only: every statement runs in a read-only transaction. Against the legacy
# database (`public`) and against its restored copy (`legacy`) the output must be identical but
# for 05 and 18, which list what the restore leaves out (docs/legacy-schema.md).
# Usage: DATABASE_URL=postgres://... scripts/db/profile.sh [schema] [out-dir]
set -euo pipefail

schema="${1:-legacy}"
out="${2:-docs/legacy-schema}"
: "${DATABASE_URL:?set DATABASE_URL to the database holding the schema to profile}"

mkdir -p "$out"
for query in scripts/db/profile/*.sql; do
  PGOPTIONS="-c default_transaction_read_only=on -c search_path=$schema -c timezone=UTC" \
    psql "$DATABASE_URL" -X -q -v ON_ERROR_STOP=1 -A -F $'\t' -P footer=off -f "$query" \
    >"$out/$(basename "$query" .sql).tsv"
  printf '%s\n' "$out/$(basename "$query" .sql).tsv"
done
