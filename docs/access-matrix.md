# Access-control matrix

Who may do what, per collection and operation. Every cell has a test: the shared rules and the collections without a spec of their own live in `tests/int/access.int.spec.ts`, which also holds the guard that fails when a collection is added without declaring access at all; a collection with its own spec (`airports`, `aircraft`, `contacts`, `yachts`, `empty-legs`) keeps its cells there, next to the rest of its behaviour.

This is written out in full because the legacy admin had none of it: no roles, unauthenticated yacht routes, and passwords stored in plain text (`docs/legacy-inventory.md` section 14).

## Roles

| Role     | Who they are                                                |
| -------- | ----------------------------------------------------------- |
| `editor` | Runs the content: pages, media, aircraft, yachts, leads.    |
| `admin`  | Everything an editor can, plus the people and the settings. |

Roles live on the user as a required, repeatable field, so there is no such thing as a signed-in account with no role. `editor` is the default for a new account. Only an admin may write the field: without that guard an editor could add `admin` to their own roles and take over the site.

The very first account is a special case. Payload still allows it to be created while the collection is empty, so a fresh environment can be bootstrapped through `/admin` even though `create` is admin-only. `bun run seed` creates a local admin for development.

## Actors

| Actor     | Meaning                                          |
| --------- | ------------------------------------------------ |
| Anonymous | No session: a visitor, a crawler, or any caller. |
| Editor    | Signed in, holds `editor`.                       |
| Admin     | Signed in, holds `admin`.                        |
| Self      | Signed in, acting on their own user document.    |

## Collections

### `media`

Uploads are public because every page renders them; changing them needs someone who runs the content.

| Operation | Anonymous | Editor | Admin |
| --------- | --------- | ------ | ----- |
| read      | yes       | yes    | yes   |
| create    | no        | yes    | yes   |
| update    | no        | yes    | yes   |
| delete    | no        | yes    | yes   |

### `users`

| Operation   | Anonymous | Editor          | Admin |
| ----------- | --------- | --------------- | ----- |
| read        | no        | themselves only | yes   |
| create      | no        | no              | yes   |
| update      | no        | themselves only | yes   |
| delete      | no        | no              | yes   |
| admin panel | no        | yes             | yes   |

Field-level: `roles` is writable by admins only, on both create and update. Payload drops a field the caller may not write rather than failing the request, so an editor sending `roles: ['admin']` succeeds with their roles unchanged.

### `pages`, `airports`, `aircraft`, `yachts` and `empty-legs`

Content and reference data. `pages`, `aircraft`, `yachts` and `empty-legs` use `publishedOnly`, so the public sees published documents and the people who run the content see drafts too; `airports` is read by anyone, because the airport search endpoint (E9.9) and the empty legs block answer without a session.

| Collection | read           | create | update | delete |
| ---------- | -------------- | ------ | ------ | ------ |
| `pages`    | published only | editor | editor | editor |
| `airports` | anyone         | editor | editor | editor |
| `aircraft` | published only | editor | editor | editor |
| `yachts`   | published only | editor | editor | editor |

"Editor" means `editorOrAdmin` throughout: an admin can do everything an editor can. Their cells are tested in each collection's own spec.

Two fields on `yachts` are narrower than their collection: `contact` and `captain`, from the legacy `contact_id` and `captain_id`, are built by `contactRelationship()` and are admin-only at field level. So a published yacht that any anonymous visitor may read carries neither the people nor the ids that would find them.

### `contacts`

Personal data — a name, a phone number and an e-mail address — that the legacy site never rendered and the legacy admin never showed (`docs/legacy-inventory.md` section 8). Administrators only, on every operation: running the content does not require a broker's mobile number.

| Operation | Anonymous | Editor | Admin |
| --------- | --------- | ------ | ----- |
| read      | no        | no     | yes   |
| create    | no        | no     | yes   |
| update    | no        | no     | yes   |
| delete    | no        | no     | yes   |

Field-level, on the other side of the relationship: every field that points at a contact is built by `contactRelationship()` in `src/collections/Contacts.ts`, which declares `read`, `create` and `update` as `adminFieldOnly`. Collection access alone would stop Payload populating the document but still return the stored id on the parent, which is one lookup away from the person; field access removes the field outright. Yachts (issue #65) carries two such fields, from the legacy `contact_id` and `captain_id`.

The public projection is `publicContact()` in `src/lib/contacts.ts`. Its allowlist is empty, because no legacy page showed any part of a contact, and it drops `phone` and `email` even when a caller names them.

## Helpers

Rules come from `src/access` and nowhere else, so a collection cannot invent its own spelling of the same idea.

| Helper           | Grants                                                                  |
| ---------------- | ----------------------------------------------------------------------- |
| `anyone`         | Everyone, signed in or not.                                             |
| `authenticated`  | Any signed-in user, whatever their role.                                |
| `admin`          | Admins.                                                                 |
| `editorOrAdmin`  | The people who run the content.                                         |
| `adminOrSelf`    | Admins everything; anyone else narrowed to their own document.          |
| `publishedOnly`  | Editors and admins everything; the public narrowed to published docs.   |
| `adminFieldOnly` | Field-level: admins only. For fields that would widen someone's access. |

`adminOrSelf` and `publishedOnly` return a query constraint rather than `false`, which is how Payload filters a list instead of rejecting the whole request. That is what lets an editor open the users list and see one row rather than an error.

## Hardening

- **CORS and CSRF** are pinned to `NEXT_PUBLIC_SITE_URL`, so no other origin can call the API from a browser or ride a signed-in editor's cookie. Payload appends `serverURL` to the CORS list itself, so the effective set is this deployment alone.
- **`serverURL`** comes from the environment, never a hard-coded host, unlike the legacy `robots.ts` (`docs/legacy-inventory.md` section 13 item 4).
- **Login** locks an account for ten minutes after five failed attempts, so a stolen password is worth less.
- **API keys are off.** Nothing needs one yet, and an unused key is only ever a liability. Turning them on for a collection is a deliberate change with its own tests.

## Adding a collection

1. Declare all four operations explicitly, using the helpers above. The enumeration test fails otherwise.
2. Add its rows to this table.
3. Add its cells to a test, including the anonymous ones: the collection's own spec if it has one, `tests/int/access.int.spec.ts` otherwise.
4. If it holds personal data, say so here and keep read admin-only (`contacts` above; Leads, issue #68, is still to come).
