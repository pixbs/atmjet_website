# Security policy

- Report vulnerabilities privately through GitHub's "Report a vulnerability" form on the Security tab of this repository. Do not open public issues for security problems.
- Never commit secrets. `.env` files are ignored; every variable is documented in `.env.example` with placeholder values. Secret scanning and push protection are enabled for this repository.
- If a credential is exposed, rotate it immediately and record the rotation in the related issue; removing the value from git history is not sufficient.
- Dependencies are updated weekly by Dependabot; security updates are merged with priority.
