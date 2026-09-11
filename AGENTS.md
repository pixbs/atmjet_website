<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ATM JET website: guide for AI agents and humans

This file is the single source of truth for every coding agent (Claude Code, Codex, Cursor, Copilot and others) and is imported by `CLAUDE.md`. Read it fully before changing anything. The Next.js block above is managed by `next dev`; leave it in place.

## 1. Hard rules (enforced by git hooks and the `conventions` check; violations are rejected, not reviewed)

1. **No AI attribution, anywhere.** Commit messages, pull request titles and descriptions, comments, branch names and code must not carry AI attribution: no `Co-Authored-By` trailers naming an AI tool or vendor, no "generated with", "made by" or robot-emoji footers, no session links, no vendor no-reply e-mail address as author or committer. Commits are authored as the repository owner identity configured in the environment. If your tool adds such text automatically, remove it before committing. For Claude Code, `.claude/settings.json` disables it and a pre-tool hook blocks it.
2. **Branch names:** `<type>/<issue>-<kebab-slug>` with `type` one of `feat fix chore docs refactor test ci build perf revert`, for example `feat/42-hero-video-block`. Never `claude/...`, `codex/...`, `copilot/...`, `cursor/...` or any other tool prefix. If your environment created a branch with another name, create the correctly named branch from it and open the pull request from that branch.
3. **Commits:** Conventional Commits (`type(scope): lowercase subject`, at most 100 characters), one verified step per commit (lint, typecheck and the relevant tests pass at every commit), a body that explains why, and a footer `Refs #<issue>` (`Closes #<issue>` in the final commit of a pull request).
4. **Pull requests:** title in Conventional Commits form, body from the template with `Closes #<issue>` (or `Part of #<issue>` for a layer of a stack); one issue = one pull request; dependent work goes into stacked pull requests, each targeting the one below it. Never push to `master`, never force-push a shared branch, never rewrite `legacy` or the `legacy/*` tags.
5. **Data safety:** the legacy production database is read-only for this project and is never modified. In the new database the `legacy` schema is immutable. Payload schema changes go through committed migrations only (`push: false`); every data import is idempotent, resumable and reconciled (`docs/adr/0002-database-migration-strategy.md`).
6. **Visual parity:** the rewrite must look exactly like the legacy site. Every ported section or page ships a visual test against the legacy baseline; behaviour changes are limited to the bugs listed in `docs/legacy-inventory.md` section 13 as `fix-while-porting`.

## 2. Engineering rules

- **SSR-first** (`docs/adr/0007-rendering-strategy.md`): server components by default; data through the Payload Local API on the server; the initial content of every page is server-rendered; filters and pagination are URL (`searchParams`) driven; `'use client'` only for leaf interactivity (forms, carousels, dialog shells, scroll state); `generateMetadata` on the server; caching through Payload `afterChange` hooks with `revalidateTag` / `revalidatePath`.
- **Tailwind discipline** (`docs/adr/0006-styling-and-motion.md`): design tokens live in `@theme` in `src/app/(frontend)/globals.css`; no arbitrary values such as `bg-[#14323d]`, add a token instead; variants with `cva`, merging with `cn()`; repeated class bundles become components; `@apply` and element selectors only in the documented parity base layer; Tailwind is imported only by the frontend layout, never by the admin; classes are sorted by Prettier.
- **Animation** (`docs/adr/0006-styling-and-motion.md`): `motion` is the only animation library. Use `m.*` components inside `MotionProvider`, the shared vocabulary in `src/lib/motion.ts`, `whileInView` for reveals and `AnimatePresence` for enter and exit. No CSS animation libraries, no `react-intersection-observer`.
- **Tests with every change** (`docs/adr/0004-testing-and-ci-strategy.md`): unit tests for logic (`tests/unit`), integration tests for collections, hooks and access control (`tests/int`), e2e for flows (`tests/e2e`), visual for UI (`tests/visual`), axe for accessibility (`tests/a11y`). Coverage thresholds in `vitest.config.mts` only go up.
- **i18n** (`docs/adr/0003-i18n-strategy.md`): locales `en`, `ru`, `uk`; content is localized in Payload; a locale is public only when enabled in the site settings; no hard-coded language ternaries in components.
- **Payload:** collections in `src/collections`, globals in `src/globals`, blocks in `src/blocks`. After changing the config run `bun run generate:types`, `bun run generate:importmap` and `bun run migrate:create <name>` and commit the results. Access control is explicit on every collection and covered by `tests/int/access.int.spec.ts`. Payload documentation: https://payloadcms.com/docs.

## 3. Project map

```
src/app/(frontend)   public site: Next.js App Router, server components, Tailwind
src/app/(payload)    Payload admin and API routes (generated files, do not edit by hand)
src/collections      Payload collections             src/lib        shared helpers (cn, motion)
src/migrations       committed Payload migrations    tests/         unit | int | e2e | visual | a11y
docs/                ADRs, legacy inventory, backlog, runbooks, GitHub settings checklist
scripts/ci           convention checks shared by git hooks and CI
```

## 4. Commands (Bun)

| Command                                                              | Purpose                                                          |
| -------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `bun install`                                                        | install dependencies; also installs the git hooks (lefthook)     |
| `bun run dev`                                                        | dev server at http://localhost:3000, admin at `/admin`           |
| `bun run lint`, `bun run typecheck`, `bun run format:check`          | static checks                                                    |
| `bun run migrate`, `bun run migrate:create <name>`, `migrate:status` | Payload migrations                                               |
| `bun run test:int`                                                   | unit and integration tests with coverage thresholds              |
| `bun run test:e2e`, `bun run test:visual`, `bun run test:a11y`       | Playwright tiers against the dev server or `PLAYWRIGHT_BASE_URL` |
| `bun run test:visual:update`                                         | regenerate visual baselines (Linux only)                         |
| `bun run test:lighthouse`                                            | Lighthouse budgets                                               |
| `bun run check:conventions`                                          | self-test of the convention scripts                              |
| `bun run ci`                                                         | migrate and build (the Vercel build command)                     |

Local database: `docker compose up -d` (Postgres 17) or any Postgres 16+; copy `.env.example` to `.env`.

## 5. Workflow

1. Take one issue; read its legacy references in `docs/legacy-inventory.md`.
2. `git switch -c <type>/<issue>-<slug>` from `master`, or from the lower branch when stacking.
3. Implement in small verified commits and add the tests the issue lists.
4. Push, open the pull request with the template and `Closes #<issue>`; for a stack, set the base to the lower branch (`gh stack` or `gh pr create --base <branch>`).
5. Make the `conventions` and `ci` checks pass; request the `run-e2e` label for browser tests on the preview deployment.

## 6. Reference documents

- `docs/legacy-inventory.md`: what the legacy site is (routes, sections, elements, forms, data, assets, bugs).
- `docs/backlog.md`: epics and issues.
- `docs/adr/`: decisions on branching, database migration, i18n, testing, the AI policy, styling and motion, rendering.
- `CONTRIBUTING.md`, `docs/github-settings.md`, `docs/runbooks/`.
