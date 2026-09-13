# GitHub, Vercel and Neon settings (owner checklist)

Settings that cannot live in code. Tick them in the epic issue (#3) as they are done.

## Before merging the reset pull request

- [ ] Vercel: switch the existing project's **Production Branch** to `legacy` and confirm a production deploy from it. The reset replaces `master` with an empty boilerplate.
- [ ] Create the tag `legacy/v1` at `8b8f375` (Releases → Draft a new release → tag `legacy/v1` on branch `legacy`). The session that prepared this repository could not push tags.

## Repository settings (Settings → General)

- [ ] Pull requests: allow **squash merging only**, default commit message: pull request title; disable merge commits and rebase merging (#227).
- [ ] Automatically delete head branches; allow auto-merge.
- [ ] Features: disable Wiki and Projects unless used; issues stay enabled with the forms in `.github/ISSUE_TEMPLATE`.
- [ ] Description and topics (payload, nextjs, bun, tailwindcss).
- [ ] Preview features: enable stacked pull requests for the repository (public preview) and install `gh extension install github/gh-stack` locally.

## Rules (Settings → Rules → Rulesets → Import)

- [ ] Import `.github/rulesets/master.json` (pull requests squash-merged, required checks `conventions` and `ci`, no force push or deletion).
- [ ] Import `.github/rulesets/legacy-branch.json` and `.github/rulesets/legacy-tags.json` (read-only legacy refs).
- [ ] After the first pull request run, confirm the two required checks are recognised (the check names must match exactly: `conventions`, `ci`).

## Actions (Settings → Actions → General)

- [ ] Allow actions: GitHub-owned, verified creators, plus the pinned third-party actions used in `.github/workflows` (`oven-sh/setup-bun`, `amannn/action-semantic-pull-request`, `crazy-max/ghaction-github-labeler`, `treosh/lighthouse-ci-action`).
- [ ] Workflow permissions: read repository contents (workflows declare what they need: `conventions` and `scrub comments` request `pull-requests: write` to remove tool footers).
- [ ] Variables (Settings → Secrets and variables → Actions → Variables):
  - `STAGING_URL`: the new Vercel project's staging URL (target of the nightly and master `e2e` runs)
- [ ] Secrets: `VERCEL_AUTOMATION_BYPASS_SECRET` (Vercel → Deployment Protection → Protection Bypass for Automation) so the browser tier can reach protected previews.
- [ ] Run the `labels` workflow once (`workflow_dispatch`) to normalise label colours and descriptions.
- [ ] After the first merge, run the `e2e` workflow once with `workflow_dispatch` against the staging URL; its triggers only fire from the default branch.

## Security (Settings → Code security)

- [ ] Enable secret scanning and push protection; triage the alerts for the leaked TinyPNG key (legacy `optimize.ps1`).
- [ ] Rotate the credentials exposed in the legacy admin repository (`POSTGRES_URL`, `NEXTAUTH_SECRET`, AWS key pair) and the TinyPNG key; record the rotation in the security issue.
- [ ] Dependabot: version updates are configured in `.github/dependabot.yml`; enable security updates.

## Vercel (new project for the rewrite)

- [ ] Create a new project from this repository: framework Next.js, package manager Bun (auto-detected from `bun.lock`), Node 22, build command `bun run ci` (runs migrations, then builds), root directory `/`.
- [ ] Environment variables per environment: `DATABASE_URL`, `PAYLOAD_SECRET`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GTM_ID`, `S3_*`, `TELEGRAM_*`, `PREVIEW_SECRET` (see `.env.example`).
- [ ] Neon integration with preview branches so preview builds migrate a branch, never production.
- [ ] Staging domain on the new project; the production domain moves only at cutover (ADR-0002).

## Neon

- [ ] Record the legacy project's facts (Postgres major, size, extensions, roles, endpoints) in the migration epic.
- [ ] Create the new project with roles `owner` and `app`; follow `docs/runbooks/legacy-db-snapshot-and-restore.md`.
