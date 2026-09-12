#!/usr/bin/env bash
# Rejects AI attribution (docs/adr/0005-ai-agent-policy.md) in:
#   - commit messages and author/committer identities of a git range (argument 1, e.g. base..head)
#   - a pull request title and body passed as PR_TITLE / PR_BODY environment variables
#     (SKIP_BODY=1 skips the body, used for Dependabot pull requests that quote release notes)
# Patterns: scripts/ci/attribution-patterns.txt (shared with the hooks, commitlint and the scrub).
# Usage: scripts/ci/scan-attribution.sh [<base>..<head>]
set -euo pipefail
export LC_ALL=C.UTF-8
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci/attribution-patterns.sh
source "$here/attribution-patterns.sh"

range="${1:-}"
fail=0

if [[ -n "$range" ]]; then
  if git log --format='%H%n%B' "$range" | grep -inE "$ATTRIBUTION_TEXT"; then
    echo "::error::Forbidden AI attribution found in commit messages ($range)." >&2
    fail=1
  fi
  while read -r identity; do
    [[ -z "$identity" ]] && continue
    if grep -iqE "$ATTRIBUTION_IDENTITY" <<<"$identity"; then
      echo "::error::Forbidden author or committer identity: $identity" >&2
      fail=1
    fi
  done < <(git log --format='%an <%ae>%n%cn <%ce>' "$range" | sort -u)
fi

text="${PR_TITLE:-}"
if [[ "${SKIP_BODY:-0}" != "1" ]]; then
  text+=$'\n'"${PR_BODY:-}"
fi
if printf '%s\n' "$text" | grep -inE "$ATTRIBUTION_TEXT"; then
  echo "::error::Forbidden AI attribution found in the pull request title or body." >&2
  fail=1
fi

if [[ $fail -eq 0 ]]; then
  echo "Attribution scan OK${range:+ ($range)}"
fi
exit $fail
