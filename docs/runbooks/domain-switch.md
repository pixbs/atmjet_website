# Runbook: move the production domain to the rewrite, and back

Implements E12.2 (#180). It moves one thing — which Vercel project answers for the production
host — and it is written so that the move can be undone in the time a DNS record takes to
expire.

The data half of the cutover (content freeze, delta import, reconciliation) is E5.14 and comes
with the import; this runbook assumes it has already run and that the new site is serving the
real content on its staging domain.

## What moves, and what does not

| Moves                                                              | Stays where it is                                                        |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| The production host, from the legacy Vercel project to the new     | The legacy Vercel project, deploying branch `legacy` (#23)               |
| `NEXT_PUBLIC_SITE_URL` in the new project's production environment | The legacy Neon project, read-only, untouched (ADR-0002)                 |
| Nothing else                                                       | The `legacy` schema and the `legacy-snapshot` branch in the new database |

Retiring what is left behind is a separate decision, with its own gates:
`docs/runbooks/decommission.md`.

## Prerequisites

Every one of these is a gate. A "no" stops the switch rather than starting a discussion during it.

- [ ] The new project's staging domain serves the complete site, and the content-entry checklist
      is signed (#179).
- [ ] `bun run test:e2e`, `test:visual` and `test:a11y` are green against the staging URL, and
      `bun run test:lighthouse` is within budget (#43).
- [ ] The production environment of the new Vercel project holds every variable the production
      column of `docs/environment.md` marks ●, including `TELEGRAM_BOT_TOKEN`,
      `TELEGRAM_CHAT_IDS` and `CRON_SECRET`.
- [ ] The Vercel account is not blocked and production deployments are building (#248).
- [ ] Someone with access to the DNS zone is available for the whole window, not on call.
- [ ] The rollback below has been read by whoever is performing the switch.

## T-48 hours: lower the TTL

In the DNS zone, set the TTL of the production records to **300 seconds**. Note the previous
value here so it can be restored afterwards:

| Record | Type | Previous TTL | Previous value |
| ------ | ---- | ------------ | -------------- |
|        |      |              |                |

A record that has been served for a day with a TTL of 3600 is still being served from resolver
caches an hour after it changes. Lowering the TTL is the only step that has to happen in advance,
and it is what turns a bad switch from a day into five minutes.

Do not change anything else in this window.

## T-1 hour: tell the new site its own name, before anyone asks it

`NEXT_PUBLIC_SITE_URL` is what every canonical, every `hreflang`, the three sitemaps and
`robots.txt` are built from (`src/lib/urls.ts`, `src/app/robots.ts`). It is read at build time as
well as at request time, so it has to be right **before** the domain points at the project, or
the first crawl of the new site advertises the staging host — which is the legacy site's own bug
in reverse (`docs/legacy-inventory.md` section 2.3).

1. Vercel → the new project → Settings → Environment Variables → Production →
   `NEXT_PUBLIC_SITE_URL` = the production origin, with its scheme (`https://<host>`).
2. Redeploy production so the value is baked in. Wait for it to finish.
3. Check the deployment through its own URL, where the variable is already the production host:

   ```bash
   DEPLOY=https://<the-new-production-deployment>.vercel.app
   curl -s "$DEPLOY/robots.txt"                       # every Sitemap: line names the production host
   curl -s "$DEPLOY/sitemap.xml" | grep -c '<loc>'    # more than zero
   curl -s "$DEPLOY/en" | grep -o '<link rel="canonical"[^>]*>'
   ```

   If any of those still names the staging host, the redeploy did not pick the variable up. Stop
   and fix it; nothing after this point is worth doing with the wrong host in the HTML.

## The switch

1. **Remove** the production host from the legacy Vercel project (Settings → Domains). A domain
   can only be attached to one project, and Vercel will not let the new project claim it while
   the old one holds it. Removing it does not delete the project or its deployments.
2. **Add** the same host to the new project (Settings → Domains), plus the `www` variant if the
   zone has one, with the same redirect direction the legacy project used.
3. Follow Vercel's instructions for the zone: either the `A`/`CNAME` records it prints, or
   nameserver delegation if the zone is already on Vercel. Keep the TTL at 300.
4. Watch the certificate. Vercel issues a new one for the host on the new project; until it is
   issued the host answers with a TLS error, not with the old site. This is the loudest part of
   the window and it is normally under two minutes.

Record the times:

| Step                        | Planned | Actual |
| --------------------------- | ------- | ------ |
| Domain removed from legacy  |         |        |
| Domain added to new project |         |        |
| Certificate issued          |         |        |
| Verification complete       |         |        |

## Verify

Run these against the production host, not against a deployment URL. `$SITE` is
`https://<production-host>`.

```bash
SITE=https://<production-host>

# 1. The site answers, in both served languages, on the host itself.
for path in / /en /ru /en/aircraft /ru/yachts /en/empty_legs; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' -L "$SITE$path")" "$path"
done

# 2. It is the rewrite and not the legacy build.
curl -s "$SITE/en" | grep -q 'data-section=' && echo 'rewrite'

# 3. Crawlers are pointed at this host, and all three sitemaps answer.
curl -s "$SITE/robots.txt"
for map in /sitemap.xml /aircraft/sitemap.xml /yachts/sitemap.xml; do
  printf '%s %s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$SITE$map")" \
    "$(curl -s "$SITE$map" | grep -c '<loc>')" "$map"
done

# 4. Nothing in a sitemap answers with a redirect or a 404 (what tests/e2e/sitemap.e2e.spec.ts
#    asserts on every deployment, repeated here against the live host).
curl -s "$SITE/sitemap.xml" | grep -o '<loc>[^<]*' | cut -c6- | while read -r url; do
  printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$url")" "$url"
done | grep -v '^200 ' || echo 'every advertised URL answers 200'

# 5. The legacy URLs still resolve, through the Redirects collection.
for path in /en/planes /en/aircrafts /ru/jets; do
  printf '%s %s -> %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$SITE$path")" "$path" \
    "$(curl -s -o /dev/null -w '%{redirect_url}' "$SITE$path")"
done

# 6. The admin is reachable and the API is not indexed.
curl -s -o /dev/null -w '%{http_code}\n' "$SITE/admin"
```

Then, by hand, because no script can tell you a lead arrived:

- [ ] Send one booking request from the production site and confirm it reaches the Telegram chat.
      The queue is drained by the cron in `vercel.json` (`/api/payload-jobs/run`, every minute),
      signed with `CRON_SECRET`: a lead that is stored but never delivered means that variable or
      the bot token is wrong in the production environment, not that the form is broken (#161).
- [ ] Sign in to `/admin`, publish a trivial change to a page, and confirm the public page shows
      it within a few seconds. That exercises the `revalidateTag` path end to end.
- [ ] Open the site on a phone, on a real network.
- [ ] Submit the three sitemaps in Search Console for the production property, and keep the
      legacy property until coverage has moved across (#183).

The full browser tiers can be pointed at the live host once it is up:

```bash
PLAYWRIGHT_BASE_URL=$SITE bun run test:e2e
PLAYWRIGHT_BASE_URL=$SITE bun run test:a11y
```

Do not run `test:visual` against production: the baselines are captured on Linux at fixed
viewports (`tests/visual/README.md`), and a production run will differ for reasons that have
nothing to do with the switch.

## Rollback

The legacy project is still deploying branch `legacy` and its last production deployment is still
there (#181 is what eventually stops that, and it runs only after the soak). Rolling back is the
switch in reverse and needs no build:

1. Vercel → the new project → Settings → Domains → remove the production host.
2. Vercel → the legacy project → Settings → Domains → add it back.
3. Confirm the zone's records point where Vercel asks, TTL still 300.
4. Wait for the certificate, then re-run steps 1 and 2 of **Verify** — expecting the legacy
   markup this time.

With the TTL at 300 the whole rollback is minutes. **This is why the TTL step is not optional and
why nothing else is changed in the same window**: the only thing that has to be undone is which
project holds one domain.

Leave `NEXT_PUBLIC_SITE_URL` on the new project alone during a rollback. It is correct either
way, and changing it costs a build.

Decide the rollback trigger before starting, and write it here:

> Roll back if ____________________ is not true within ____ minutes of the certificate being
> issued.

## Afterwards

- [ ] Restore the DNS TTL to its previous value once the switch has held for 24 hours.
- [ ] Post-launch monitoring starts now: the 404 log, Search Console coverage, Core Web Vitals,
      and lead delivery checked daily (#183).
- [ ] The legacy project's automatic deployments are disabled and its last production deployment
      is kept for the agreed rollback period (#181).
- [ ] Nothing is deleted. Retirement is `docs/runbooks/decommission.md`, and it starts with a
      written sign-off.

## Communication

| When                       | Who                            | What                                                             |
| -------------------------- | ------------------------------ | ---------------------------------------------------------------- |
| T-48h, with the TTL change | Everyone who publishes content | The admin to use after the switch, and the freeze window         |
| T-1h                       | The same                       | The content freeze begins; nothing is published on either side   |
| At the switch              | The same                       | The site may be briefly unreachable while the certificate issues |
| Verification complete      | The same                       | The new admin is open for publishing                             |
| T+24h                      | The same                       | Held, or rolled back and why                                     |
