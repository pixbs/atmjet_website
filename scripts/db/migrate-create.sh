#!/usr/bin/env bash
# Creates a migration, then deletes the schema snapshots it supersedes: Payload diffs a new one
# against the newest snapshot only and never reads one to migrate (docs/adr/0008-lean-conventions.md).
# Usage: bun run migrate:create <name>
set -euo pipefail
NODE_OPTIONS=--no-deprecation payload migrate:create "$@"
ls src/migrations/*.json | LC_ALL=C sort -r | tail -n +2 | xargs rm -f
