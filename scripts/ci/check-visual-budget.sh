#!/usr/bin/env bash
# Keeps the living visual baselines small enough for a git repository (issue #38, ADR-0004).
# Usage: scripts/ci/check-visual-budget.sh [directory]   (VISUAL_BUDGET_BYTES overrides the 30 MB budget)
set -euo pipefail
dir="${1:-tests/visual/__screenshots__}"
budget="${VISUAL_BUDGET_BYTES:-31457280}"
if [[ ! -d "$dir" ]]; then
  echo "Visual budget OK: $dir does not exist yet"
  exit 0
fi
size="$(find "$dir" -type f -printf '%s\n' | awk '{s+=$1} END {print s+0}')"
if (( size > budget )); then
  echo "::error::Visual baselines in $dir use $size bytes, over the budget of $budget bytes. Clip sections instead of full pages, or move rarely used baselines to the legacy/v1 release." >&2
  exit 1
fi
echo "Visual budget OK: $size of $budget bytes in $dir"
