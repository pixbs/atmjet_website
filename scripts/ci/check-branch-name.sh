#!/usr/bin/env bash
# Validates a branch name against the repository convention (docs/adr/0001-repo-reset-and-branching.md):
#   <type>/<issue>-<kebab-slug>      e.g. feat/42-hero-section
# Allowed as-is: master, legacy, dependabot/*.
# Usage: scripts/ci/check-branch-name.sh [--deny-only] [branch]   (defaults to the checked-out branch)
#   --deny-only  only reject the forbidden tool prefixes (used by the branch guard workflow)
set -euo pipefail

mode=full
if [[ "${1:-}" == "--deny-only" ]]; then
  mode=deny
  shift
fi
branch="${1:-$(git rev-parse --abbrev-ref HEAD)}"
deny='^(claude|codex|copilot|cursor|use_convention_prefix_and_not_this)/'
allow='^((feat|fix|chore|docs|refactor|test|ci|build|perf|revert)/[0-9]+-[a-z0-9]+(-[a-z0-9]+)*|master|legacy|dependabot/.+)$'

if [[ "$branch" =~ $deny ]]; then
  echo "::error::Branch '$branch' uses a forbidden agent prefix. Create <type>/<issue>-<kebab-slug> instead (AGENTS.md)." >&2
  exit 1
fi

if [[ "$mode" == "deny" ]]; then
  echo "Branch name has no forbidden prefix: $branch"
  exit 0
fi

if [[ ! "$branch" =~ $allow ]]; then
  echo "::error::Branch '$branch' must match <type>/<issue>-<kebab-slug> (types: feat fix chore docs refactor test ci build perf revert; lowercase letters, digits and hyphens only)." >&2
  exit 1
fi

echo "Branch name OK: $branch"
