## Summary

<!-- What changes and why, in a few sentences. Link the legacy reference (docs/legacy-inventory.md anchor) for ported UI. -->

Closes #<!-- issue number --> <!-- or: Part of #<epic> (layer N of a stack, base: <lower-branch>) -->

## Checklist

- [ ] Branch name `<type>/<issue>-<kebab-slug>`; commits are Conventional Commits, each one a verified step
- [ ] No AI attribution anywhere in this pull request (title, body, commits, code)
- [ ] SSR-first: initial content is server-rendered; `'use client'` only for leaf interactivity
- [ ] Tailwind: tokens only (no arbitrary values), `cva`/`cn`, no `@apply` outside the parity base layer
- [ ] Animation only with `motion` (`src/lib/motion.ts` vocabulary)
- [ ] Tests added for this change: unit / integration / e2e / visual / a11y (delete what does not apply); coverage thresholds unchanged or raised
- [ ] Ported UI matches the legacy baseline (visual test) and behaviour changes are limited to `fix-while-porting` bugs
- [ ] Payload config changes include a migration, regenerated types and import map
- [ ] Docs updated (`docs/`, `.env.example`, ADR if a decision changed)
