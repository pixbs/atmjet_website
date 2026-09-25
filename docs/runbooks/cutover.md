# Runbook: cut the content over from the legacy database

Implements E5.14 (#86), the data half of the cutover: freeze the legacy admin, bring what changed
since the snapshot across, prove nothing was lost, then hand over to
`docs/runbooks/domain-switch.md` for the domain. Nothing here writes to the legacy database
(ADR-0002 item 1), and nothing writes to the frozen `legacy` schema of the new project.

## How a delta works here

The importers are idempotent twice over: the ledger (`migration-runs`) skips a row it has already
written, and every document is found again by its natural key (ICAO code, canonical
registration, legacy id) rather than inserted. The ledger names a row with its schema
(`legacy.airports:17`), so a second copy of the legacy database restored under another schema
name — `legacy_cutover` below — reads as rows the ledger has not seen: each one updates the
document its natural key finds, and a row added since the snapshot creates one. That is the
delta, and it is the same commands as the first import.

What a delta does not do on its own is delete: a document whose legacy row was deleted after the
snapshot stays. Step 5 lists those.

## Prerequisites

Every one is a gate.

- [ ] The snapshot runbook has run: `legacy` restored, checksummed and frozen, the Neon branch
      `legacy-snapshot` taken (#73, #74).
- [ ] The first import ran against `legacy` and `bun run import:legacy reconcile` passes (#85).
- [ ] **The dry run below completed on a branch of `legacy-snapshot` with a clean
      reconciliation**, and its output is attached to #86.
- [ ] The Spaces objects are mirrored (#21) and the media import has run (#84).
- [ ] The staging content-entry checklist is signed (#179). Editors have not changed the
      imported collections (Airports, Aircraft, Yachts, Contacts, Empty legs) on the new side:
      the delta rewrites what a legacy row holds, so an edit there is overwritten. Pages, globals
      and media are theirs.
- [ ] The rollback trigger of `domain-switch.md` is written down.

## Dry run (weeks before, repeatable)

On a Neon branch created from `legacy-snapshot`, never on the main branch:

```bash
export DATABASE_URL='postgres://owner@<dry-run-branch-direct-endpoint>/<db>?sslmode=require'
bun run migrate
for step in airports aircraft vehicles redirects yachts empty-legs; do
  bun run import:legacy "$step" | tee -a dry-run.log
done
bun run import:legacy reconcile | tee -a dry-run.log   # exits non-zero on any discrepancy
```

Attach `dry-run.log` to #86. The lines the runs print besides their counts — values the two
airport tables disagree on, contacts no row has, empty-leg codes no airport has — are the review
list: each one is either accepted in the issue or fixed in the new admin before the real run.
Delete the branch afterwards.

## 1. Freeze (T-1h)

- Announce the freeze (see **Communication**): from now on nobody saves anything in the legacy
  admin, and nobody edits the imported collections on the new side.
- Take the legacy checksums at the start of the window, with the snapshot runbook's script and
  the **direct** endpoint:

  ```bash
  DATABASE_URL='<legacy direct endpoint>' scripts/db/legacy-checksums.sh public > freeze-start.tsv
  ```

## 2. Take the cutover dump

Exactly as step 2 of `legacy-db-snapshot-and-restore.md`, into `cutover.dump` (encrypted at rest,
as the first one).

## 3. Restore it as `legacy_cutover`

`pg_restore` writes into `public`, which Payload owns in the new project, so the dump goes through
a scratch database first:

```bash
psql "$NEW_URL" -c 'CREATE DATABASE cutover_scratch'
pg_restore --dbname="${NEW_URL%/*}/cutover_scratch" --no-owner --no-privileges cutover.dump
psql "${NEW_URL%/*}/cutover_scratch" -c 'ALTER SCHEMA public RENAME TO legacy_cutover'
pg_dump "${NEW_URL%/*}/cutover_scratch" --schema=legacy_cutover --no-owner --no-privileges \
  | psql "$NEW_URL" -v ON_ERROR_STOP=1
psql "$NEW_URL" -c 'DROP DATABASE cutover_scratch' \
                -c 'GRANT USAGE ON SCHEMA legacy_cutover TO app' \
                -c 'GRANT SELECT ON ALL TABLES IN SCHEMA legacy_cutover TO app'
shred -u cutover.dump
DATABASE_URL="$NEW_URL" scripts/db/legacy-checksums.sh legacy_cutover > cutover-restored.tsv
diff <(cut -f2- freeze-start.tsv) <(cut -f2- cutover-restored.tsv) && echo "cutover copy is identical"
```

`legacy` is not touched: it stays the snapshot the first import and the audits refer to.

## 4. Delta import

```bash
export DATABASE_URL="$NEW_URL"
bun run scripts/media/mirror-spaces.ts --schema legacy_cutover   # objects added since #21 ran
for step in airports aircraft vehicles redirects yachts empty-legs; do
  bun run import:legacy "$step" --schema legacy_cutover | tee -a cutover.log
done
```

Each run can be repeated if it is interrupted; the ledger carries on where it stopped.

## 5. Verify

```bash
bun run import:legacy reconcile --schema legacy_cutover | tee -a cutover.log
```

It must pass. Then list the documents whose legacy row existed at the snapshot and is gone now,
one table at a time (shown for `new_yachts`; the same for `airports`, `new_airports`,
`aircrafts`, `vehicles`, `contact`, `yachts` and `atmjet_admin__empty_legs`):

```sql
SELECT m.target, m.document_id, m.source_id
FROM migration_runs m
WHERE m.source_table = 'legacy.new_yachts'
  AND NOT EXISTS (SELECT 1 FROM legacy_cutover.new_yachts c WHERE c.id::text = m.source_id);
```

Each row is a deletion made in the legacy admin during the project: delete the document in the new
admin, or record in #86 why it stays. Then:

- [ ] The legacy checksums again, at the end of the window, equal `freeze-start.tsv`: nothing was
      written to the legacy database while the dump was taken.
- [ ] `bun run test:e2e`, `test:visual` and `test:a11y` against the staging URL are green.
- [ ] Attach `cutover.log`, both checksum files and the deletion list to #86 and to the
      reconciliation report of #85.

## 6. Move the domain

`docs/runbooks/domain-switch.md`, from **T-1 hour**. The freeze holds until its **Verify** passes.

## Rollback

- **Before the domain moves**, there is nothing to undo: the legacy site and admin never stopped
  working. Lift the freeze. `legacy_cutover` can be dropped and the delta repeated later.
- **After the domain moves**, follow the rollback of `domain-switch.md`. Content published in the
  new admin after the switch does not exist in the legacy database; list it (documents with
  `updatedAt` after the switch) and re-enter it in the legacy admin before lifting the freeze
  there.
- The legacy database, `legacy` and `legacy-snapshot` are never part of a rollback: none of them
  was changed.

## Afterwards

- [ ] Keep `legacy_cutover` until the decommission sign-off (`docs/runbooks/decommission.md`);
      it is the last copy of the legacy data the new site was reconciled against.
- [ ] Post-launch monitoring starts (#183).

## Communication

| When                   | Who                            | What                                                               |
| ---------------------- | ------------------------------ | ------------------------------------------------------------------ |
| After the dry run      | Everyone who publishes content | The cutover date, and that imported collections are not edited     |
| T-48h                  | The same                       | The freeze window, and which admin to use afterwards               |
| T-1h                   | The same                       | The freeze begins: no saves in either admin                        |
| Verification complete  | The same                       | The domain moves next (`domain-switch.md` takes over the messages) |
| Rollback, if it occurs | The same                       | What was rolled back, and what has to be re-entered in which admin |
