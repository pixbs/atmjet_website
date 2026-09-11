import { RuleConfigSeverity, type Plugin, type UserConfig } from '@commitlint/types'

/**
 * Commit message policy (docs/adr/0005-ai-agent-policy.md):
 * Conventional Commits plus a hard ban on AI attribution trailers and footers.
 * The same patterns are enforced in CI by scripts/ci/scan-attribution.sh.
 */
const FORBIDDEN: RegExp[] = [
  /co-authored-by:.*\b(claude|anthropic|copilot|codex|openai|chatgpt|cursor|gemini)\b/i,
  /generated with/i,
  /claude-session/i,
  /noreply@anthropic\.com/i,
  /made by claude/i,
  /🤖/u,
]

const noAiAttribution: Plugin = {
  rules: {
    'no-ai-attribution': (parsed) => {
      const text =
        parsed.raw ?? [parsed.header, parsed.body, parsed.footer].filter(Boolean).join('\n')
      const hit = FORBIDDEN.find((pattern) => pattern.test(text))

      return [
        !hit,
        hit
          ? `AI attribution is forbidden in commit messages (matched ${hit.source}); see AGENTS.md`
          : undefined,
      ]
    },
  },
}

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  plugins: [noAiAttribution],
  rules: {
    'no-ai-attribution': [RuleConfigSeverity.Error, 'always'],
    'header-max-length': [RuleConfigSeverity.Error, 'always', 100],
    'body-max-line-length': [RuleConfigSeverity.Warning, 'always', 200],
  },
  // Dependabot writes long release-note bodies; its headers are conventional.
  ignores: [(message) => /^Signed-off-by: dependabot\[bot\]/m.test(message)],
  defaultIgnores: true,
}

export default config
