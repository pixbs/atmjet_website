#!/usr/bin/env bash
# Regenerates the living visual baselines; Linux only, because the CI runners render on Linux and
# baselines from other platforms differ in font rendering (issue #38, ADR-0004).
# Usage: bun run test:visual:update [-- <playwright arguments>]
set -euo pipefail
os="${VISUAL_UPDATE_OS:-$(uname -s)}"
if [[ "$os" != "Linux" ]]; then
  echo "::error::Visual baselines are generated on Linux only (this is $os). Use the CI job or a Linux container." >&2
  exit 1
fi
if [[ "${VISUAL_UPDATE_DRY_RUN:-0}" == "1" ]]; then
  echo "Visual update allowed on $os (dry run)"
  exit 0
fi
exec bunx playwright test --project=visual --update-snapshots "$@"
