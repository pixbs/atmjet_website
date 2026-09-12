#!/usr/bin/env bash
# Removes tool attribution footers from pull request descriptions and comments
# (docs/adr/0005-ai-agent-policy.md). Some agent platforms append such footers to every
# description or comment they write, even through the API, so the removal runs in CI where those
# platforms have no reach; scripts/ci/scan-attribution.sh then fails on anything left.
#   scrub-attribution.sh --strip               filter: stdin to stdout (self-test, local use)
#   scrub-attribution.sh pr <number>           rewrite a pull request description
#   scrub-attribution.sh comment <id>          rewrite an issue or pull request comment
#   scrub-attribution.sh review-comment <id>   rewrite a pull request review comment
# The API modes need gh with GH_TOKEN (pull-requests: write, issues: write) and GITHUB_REPOSITORY.
set -euo pipefail
export LC_ALL=C.UTF-8
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ci/attribution-patterns.sh
source "$here/attribution-patterns.sh"

# A footer-shaped line: optional emphasis or emoji, then a generation phrase, a co-author or
# session trailer, or a bare vendor link. Dropped only when it also matches the shared patterns.
footer_shape='^[[:space:]]*[_*]*[[:space:]]*(🤖|generated (with|by)|co-authored-by:|claude-session:|https?://claude\.(ai|com)/)'

strip() { # stdin to stdout; prints "removed" or "unchanged" on file descriptor 3 when open
  local line removed=0
  local -a lines=()
  while IFS= read -r line || [[ -n "$line" ]]; do
    if printf '%s\n' "$line" | grep -qiE "$footer_shape" && printf '%s\n' "$line" | grep -qiE "$ATTRIBUTION_TEXT"; then
      removed=1
      continue
    fi
    lines+=("$line")
  done
  if [[ $removed -eq 1 ]]; then
    # drop the blank lines and the horizontal rule the footer left hanging at the end
    while [[ ${#lines[@]} -gt 0 && -z "${lines[-1]//[[:space:]]/}" ]]; do unset 'lines[-1]'; done
    if [[ ${#lines[@]} -gt 0 && "${lines[-1]}" =~ ^[[:space:]]*(-{3,}|\*{3,}|_{3,})[[:space:]]*$ ]]; then unset 'lines[-1]'; fi
    while [[ ${#lines[@]} -gt 0 && -z "${lines[-1]//[[:space:]]/}" ]]; do unset 'lines[-1]'; done
  fi
  if [[ ${#lines[@]} -gt 0 ]]; then printf '%s\n' "${lines[@]}"; fi
}

rewrite() { # rewrite <api endpoint>
  local endpoint="$1" tmp
  tmp="$(mktemp -d)"
  gh api "$endpoint" --jq '.body // ""' >"$tmp/before.md"
  strip <"$tmp/before.md" >"$tmp/after.md"
  if cmp -s "$tmp/before.md" "$tmp/after.md"; then
    echo "No attribution footer in $endpoint"
  else
    jq -n --rawfile body "$tmp/after.md" '{body: $body}' | gh api -X PATCH "$endpoint" --input - >/dev/null
    echo "Removed attribution footer lines from $endpoint"
    echo "Removed tool attribution footer lines from \`$endpoint\` (AGENTS.md section 1)." >>"${GITHUB_STEP_SUMMARY:-/dev/null}"
  fi
  rm -rf "$tmp"
}

case "${1:-}" in
  --strip) strip ;;
  pr) rewrite "repos/${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}/pulls/${2:?pull request number}" ;;
  comment) rewrite "repos/${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}/issues/comments/${2:?comment id}" ;;
  review-comment) rewrite "repos/${GITHUB_REPOSITORY:?GITHUB_REPOSITORY is required}/pulls/comments/${2:?comment id}" ;;
  *)
    echo "usage: scrub-attribution.sh --strip | pr <number> | comment <id> | review-comment <id>" >&2
    exit 2
    ;;
esac
