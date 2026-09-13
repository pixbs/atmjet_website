# ADR-0001: Repository reset, branching, merging and CI gating

Status: accepted (2026-09-11); merging and pull request scope amended by [ADR-0008](0008-lean-conventions.md) (2026-09-13)

## Context

The legacy site (Next.js 14, next-intl 3, Drizzle) had no tests, no CI, no lockfile, heavy dead code and a half-finished data migration. It is rewritten from scratch on Payload 3 + Next.js 16 + Bun. Several people and AI agents will work in parallel, one issue at a time, and the history must stay reviewable.

## Decision

- **Reset by normal commits.** The legacy tree was deleted in one commit on top of `master`; nothing was rewritten. The last legacy commit (`8b8f375`) is preserved as branch `legacy` and tag `legacy/v1` (both protected by rulesets) so any asset or code can be recovered.
- **Branch names:** `<type>/<issue>-<kebab-slug>` with the Conventional Commit types; `master`, `legacy` and `dependabot/*` are the only exceptions. Tool-generated prefixes (`claude/`, `codex/`, `copilot/`, `cursor/`) are rejected.
- **Commits:** Conventional Commits, atomic and verified (every commit passes lint, typecheck and the relevant tests), footer `Refs #<issue>`.
- **Pull requests:** one issue = one PR; larger work is split into **stacked pull requests** (each PR targets the one below it). Titles follow Conventional Commits; bodies close their issue.
- **Merging:** rebase and merge only, linear history required, branch deleted on merge. Required status checks: `conventions` and `ci`. Strict up-to-date checks are off so stacked layers do not have to be re-run serially; the `ci` run on `master` after each merge catches semantic conflicts.
- **No merge queue:** it is unavailable for user-owned repositories; the rules above make it unnecessary at this team size.

## Consequences

- CI cost is per pull request push, not per commit (see ADR-0004).
- The rulesets in `.github/rulesets/` must be imported by the owner (`docs/github-settings.md`).
- Contributors need `gh` with the `gh-stack` extension or plain `gh pr create --base <lower-branch>` for stacks.
