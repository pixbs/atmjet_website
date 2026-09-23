# Environment variables

Every variable this repository expects, where it is set, and what happens when it is not (issue
#19). `.env.example` is the development copy of the first table; `tests/unit/env.test.ts` fails
when the two stop listing the same names, so neither can drift.

Two of them stop the site starting. `src/lib/env.ts` checks those at the top of
`src/payload.config.ts` and throws one message naming every variable that is wrong — a missing
`DATABASE_URL` used to arrive as a connection error and a missing `PAYLOAD_SECRET` as an unsigned
cookie, neither of them naming the variable. Everything else is optional **by design**: the
feature that reads it says what it does without it, and the column below says the same.

The legacy names are gone: `POSTGRES_URL` is `DATABASE_URL`, `ALLOWED_USERS` is
`TELEGRAM_CHAT_IDS`, the `VERCEL_URL` fallbacks are `NEXT_PUBLIC_SITE_URL`, and the hard-coded GTM
id is `NEXT_PUBLIC_GTM_ID` (`docs/legacy-inventory.md` section 9).

## The variables we set

`dev` is a developer's `.env`; `preview` and `production` are the Vercel environments of the same
name. ● set, ○ optional there, — not set there.

| Variable                          | dev | preview | production | Without it                                                                                                                                                                            | Read by                                    |
| --------------------------------- | --- | ------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `DATABASE_URL`                    | ●   | ●       | ●          | **The site does not start.** Neon pooled connection string.                                                                                                                           | `src/payload.config.ts`                    |
| `PAYLOAD_SECRET`                  | ●   | ●       | ●          | **The site does not start.** Signs sessions; rotating it signs everyone out.                                                                                                          | `src/payload.config.ts`                    |
| `PREVIEW_SECRET`                  | ○   | ○       | ○          | Nothing. **No code reads it yet** — reserved for Payload draft preview.                                                                                                               | nothing                                    |
| `NEXT_PUBLIC_SITE_URL`            | ○   | ○       | ○          | On Vercel the site calls itself `VERCEL_PROJECT_PRODUCTION_URL` (#403); elsewhere `http://localhost:3000`. Set it only for a canonical host that is not the Vercel production domain. | `src/lib/urls.ts`, `src/payload.config.ts` |
| `NEXT_PUBLIC_GTM_ID`              | ○   | ○       | ●          | No tag manager is loaded, and the cookie banner still records the answer.                                                                                                             | `src/app/(frontend)/[locale]/layout.tsx`   |
| `S3_BUCKET`                       | ○   | ○       | ○          | Nothing yet. **No code reads the `S3_*` group** — it arrives with #20.                                                                                                                | nothing                                    |
| `S3_REGION`                       | ○   | ○       | ○          | As above.                                                                                                                                                                             | nothing                                    |
| `S3_ENDPOINT`                     | ○   | ○       | ○          | As above.                                                                                                                                                                             | nothing                                    |
| `S3_ACCESS_KEY_ID`                | ○   | ○       | ○          | As above.                                                                                                                                                                             | nothing                                    |
| `S3_SECRET_ACCESS_KEY`            | ○   | ○       | ○          | As above.                                                                                                                                                                             | nothing                                    |
| `S3_PUBLIC_URL`                   | ○   | ○       | ○          | As above.                                                                                                                                                                             | nothing                                    |
| `TELEGRAM_BOT_TOKEN`              | ○   | ○       | ●          | A lead is stored and its delivery recorded as failed, not thrown (#161).                                                                                                              | `src/lib/telegram.ts`                      |
| `TELEGRAM_CHAT_IDS`               | ○   | ○       | ●          | As above. Comma-separated list of chat ids.                                                                                                                                           | `src/lib/telegram.ts`                      |
| `CRON_SECRET`                     | ○   | ○       | ●          | Vercel cannot drain the lead queue; an admin still can, from the admin panel.                                                                                                         | `src/payload.config.ts`                    |
| `PLAYWRIGHT_BASE_URL`             | ○   | —       | —          | The browser tiers build and serve the site themselves.                                                                                                                                | `playwright.config.ts`                     |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | ○   | —       | —          | The browser tiers cannot reach a protected preview (#248).                                                                                                                            | `playwright.config.ts`, `e2e.yml`          |
| `SEED_ADMIN_EMAIL`                | ○   | —       | —          | `bun run seed` creates `dev@atmjet.local`.                                                                                                                                            | `scripts/seed/users.ts`                    |
| `SEED_ADMIN_PASSWORD`             | ○   | —       | —          | `bun run seed` uses `dev-password-change-me`.                                                                                                                                         | `scripts/seed/users.ts`                    |

## Set by the platform or the tooling, not by us

These are never put in `.env.example`, because something else provides them.

| Variable                              | Provided by            | Read by                                                                                  |
| ------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| `NODE_ENV`                            | the framework          | `src/payload.config.ts` (Drizzle push only under `next dev`), `scripts/seed/index.ts`    |
| `VERCEL_ENV`                          | Vercel                 | `scripts/db/run-deploy-migrations.ts` — migrations run on production deployments only    |
| `CI`                                  | the runner             | `playwright.config.ts`                                                                   |
| `SEED_ALLOW_PRODUCTION`               | a person, deliberately | `scripts/seed/index.ts` — the override that lets the seed run with `NODE_ENV=production` |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | a developer's machine  | `scripts/baselines/capture-legacy.ts`                                                    |

## Who sets them, and rotation

| Group                             | Owner                                | Rotation                                                                                     |
| --------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                    | whoever administers the Neon project | Reset the role's password in Neon, then update all three Vercel environments in one sitting. |
| `PAYLOAD_SECRET`                  | the repository owner                 | A generated 32-byte string. Rotating it invalidates every session: everyone signs in again.  |
| `S3_*`                            | whoever administers the bucket       | Rotate the key pair in the provider's console; the bucket and region do not change.          |
| `TELEGRAM_*`                      | whoever owns the bot                 | `/revoke` in BotFather issues a new token; the chat ids change only when the chat does.      |
| `CRON_SECRET`                     | the Vercel project owner             | Any long random string; Vercel signs its cron calls with whatever is set.                    |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | the Vercel project owner             | Regenerate in the project's Deployment Protection settings; also a repository secret (#248). |

A value that has been in a build log, a screenshot or a pull request is rotated, not reused. The
legacy repositories leaked a TinyPNG key and tracked an `.env` with real secrets
(`docs/legacy-inventory.md` section 13, entry 89, and #28); nothing here repeats that.

## What sets nothing

Error monitoring and logging (#36, E1.8) is Vercel's own, decided on 2026-09-13, so there is no
key, no DSN and no sampling rate in either table above; `docs/runbooks/observability.md` is where
each kind of failure is read instead. Adopting a tool later would add its variables to the first.
