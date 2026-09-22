#!/usr/bin/env bash
# The facts about a Postgres database that issue #32 records before the migration: server
# version, database size, extensions, roles and their memberships, and the row count of every
# table. Read-only, prints nothing from the connection string but the host names.
# Usage: DATABASE_URL=postgres://... scripts/db/legacy-facts.sh [schema]
set -euo pipefail

schema="${1:-public}"
: "${DATABASE_URL:?set DATABASE_URL to the POOLED connection string of the legacy project}"

host="$(printf '%s' "$DATABASE_URL" | sed -E 's#.*@([^/:?]+).*#\1#')"
printf 'pooled endpoint:  %s\ndirect endpoint:  %s\n\n' "$host" "${host/-pooler/}"

run() { psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q "$@"; }

printf '== version\n'
run -Atc 'SELECT version()'
printf '\n== size\n'
run -Atc 'SELECT pg_size_pretty(pg_database_size(current_database()))'
printf '\n== extensions\n'
run -c '\dx'
printf '\n== roles\n'
run -c '\du'
printf '\n== role memberships\n'
run -c "SELECT r.rolname AS role, m.rolname AS member FROM pg_auth_members am JOIN pg_roles r ON r.oid = am.roleid JOIN pg_roles m ON m.oid = am.member WHERE r.rolname NOT LIKE 'pg\\_%' ORDER BY 1, 2"
printf '\n== table privileges\n'
run -c "SELECT grantee, count(DISTINCT table_name) AS tables, string_agg(DISTINCT privilege_type, ', ') AS privileges FROM information_schema.role_table_grants WHERE table_schema = '$schema' GROUP BY grantee ORDER BY grantee"
printf '\n== row counts (%s)\n' "$schema"
run -Atc "SELECT table_name FROM information_schema.tables WHERE table_schema = '$schema' AND table_type = 'BASE TABLE' ORDER BY table_name" |
  while read -r table; do
    [[ -z "$table" ]] && continue
    printf '%s\t%s\n' "$table" "$(run -Atc "SELECT count(*) FROM \"$schema\".\"$table\"")"
  done
