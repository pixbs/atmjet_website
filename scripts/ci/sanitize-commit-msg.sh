#!/usr/bin/env bash
# commit-msg hook helper (lefthook.yml): removes the attribution trailers that tools append to
# commit messages (co-author trailers naming AI tools, generation footers, session links), prints
# what it removed, and leaves everything else for commitlint to judge.
# Usage: scripts/ci/sanitize-commit-msg.sh <message-file>
set -euo pipefail
export LC_ALL=C.UTF-8
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci/attribution-patterns.sh
source "$here/attribution-patterns.sh"

file="${1:?usage: sanitize-commit-msg.sh <message-file>}"
trailer_shape='^[[:space:]]*(🤖|generated (with|by)|co-authored-by:|claude-session:|signed-off-by:|https?://claude\.(ai|com)/)'
tmp="$(mktemp)"
while IFS= read -r line || [[ -n "$line" ]]; do
  if printf '%s\n' "$line" | grep -qiE "$trailer_shape" && printf '%s\n' "$line" | grep -qiE "$ATTRIBUTION_TEXT"; then
    echo "sanitize-commit-msg: removed attribution line: $line" >&2
    continue
  fi
  printf '%s\n' "$line" >>"$tmp"
done <"$file"
mv "$tmp" "$file"
