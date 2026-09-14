# ATM JET website

Public website of ATM JET (private jet charter, yachts, cargo), rebuilt from scratch on **Payload 3**, **Next.js 16** and **Bun**. This repository is the fresh boilerplate plus the complete scope of the rewrite; the legacy site is preserved on the `legacy` branch and the `legacy/v1` tag and is described in [`docs/legacy-inventory.md`](docs/legacy-inventory.md).

## Stack

| Layer     | Choice                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------- |
| CMS / API | Payload 3 (Postgres adapter, migrations only), admin at `/admin`                                   |
| Frontend  | Next.js 16 App Router, React 19, server components first                                           |
| Styling   | Tailwind CSS v4 (tokens in `@theme`), `class-variance-authority`, `cn()`                           |
| Animation | `motion` (the only animation library)                                                              |
| i18n      | Payload localisation (`en`, `ru`, `uk`) + next-intl routing                                        |
| Tooling   | Bun, TypeScript, ESLint 9, Prettier, lefthook, commitlint                                          |
| Tests     | Vitest (unit + integration, fixed coverage thresholds), Playwright (e2e, visual, a11y), Lighthouse |
| Hosting   | Vercel (build: `bun run ci`), Neon Postgres, S3-compatible media storage                           |

## Quick start

```bash
bun install                 # also installs the git hooks
cp .env.example .env        # set DATABASE_URL and PAYLOAD_SECRET
docker compose up -d        # local Postgres 17 (or point DATABASE_URL at any Postgres 16+)
bun run migrate             # apply Payload migrations
bun run seed                # local admin account and placeholder media (idempotent)
bun run dev                 # http://localhost:3000, admin at /admin
```

## Scripts

| Script                                                                | Purpose                                                    |
| --------------------------------------------------------------------- | ---------------------------------------------------------- |
| `bun run dev` / `bun run build` / `bun run start`                     | develop, build, serve                                      |
| `bun run ci`                                                          | migrate (production only) and build (Vercel build command) |
| `bun run lint` / `lint:fix` / `format` / `format:check` / `typecheck` | static checks                                              |
| `bun run migrate` / `migrate:create <name>` / `migrate:status`        | Payload migrations (Drizzle push only under `bun run dev`) |
| `bun run generate:types` / `generate:importmap`                       | regenerate Payload artefacts after config changes          |
| `bun run test:int`                                                    | unit and integration tests with coverage thresholds        |
| `bun run test:e2e` / `test:visual` / `test:a11y` / `test:lighthouse`  | browser tiers (dev server or `PLAYWRIGHT_BASE_URL`)        |
| `bun run test:visual:update`                                          | regenerate visual baselines (Linux only)                   |

## Repository layout

```
src/app/(frontend)   public site (server components, Tailwind, motion provider)
src/app/(payload)    Payload admin and API routes (generated)
src/collections      Payload collections            src/lib        shared helpers
src/migrations       committed migrations           tests/         unit | int | e2e | visual | a11y
docs/                ADRs, legacy inventory, backlog, runbooks, GitHub settings checklist
scripts/ci           convention checks (hooks + CI) scripts/db     database runbook helpers
```

## Working on the project

- Read [`AGENTS.md`](AGENTS.md) (rules for humans and AI agents) and [`CONTRIBUTING.md`](CONTRIBUTING.md) (workflow, stacked pull requests, definition of done).
- The scope lives in GitHub issues (epics with sub-issues) mirrored in [`docs/backlog.md`](docs/backlog.md); every ported feature references [`docs/legacy-inventory.md`](docs/legacy-inventory.md) and must match the legacy site pixel for pixel.
- Decisions are recorded in [`docs/adr/`](docs/adr/README.md).
- Required checks on every pull request: `conventions` (branch, commits, PR title, no AI attribution) and `ci` (static checks, migrations, tests, build).

## License

Proprietary. See [`LICENSE`](LICENSE).
