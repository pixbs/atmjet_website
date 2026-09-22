# Runbook: where an error is read

Implements E1.8 (#36), whose decision of 2026-09-13 is **Vercel's built-in logs and
observability only, no third-party monitoring**. There is nothing to install and no variable to
set, so what this file holds is the other half of that decision: where each kind of failure
surfaces, what is deliberately not collected, and what would make us revisit it.

## What collects what

| Where it fails                          | Where it is read                                                  | How long it is kept                     |
| --------------------------------------- | ----------------------------------------------------------------- | --------------------------------------- |
| A server render, a route handler        | Vercel → the project → Logs (runtime), filtered by path or status | The plan's retention (an hour on Hobby) |
| A Payload Local API call                | The same runtime log; every message is prefixed `[<area>]`        | The same                                |
| The build, including `migrate`          | Vercel → the deployment → Build Logs                              | As long as the deployment is kept       |
| A queued Telegram delivery              | The lead's own document in `/admin`, not a log (#161)             | Until the lead is deleted               |
| A cron run (`/api/payload-jobs/run`)    | Vercel → the project → Cron Jobs, and the runtime log it writes   | The plan's retention                    |
| Core Web Vitals of a real visit         | Vercel → the project → Observability → Web Vitals                 | The plan's retention                    |
| **An exception in a visitor's browser** | **Nowhere.** See below.                                           | —                                       |

## What is not collected, on purpose

**Browser exceptions.** `src/app/(frontend)/[locale]/error.tsx` is the error boundary of the
public site; it writes the error to the browser console, which is where a developer reading it
has to be. Nothing ships it anywhere, because nothing is installed to receive it. A visitor who
hits it sees the boundary's copy and a retry button, and we learn about it when they say so or
when the same fault shows on the server. Adopting a browser SDK is the one change that would
fix this, and it is what the revisit below is for.

**Anything a lead typed.** `src/lib/data/leads.ts` never logs the payload: a refusal is one line
with neither the reason's detail nor the address behind it (#157), and a failed write logs the
error rather than the submission. The name, e-mail and telephone of a lead live in the `leads`
collection, behind the admin's access control (`docs/access-matrix.md`), and nowhere else. Keep
it that way: a `console.log` of a form value would put personal data in a log that support staff
and Vercel can read.

**Secrets and connection strings.** `src/lib/env.ts` reports the name of a variable that is
missing or malformed and never its value, and the `[<area>] the database was unreachable` lines
log the driver's error, which names the host and the port it could not reach and not the role or
the password. Nothing else prints a variable.

## Reading the runtime log

Every message the site writes is prefixed with the area that wrote it, so a filter is enough:

| Prefix                                                                                                                                 | What it means                                                                                        |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `[leads]`                                                                                                                              | A submission was refused (automated, or rate-limited) or could not be stored                         |
| `[site-settings]`, `[header]`, `[footer]`, `[pages]`, `[media]`, `[aircraft]`, `[yachts]`, `[empty-legs]`, `[airports]`, `[redirects]` | The database was unreachable and the section rendered without its content rather than failing        |
| `[pages]`, `[aircraft]`, `[yachts]` with "the sitemap is empty"                                                                        | The build could not reach the database, so that sitemap advertises nothing until the next deployment |
| `[urls]`                                                                                                                               | `NEXT_PUBLIC_SITE_URL` is missing or unparseable, so the site is naming itself `localhost`           |

A failed Telegram delivery writes no log line at all: the attempt, its count and the error are
written onto the lead itself (`src/jobs`), which is where an administrator reads them (#161).

A `[<area>] the database was unreachable` line on production is the one to act on: the pages
still render, so nothing is obviously broken from outside, and the site is quietly serving empty
sections. Check Neon first, then `DATABASE_URL` in the Vercel environment.

## When something is wrong

1. Open the deployment that is serving production and read its runtime log for the last hour,
   filtered to `status >= 500` first and then to the prefix above that matches the symptom.
2. A fault that is not in the log happened in a browser. Ask for the console output and the URL;
   reproduce it with `bun run build && bun run start` locally, where the boundary's
   `console.error` is in your own console.
3. A lead that never arrived is diagnosed on the lead itself in `/admin` rather than in a log:
   the document records the delivery attempt and its failure (#161). The queue is drained by the
   cron in `vercel.json`, so a lead stored and never attempted means the cron is not running.
4. Nothing here pages anyone. There is no alert routing, because there is no alerting; a failure
   is found by someone looking, which is the cost of the decision.

## Revisit when

- Leads stop arriving and nobody notices for a day. That is the failure alerting exists for.
- A browser-only fault is reported twice and cannot be reproduced from the server log.
- The traffic outgrows the log retention of the plan, so "read the last hour" stops being enough.

Any of those makes the case for a tool with a Next.js SDK; until then the acceptance criterion
of #36 — an uncaught server error visible with source maps — is met by Vercel's own runtime log,
which symbolicates the server bundle of the deployment it belongs to.
