# Contributing

This repository is rebuilt from scratch on Payload 3 + Next.js 16 + Bun. The rules below are enforced by git hooks and by the `conventions` and `ci` checks; `AGENTS.md` is the same guide written for AI coding agents.

## Setup

1. Install [Bun](https://bun.sh) (`.bun-version`) and Node 22 (`.node-version`).
2. `cp .env.example .env` and set `DATABASE_URL` and `PAYLOAD_SECRET`. A local database: `docker compose up -d` (Postgres 17).
3. `bun install` (installs the git hooks), `bun run migrate`, `bun run seed` (local admin `dev@atmjet.local` / `dev-password-change-me` and placeholder media), `bun run dev`.

## Branches, commits and pull requests

- One GitHub issue = one pull request. Large issues are split into **stacked pull requests**: each PR targets the branch of the PR below it, is reviewed on its own diff and is merged bottom-up with **rebase and merge** (the only merge method). Use `gh stack` (GitHub CLI extension) or `gh pr create --base <lower-branch>`.
- Branch names: `<type>/<issue>-<kebab-slug>` (`feat/42-hero-video-block`). `scripts/ci/check-branch-name.sh` documents the exact rule.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org): `type(scope): lowercase subject`, at most 100 characters, one verified step per commit, `Refs #<issue>` in the footer. `commitlint` runs on every commit.
- Pull request titles follow the same format; the body comes from the template and closes its issue.
- **AI attribution is forbidden** in commits, pull requests, comments and code (see `AGENTS.md` section 1 and `docs/adr/0005-ai-agent-policy.md`). The commit-msg hook strips tool trailers, and CI removes tool footers from pull request descriptions and comments before checking them; the patterns are in `scripts/ci/attribution-patterns.txt`.
- Never push to `master`; never force-push a shared branch; the `legacy` branch and the `legacy/*` tags are read-only.

## Reviewing a pull request

- The tests the issue lists are present (`tests/README.md`); the `conventions` check fails a pull request that changes `src/` without touching `tests/`, unless it carries the `no-tests-needed` label and the description says why.
- Coverage thresholds in `vitest.config.mts` were not lowered (the file is owner-reviewed through `CODEOWNERS`).
- No AI attribution anywhere; visual parity evidence for UI changes; SSR-first, Tailwind tokens and `motion` only (AGENTS.md).

## Definition of done

A change is done when (see `tests/README.md` for the test conventions and the coverage ratchet):

1. `bun run lint`, `bun run typecheck` and `bun run format:check` pass.
2. Tests were added or extended for the change (`docs/adr/0004-testing-and-ci-strategy.md`): unit tests for logic, integration tests for collections, hooks and access control, e2e for flows, visual for UI, axe for accessibility. Coverage thresholds in `vitest.config.mts` never go down; raise them in the same PR when coverage grows.
3. Ported UI matches the legacy baseline pixel for pixel (`tests/visual`).
4. Payload config changes ship their migration (`bun run migrate:create <name>`), regenerated types and import map.
5. The pull request template checklist is complete and the `conventions` and `ci` checks are green.

## Test tiers

| Tier  | Command                                                                          | When it runs                                                                    |
| ----- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| local | git hooks                                                                        | on commit (format, lint, commitlint) and push (branch name, typecheck)          |
| fast  | `bun run test:int` and the `ci` workflow                                         | every push to a pull request and every push to `master`                         |
| heavy | `test:e2e`, `test:visual`, `test:a11y`, `test:lighthouse` and the `e2e` workflow | Vercel previews of PRs labelled `run-e2e`, every `master` push, nightly, manual |

Run the browser tiers locally against the dev server, or against a deployment with `PLAYWRIGHT_BASE_URL=https://... bun run test:e2e`. Visual baselines are generated on Linux only (`bun run test:visual:update`); review baseline changes like code.

## Migrations and data

`push` is disabled in the Postgres adapter: every schema change is a committed migration. The legacy production database is never modified; see `docs/adr/0002-database-migration-strategy.md` and `docs/runbooks/`.
