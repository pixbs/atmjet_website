# Contributing

This repository is rebuilt from scratch on Payload 3 + Next.js 16 + Bun. The rules below are enforced by git hooks and by the `conventions` and `ci` checks; `AGENTS.md` is the same guide written for AI coding agents.

## Setup

1. Install [Bun](https://bun.sh) (`.bun-version`) and Node 24 (`.node-version`).
2. `cp .env.example .env`, then set `DATABASE_URL` and generate a `PAYLOAD_SECRET` (`openssl rand -hex 32`) — the placeholder the example ships is published in this repository, so it is refused. A local database: `docker compose up -d` (Postgres 17). What every other variable does, and which environments hold it: `docs/environment.md`.
3. `bun install` (installs the git hooks), then either:
   - **`bun run db:reset`** — drops the schema, applies the committed migrations, clears the local uploads and seeds the fixture content, which is what `docker compose up -d && bun run db:reset && bun run dev` needs to render every page on a fresh clone. It refuses `NODE_ENV=production`. Run it again whenever the database is in a state you no longer trust; it is repeatable and leaves the same 41 documents behind each time.
   - or `bun run dev` (Drizzle push creates the schema in the local database) and then `bun run seed` (local admin `dev@atmjet.local` / `dev-password-change-me` and placeholder media).

   Do not run `bun run migrate` against a database that push created: Payload's docs say the two are not meant to be mixed, and `bun run db:reset` is the way back to a migrated one.

## Admin accounts

Two roles, written out cell by cell in `docs/access-matrix.md`: an **editor** runs the content, an **admin** also runs the people and the settings. `editor` is what a new account gets, and only an admin may write the field — otherwise an editor could add `admin` to their own roles.

- **The first account on a new environment** is created through Payload's own first-user flow: open `/admin` on the fresh deployment and fill the form. Payload allows it while the collection is empty, which is why `create` can be admin-only from the very first minute. Do it once, immediately, before the URL is shared: the second person to find an empty `/admin` becomes the administrator.
- **Everyone after that** is created by an admin in the admin panel, under Users, with the role they need and no more.
- **Nobody is imported.** The legacy `atmjet_admin__users` table stores its passwords in plain text (`docs/legacy-inventory.md` section 14), so it is a list of people to invite, never a list of accounts to migrate. No import or migration writes a user, and no deployment runs the seed: the build command (`bun run ci`) applies the migrations and builds, and the seed refuses to run with `NODE_ENV=production` unless somebody sets `SEED_ALLOW_PRODUCTION=1`.
- **When someone leaves**, an admin deletes their user. There are no shared accounts and no API keys; a signed-in session is one person.
- Five wrong passwords lock an account for ten minutes, so a stolen address is not worth guessing at.

Locally, `bun run seed` creates `dev@atmjet.local` / `dev-password-change-me` in the disposable development database. It is a development account with a published password: it belongs in no database anyone else can reach.

## Branches, commits and pull requests

- One pull request = one shippable slice (a page with its blocks, a block with its components, a collection with the page or import that reads it, or one process change); it closes every issue it completes. Aim for 200 to 800 hand-written lines, generated files excluded. Merge each slice before starting the next; stack at most two open pull requests (`gh pr create --base <lower-branch>`). Pull requests are **squash-merged** (the only merge method): `master` holds one commit per pull request, named after it; a stack merges bottom-up.
- Branch names: `<type>/<issue>-<kebab-slug>` (`feat/42-hero-video-block`). `scripts/ci/check-branch-name.sh` documents the exact rule.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org): `type(scope): lowercase subject`, at most 100 characters, one verified step per commit, `Refs #<issue>` in the footer. `commitlint` runs on every commit.
- Pull request titles follow the same format; the body comes from the template and closes its issue.
- **AI attribution is forbidden** in commits, pull requests, comments and code (see `AGENTS.md` section 1 and `docs/adr/0005-ai-agent-policy.md`). The commit-msg hook strips tool trailers, and CI removes tool footers from pull request descriptions and comments before checking them; the patterns are in `scripts/ci/attribution-patterns.txt`.
- Never push to `master`; never force-push a shared branch; the `legacy` branch and the `legacy/*` tags are read-only.

## Reviewing a pull request

- The tests cover the behaviour the issue lists (`tests/README.md`); a test that pins a constant, a type or an admin `condition` is removed, not kept for coverage.
- Nothing speculative: every export has a caller, comments say why in one sentence, generated files were regenerated rather than edited (ADR-0008).
- No AI attribution anywhere; visual parity evidence for UI changes; SSR-first, Tailwind tokens and `motion` only (AGENTS.md).

## Definition of done

A change is done when (see `tests/README.md` for the test conventions):

1. `bun run lint`, `bun run typecheck` and `bun run format:check` pass.
2. Tests cover the behaviour of the change (`docs/adr/0004-testing-and-ci-strategy.md`, amended by ADR-0008): unit tests for logic, integration tests for collections, hooks and access control, e2e for flows, visual for UI, axe for accessibility. Coverage thresholds in `vitest.config.mts` are fixed numbers.
3. Ported UI matches the legacy baseline pixel for pixel (`tests/visual`).
4. Payload config changes ship one migration for the slice (`bun run migrate:create <name>`), regenerated types and import map.
5. The pull request template checklist is complete and the `conventions` and `ci` checks are green.

## Test tiers

| Tier  | Command                                                                          | When it runs                                                                    |
| ----- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| local | git hooks                                                                        | on commit (format, lint, commitlint)                                            |
| fast  | `bun run test:int` and the `ci` workflow                                         | every push to a pull request and every push to `master`                         |
| heavy | `test:e2e`, `test:visual`, `test:a11y`, `test:lighthouse` and the `e2e` workflow | Vercel previews of PRs labelled `run-e2e`, every `master` push, nightly, manual |

Run the browser tiers locally — they build the site and serve it themselves, on a database you have migrated and seeded — or against a deployment with `PLAYWRIGHT_BASE_URL=https://... bun run test:e2e`. Not against `next dev`: it rebuilds Payload as it re-evaluates its modules, and a request that lands during the drizzle push that follows is answered with the error page (issue #292). Visual baselines are generated on Linux only (`bun run test:visual:update`); review baseline changes like code.

## Migrations and data

Drizzle push runs only under `bun run dev`, against the disposable local database; seeding, tests, CI, previews and production apply the committed migrations, one per finished slice (ADR-0008). The legacy production database is never modified; see `docs/adr/0002-database-migration-strategy.md` and `docs/runbooks/`.
