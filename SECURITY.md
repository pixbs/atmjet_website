# Security policy

- Report vulnerabilities privately through GitHub's "Report a vulnerability" form on the Security tab of this repository. Do not open public issues for security problems.
- Never commit secrets. `.env` files are ignored; every variable is documented in `.env.example` with placeholder values. Secret scanning and push protection are enabled for this repository.
- If a credential is exposed, rotate it immediately and record the rotation in the related issue; removing the value from git history is not sufficient.
- Dependencies are updated weekly by Dependabot; security updates are merged with priority.

## Personal data and retention

Two collections hold personal data. Neither is ever rendered on the public site, and both are readable and writable by administrators only (`docs/access-matrix.md`).

| Collection | What it holds                                                                                                                                  | Where it comes from                                                   | Retention                                                                                                                               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `contacts` | A name, a phone number, an e-mail address and an optional photograph of a broker, owner or captain.                                            | The legacy `contact` table, plus whatever an administrator adds.      | Kept while the yacht that references the person is listed. Delete the contact when the listing goes, rather than leaving an orphan row. |
| `leads`    | A name, a phone number, an e-mail address, the itinerary a visitor asked about, the page and campaign they arrived from, and their user agent. | The public forms, written by the server action through the Local API. | **24 months from `createdAt`**, then delete. A lead older than that has no commercial use and is only a liability.                      |

Notes on `leads` specifically:

- It is created through the Payload Local API, which does not go through access control. The REST and GraphQL APIs refuse `create` for everyone but an administrator, so the collection cannot be written by posting to `/api/leads` and cannot be read back by anyone who is not signed in as an administrator.
- The `userAgent` field exists for spam triage. It is not used for anything else and is covered by the same retention period.
- Deleting a lead deletes its delivery history with it; if a delivery failure needs to outlive the lead, record it in the logs, not here.
- There is no automatic deletion job yet. Until there is one, the retention above is a manual procedure, and whoever runs it should say so in the issue that asks for the job.
