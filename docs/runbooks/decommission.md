# Runbook: retire the legacy database, Vercel project and admin

Implements E5.15 (#87) and the order of operations for E12.3 (#181), E12.4 (#182) and E12.6
(#184). Every step here deletes something that cannot be recreated, so every step is behind a
gate and behind a signature.

## The decision (2026-09-13)

- The encrypted snapshot of E5.1 is **retained indefinitely** in private storage.
- The repository owner **signs off in writing** before any legacy project is retired. This
  runbook holds the record.

## What survives every deletion below

Retirement is safe because none of the legacy data lives only in the legacy projects by the time
it happens:

| Kept                                 | Where                                                      | Who can reach it                  |
| ------------------------------------ | ---------------------------------------------------------- | --------------------------------- |
| The full pre-cutover dump, encrypted | Private storage, indefinitely (E5.1, ADR-0002)             | Whoever holds the `age` key       |
| The legacy tables, queryable         | Schema `legacy` in the new Neon project, immutable         | `app` has `SELECT`; nobody writes |
| A frozen copy of that schema         | Neon branch `legacy-snapshot` in the new project           | Same                              |
| The legacy application code          | Branch `legacy` and the `legacy/*` tags in this repository | Anyone with the repository        |
| What the legacy site _was_           | `docs/legacy-inventory.md`                                 | Anyone with the repository        |

The branch and the tags are read-only and are **never deleted** (AGENTS.md section 1). Nothing in
this runbook touches them.

## Gates

In order. Each one is a date and a name, not a feeling.

- [ ] **G1 — The domain has moved and held.** `docs/runbooks/domain-switch.md` is complete and
      the production host has served the rewrite without a rollback for the agreed soak period.
- [ ] **G2 — Post-launch monitoring is clean.** #183: the 404 log has stopped producing legacy
      URLs that need a redirect, Search Console coverage has moved to the new property, lead
      delivery has been checked daily for the whole soak, and the coverage checklist of
      `docs/legacy-inventory.md` section 15 is signed item by item.
- [ ] **G3 — The reconciliation is signed.** E5.13: row counts and checksums agree between the
      `legacy` schema and the imported collections.
- [ ] **G4 — The snapshot is where the table above says it is**, and someone other than its
      author has confirmed they can decrypt it. A backup nobody has restored is not a backup.
- [ ] **G5 — The written sign-off below is filled in.**

Nothing in "Order of operations" starts before G1–G5 are all ticked.

## The sign-off record

> I have confirmed gates G1 to G4 and authorise the retirement of the legacy Vercel project, the
> legacy admin application and the legacy Neon project, on the dates recorded below.

| Field                              | Value |
| ---------------------------------- | ----- |
| Name                               |       |
| Role                               |       |
| Date                               |       |
| Soak period agreed at G1           |       |
| Snapshot location (no credentials) |       |
| Who holds the decryption key       |       |

## Order of operations

The order matters: each step is reversible until the next one, and the last one is not reversible
at all.

### 1. Freeze the legacy Vercel project (#181, E12.3)

1. Settings → Git → disable automatic deployments (disconnect the repository, or set ignored
   build step to always skip). The project stops building; its deployments stay.
2. Confirm the last production deployment from branch `legacy` is still listed and still loads
   through its own `*.vercel.app` URL. **That deployment is the rollback** for as long as the
   soak period runs; do not delete it while it is.
3. Record the deployment URL and the date here:

   | Last legacy production deployment | Frozen on |
   | --------------------------------- | --------- |
   |                                   |           |

Still reversible: re-enabling deployments and re-attaching the domain is the rollback in
`docs/runbooks/domain-switch.md`.

### 2. Disconnect the legacy admin (#182, E12.4)

`atmjet-admin` writes to the legacy database — it is the only thing that does. Until it is
disconnected, "the legacy database is frozen" is a promise rather than a fact.

1. Retire its deployment (the same freeze as step 1, on its own project).
2. Remove its database credentials from wherever it holds them.
3. Confirm no writes are reaching the legacy database: the row counts from the G3 reconciliation
   still match.

This step is also a disposal, not only a retirement: `atmjet_admin__users` stores passwords in
plain text (`docs/legacy-inventory.md` section 14), so the account list stops being reachable
from a running application here. Nobody is migrated — the rewrite's admin accounts are created
one at a time by an administrator (`CONTRIBUTING.md`).

| Admin deployment retired | Credentials removed | By  |
| ------------------------ | ------------------- | --- |
|                          |                     |     |

### 3. Archive the legacy Vercel project (E12.3, after the soak)

Once the soak period recorded at G1 has passed and the rollback is no longer wanted:

1. Delete the project, or archive it if the plan offers archiving — archiving keeps the
   deployment list and costs nothing.
2. The custom domains are already off it (they moved in the domain switch). Check that nothing
   else is attached: preview aliases, other domains, integrations.

| Legacy Vercel project archived or deleted | Date | By  |
| ----------------------------------------- | ---- | --- |
|                                           |      |     |

### 4. Delete the legacy Neon project (#184, E12.6)

Last, and irreversible. Before pressing it, re-read the "what survives" table above and confirm
each row is true **today**, not at G4.

1. Confirm the `legacy` schema in the new project answers a query and its row counts match the
   reconciliation report.
2. Confirm the `legacy-snapshot` branch still exists in the new project.
3. Confirm the encrypted snapshot is still in private storage and its checksum matches what E5.1
   recorded.
4. Delete the legacy Neon project.

| Legacy Neon project deleted | Date | By  | Snapshot checksum re-verified |
| --------------------------- | ---- | --- | ----------------------------- |
|                             |      |     |                               |

## What is never retired

- Branch `legacy` and the `legacy/*` tags in this repository.
- `docs/legacy-inventory.md`, which is the description of the site that was replaced and the
  reference every parity test still points at.
- The `legacy` schema and the `legacy-snapshot` branch in the new Neon project. They are the
  reason deleting the legacy project is safe, so they outlive it rather than going with it.
- The encrypted snapshot, per the decision above.

## If something is found missing afterwards

The order exists so that this has an answer at every point. Before step 4, the legacy project is
still there. After step 4:

1. Query the `legacy` schema in the new project — it holds every legacy table as they were at the
   snapshot, plus whatever the delta import of E5.14 reconciled.
2. If the row is older than the snapshot or was never imported, restore the encrypted dump into a
   scratch database following `docs/runbooks/legacy-db-snapshot-and-restore.md` and read it there.
3. Neither path writes to anything. Nothing in this project ever wrote to the legacy database,
   and that is still true after it has been deleted.
