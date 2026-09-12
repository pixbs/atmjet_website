#!/usr/bin/env bash
# Fails a pull request that changes application code without touching tests, unless it carries the
# no-tests-needed label with the reason in its description (docs/adr/0004-testing-and-ci-strategy.md).
# Generated files and migrations do not count as application code on their own.
# Usage: scripts/ci/check-tests-required.sh <base>..<head>     PR_LABELS: comma-separated label names
set -euo pipefail
range="${1:?usage: check-tests-required.sh <base>..<head>}"
labels="${PR_LABELS:-}"

changed="$(git diff --name-only "$range")"
code="$(grep -E '^src/' <<<"$changed" | grep -vE '^src/(payload-types\.ts$|migrations/|app/\(payload\)/)' || true)"
tests="$(grep -E '^tests/' <<<"$changed" || true)"

if [[ -z "$code" ]]; then
  echo "Tests required: no application code changed"
  exit 0
fi
if [[ -n "$tests" ]]; then
  echo "Tests required: OK ($(wc -l <<<"$tests" | tr -d ' ') test files changed)"
  exit 0
fi
if grep -qE '(^|,)no-tests-needed(,|$)' <<<"$labels"; then
  echo "Tests required: waived by the no-tests-needed label; the description must say why"
  exit 0
fi
echo "::error::This pull request changes application code without touching tests/. Add the tests the issue lists (AGENTS.md section 2) or, when none apply, the no-tests-needed label with the reason in the description." >&2
printf '  %s\n' "$code" >&2
exit 1
