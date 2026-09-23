# ADR-0008: Lean conventions: slices, squash merges, Payload's migration workflow, fixed coverage, one enforcement layer

Status: accepted (2026-09-13). Amends ADR-0001 (merging, pull request scope), ADR-0002 (item 4, development workflow), ADR-0004 (coverage ratchet, tests-required gate) and ADR-0005 (enforcement layers 3 and 6, self-test).

## Context

The first fourteen stacked pull requests of the content model (#213 to #226) add 62,353 lines against `master`. 84% of them are Payload migration JSON snapshots, one full copy of the schema per pull request; 2% are regenerated types; the hand-written remainder is about 3,900 lines of source and 4,800 lines of tests. Inside the hand-written part, 20% of the source lines are comments (6% on `master`), about forty exports have no caller outside their own tests, and several tests assert a constant equals its literal. The official Payload website template, a complete site, has 644 lines of collection code, 329 lines of tests and 0.4% comment lines.

The rules produced this, not the people or the tools running them:

- `push: false` everywhere plus the CI drift check forces a migration in every schema pull request. Payload's own workflow is the opposite: push mode locally, "treat your local dev database as a sandbox", and "fully build out a feature before you create a migration".
- "One issue = one pull request" over a 168-issue backlog produces fourteen-deep stacks that nobody can review or merge.
- The coverage ratchet and the "src change must touch tests" gate reward tests for constants.
- Rebase merging lands commits on `master` with no link to their pull request.
- Branch names and commit messages were checked four times (local hook, required workflow, self-test, branch-deleting workflow). Client-side hooks are not copied on clone and are skipped with `--no-verify`, so only the server-side check enforces anything; GitHub's commit-metadata rules would replace the workflow but are only available on the Enterprise plan.

## Decision

1. **Squash merges.** `master` holds one commit per pull request, named after it, so the history reads as the list of slices; the ruleset allows squash only and no longer requires linear history. Stacked pull requests merge bottom-up: when a merged head branch is deleted, GitHub retargets the next one to `master`, and its diff shows the lower slice again until it merges, one more reason to keep stacks two deep.
2. **One pull request = one shippable slice.** A page with its blocks, a block with its components, a collection with the page or import that reads it, or one process change. A slice may close several issues. Aim for 200 to 800 hand-written lines, generated files excluded; above 1,000, split. Merge each slice before starting the next; stack at most two open pull requests.
3. **Payload's migration workflow.** Drizzle push runs only under `next dev` (`push: process.env.NODE_ENV === 'development'`; the adapter's own default would also push during seeding and tests, which the docs warn against mixing with migrations); seeding, tests, CI, previews and production apply committed migrations, each deployment to the database it reads: a preview migrates the Neon branch the Vercel integration creates for it (#18, #307); one migration per finished slice. The CI drift check stays. Before the first production database exists, the accumulated migrations are squashed into one initial migration (#229).
4. **Generated files are marked generated.** Migration snapshots, `src/payload-types.ts`, the admin import map and the legacy visual manifest carry `linguist-generated` in `.gitattributes`: hidden by default in pull request diffs and excluded from language statistics.
5. **Fixed coverage thresholds.** The numbers in `vitest.config.mts` change only in a pull request that says why. No ratchet, no tests-required gate, no `no-tests-needed` label. A test asserts a behaviour the issue lists, never a constant, a type or an admin `condition` called directly.
6. **Smallest diff that passes.** Only what the issue lists; reuse before adding; the framework default over a custom layer; no export without a caller; comments say why in one sentence with a link; admin descriptions are one line. An unused-export check (knip) becomes a CI step in #230. The same rule governs the manifest: a dependency arrives with the slice that first imports it, at its current version, and that pull request says which component needs it (#58, 2026-09-13). The legacy `package.json` is therefore not carried over as a block, and what it depended on that is dead or replaced — `@radix-ui/*`, `cmdk`, `lucide-react`, `usehooks-ts`, `next-sitemap`, `react-phone-input-2`, `axios`, `framer-motion`, `react-intersection-observer` (inventory section 1.1) — never arrives at all. knip fails the build on a dependency nothing imports, so one cannot sit in the manifest waiting for its caller.
7. **One enforcement layer.** The `conventions` workflow is the required check for branch names, pull request titles, commit messages and attribution. The branch-guard workflow, the convention self-test and the tests-required job are removed. lefthook keeps prettier, eslint and commitlint as fast local feedback, nothing more.

## Consequences

- The current stack merges as it is; the cleanups (#229, #230, #231) land as small pull requests on `master` instead of surgery inside fourteen branches.
- Every future migration still writes a full snapshot; fewer migrations and the generated-file attribute keep that out of review.
- Reviewers judge a pull request on its hand-written lines; the pull request template asks for that number when it is large.
- The repository settings (merge method, ruleset import) are an owner action (#227).
- A dependency is justified where it is added rather than in a list that goes stale: `git log -- package.json` is the record of why each one is there.

## Sources

- Payload, [migrations](https://payloadcms.com/docs/database/migrations) and [Postgres adapter](https://payloadcms.com/docs/database/postgres): push mode in development, one migration per finished feature, `migrate:fresh`.
- Payload, [website template](https://github.com/payloadcms/payload/tree/main/templates/website): one revalidation hook per collection, shared field factories, plugin defaults.
- GitHub, [rules available for rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets) (metadata restrictions are Enterprise-only) and [customizing how changed files appear](https://docs.github.com/en/repositories/working-with-files/managing-files/customizing-how-changed-files-appear-on-github) (`linguist-generated`).
- Pro Git, [Git hooks](https://git-scm.com/book/en/v2/Customizing-Git-Git-Hooks): client-side hooks are not cloned and can be bypassed; policy belongs server-side.
- Google engineering practices, [small CLs](https://google.github.io/eng-practices/review/developer/small-cls.html) (100 lines reasonable, 1,000 too large) and [what to look for in a code review](https://google.github.io/eng-practices/review/reviewer/looking-for.html) (complexity, speculative code, comments, tests).
- Google Testing Blog, [code coverage best practices](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html): 60% acceptable, 75% commendable, 90% exemplary; coverage is not a quality guarantee.
- DORA, [working in small batches](https://dora.dev/capabilities/working-in-small-batches/).
- SmartBear, [best practices for peer code review](https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/): 200 to 400 lines per review.
- Martin Fowler, [Yagni](https://martinfowler.com/bliki/Yagni.html): cost of build, delay, carry and repair.
