#!/usr/bin/env bash
# Rejects AI attribution (docs/adr/0005-ai-agent-policy.md) in:
#   - commit messages and author/committer emails of a git range (argument 1, e.g. base..head)
#   - a pull request title and body passed as PR_TITLE / PR_BODY environment variables
# Optional: ALLOWED_COMMIT_EMAILS (extended regex) restricts author/committer emails; SKIP_EMAIL_CHECK=1 disables email checks.
# Usage: scripts/ci/scan-attribution.sh [<base>..<head>]
set -euo pipefail
export LC_ALL=C.UTF-8

range="${1:-}"
forbid='co-authored-by:.*(claude|anthropic|copilot|codex|openai|chatgpt|cursor|gemini)|generated with|claude-session|noreply@anthropic\.com|made by claude|🤖'
deny_email='@anthropic\.com$|@openai\.com$|copilot@users\.noreply\.github\.com$|^(claude|codex|cursor)[^@]*@'
fail=0

if [[ -n "$range" ]]; then
  if git log --format='%H%n%an <%ae>%n%cn <%ce>%n%B' "$range" | grep -inE "$forbid"; then
    echo "::error::Forbidden AI attribution found in commit messages ($range)." >&2
    fail=1
  fi

  if [[ "${SKIP_EMAIL_CHECK:-0}" != "1" ]]; then
    while read -r email; do
      [[ -z "$email" ]] && continue
      if grep -iqE "$deny_email" <<<"$email"; then
        echo "::error::Forbidden author/committer email: $email" >&2
        fail=1
      fi
      if [[ -n "${ALLOWED_COMMIT_EMAILS:-}" ]] && ! grep -qE "$ALLOWED_COMMIT_EMAILS" <<<"$email"; then
        echo "::error::Author/committer email not in ALLOWED_COMMIT_EMAILS: $email" >&2
        fail=1
      fi
    done < <(git log --format='%ae%n%ce' "$range" | sort -u)
  fi
fi

if printf '%s\n%s\n' "${PR_TITLE:-}" "${PR_BODY:-}" | grep -inE "$forbid"; then
  echo "::error::Forbidden AI attribution found in the pull request title or body." >&2
  fail=1
fi

if [[ $fail -eq 0 ]]; then
  echo "Attribution scan OK${range:+ ($range)}"
fi
exit $fail
