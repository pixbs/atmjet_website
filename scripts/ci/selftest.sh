#!/usr/bin/env bash
# Self-test of the convention checks with positive and negative fixtures.
# Runs in CI (ci.yml, static job) and locally via `bun run check:conventions`.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "$here/../.." && pwd)"
pass=0
fail=0

expect() { # expect <ok|fail> "<description>" -- <command...>
  local want="$1" desc="$2" got
  shift 3
  if "$@" >/dev/null 2>&1; then got=ok; else got=fail; fi
  if [[ "$got" == "$want" ]]; then
    pass=$((pass + 1)); echo "  ok    $desc"
  else
    fail=$((fail + 1)); echo "  FAIL  $desc (expected $want, got $got)"
  fi
}

branch="bash $here/check-branch-name.sh"
echo "check-branch-name.sh"
expect ok   "conventional branch"       -- $branch feat/42-hero-section
expect ok   "fix with multi-word slug"  -- $branch fix/7-sitemap-citizens-typo
expect ok   "master"                    -- $branch master
expect ok   "legacy"                    -- $branch legacy
expect ok   "dependabot branch"         -- $branch dependabot/npm_and_yarn/next-16.3.6
expect fail "agent prefix claude/"      -- $branch claude/distracted-tharp-9849c2
expect fail "agent prefix codex/"       -- $branch codex/fix-thing
expect fail "agent prefix copilot/"     -- $branch copilot/fix-thing
expect fail "placeholder prefix"        -- $branch use_convention_prefix_and_not_this/x
expect fail "missing issue number"      -- $branch feat/hero-section
expect fail "uppercase"                 -- $branch Feat/42-Hero
expect fail "unknown type"              -- $branch feature/42-hero
expect fail "underscore in slug"        -- $branch feat/42-hero_section

echo "scan-attribution.sh"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
g() { git -C "$tmp" -c user.name=Owner -c user.email=owner@example.com "$@"; }
g init -q -b main
g commit -q --allow-empty -m "chore: base"
base="$(g rev-parse HEAD)"
g commit -q --allow-empty -m "feat: clean commit"
scan() { # scan "<env assignments and args>" runs the scanner inside the fixture repo
  bash -c "cd '$tmp' && $1 bash '$here/scan-attribution.sh' $2"
}
expect ok   "clean commit range"                 -- scan "" "$base..HEAD"
expect ok   "clean PR title and body"            -- scan "PR_TITLE='feat: hero' PR_BODY='Closes #1'" ""
expect fail "PR body with generated-with footer" -- scan "PR_BODY='🤖 Generated with [Claude Code](https://claude.com/claude-code)'" ""
expect fail "PR body with made-by claude"        -- scan "PR_BODY='made by Claude'" ""
expect ok   "allowlisted author email"           -- scan "ALLOWED_COMMIT_EMAILS='^owner@example\\.com\$'" "$base..HEAD"
expect fail "author email outside allowlist"     -- scan "ALLOWED_COMMIT_EMAILS='^someone@else\\.com\$'" "$base..HEAD"
g commit -q --allow-empty -m "$(printf 'feat: with trailer\n\nCo-Authored-By: Claude <noreply@anthropic.com>')"
expect fail "co-authored-by claude trailer"      -- scan "" "$base..HEAD"
git -C "$tmp" -c user.name=Bot -c user.email=bot@anthropic.com commit -q --allow-empty -m "feat: bot authored"
expect fail "anthropic author email"             -- scan "" "$base..HEAD"

echo "commitlint"
lint() { bash -c "cd '$root' && printf '%s' \"\$1\" | bunx commitlint" lint "$1"; }
expect ok   "conventional header"                -- lint 'feat: add hero section'
expect fail "no type"                            -- lint 'Add hero section'
expect fail "co-authored-by claude trailer"      -- lint "$(printf 'feat: add x\n\nCo-Authored-By: Claude <noreply@anthropic.com>')"
expect fail "generated-with footer"              -- lint "$(printf 'feat: add x\n\nGenerated with Claude Code')"
expect fail "claude-session trailer"             -- lint "$(printf 'feat: add x\n\nClaude-Session: https://claude.ai/code/session_x')"

echo
echo "passed: $pass  failed: $fail"
[[ $fail -eq 0 ]]
