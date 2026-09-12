import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { RuleConfigSeverity, type Plugin, type UserConfig } from '@commitlint/types'

/**
 * Commit message policy (docs/adr/0005-ai-agent-policy.md):
 * Conventional Commits plus a hard ban on AI attribution trailers and footers.
 * The patterns are shared with the CI scanner, the scrub step and the Claude Code hook
 * through scripts/ci/attribution-patterns.txt.
 */
const patternsFile = (() => {
  try {
    return fileURLToPath(new URL('./scripts/ci/attribution-patterns.txt', import.meta.url))
  } catch {
    return path.resolve(process.cwd(), 'scripts/ci/attribution-patterns.txt')
  }
})()

const FORBIDDEN: RegExp[] = readFileSync(patternsFile, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line !== '' && !line.startsWith('#') && !line.startsWith('identity '))
  .map((pattern) => new RegExp(pattern, 'iu'))

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
