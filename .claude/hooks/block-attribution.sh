#!/usr/bin/env bash
# Claude Code PreToolUse hook for the Bash tool (docs/adr/0005-ai-agent-policy.md).
# Blocks commands that would violate the repository policy before they run:
#   - AI attribution in commits, tags, notes or pull requests
#   - force pushes, pushes to master, deletion of remote branches or legacy refs
#   - setting an AI vendor address as the git author
# Exit code 2 blocks the command and returns the message to the agent.
set -euo pipefail
export LC_ALL=C.UTF-8

input="$(cat)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null || true)"
[[ -z "$cmd" ]] && cmd="$input"

block() {
  printf 'Blocked by .claude/hooks/block-attribution.sh: %s. See AGENTS.md section 1.\n' "$1" >&2
  exit 2
}

attribution='co-authored-by:.*(claude|anthropic|copilot|codex|openai|chatgpt|cursor|gemini)|(generated|made|written|authored|created|produced|assisted|powered)[ -](with|by)[ -](\[|an? )?(claude|anthropic|copilot|codex|openai|chatgpt|cursor|gemini|ai\b|llm\b)|claude-session|claude\.ai/code|claude\.com/claude-code|noreply@anthropic\.com|\u{1f916}'
sep='(^|[;&|[:space:]])'

if printf '%s' "$cmd" | grep -qiE "${sep}(git (commit|tag|notes|merge|rebase|cherry-pick|am)|gh (pr|api|release|issue))\b"; then
  if printf '%s' "$cmd" | grep -qiE "$attribution"; then
    block "AI attribution in a commit, tag or pull request"
  fi
fi

if printf '%s' "$cmd" | grep -qE "${sep}git push\b"; then
  if printf '%s' "$cmd" | grep -qE "${sep}git push\b.*( --force| -f\b| --force-with-lease| \+[[:alnum:]])"; then
    block "force push"
  fi
  if printf '%s' "$cmd" | grep -qE "${sep}git push\b.*( master\b|:master\b|refs/heads/master\b)"; then
    block "direct push to master (open a pull request instead)"
  fi
  if printf '%s' "$cmd" | grep -qE "${sep}git push\b.*(--delete|:refs/tags/legacy|:legacy\b| :[[:alnum:]])"; then
    block "deleting a remote branch, tag or legacy ref"
  fi
fi

if printf '%s' "$cmd" | grep -qE "git tag (-d|--delete) legacy/"; then
  block "deleting a legacy tag"
fi

if printf '%s' "$cmd" | grep -qiE "git config( --[a-z]+)? user\.email .*anthropic\.com"; then
  block "setting an AI vendor address as the git author"
fi

exit 0
