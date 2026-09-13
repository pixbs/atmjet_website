# Architecture decision records

Decisions that shape the rewrite. Each record states the context, the decision and its consequences; superseding a decision means adding a new record, not editing history.

| ADR                                         | Decision                                                                                   |
| ------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [0001](0001-repo-reset-and-branching.md)    | Repository reset, branching, merging and CI gating                                         |
| [0002](0002-database-migration-strategy.md) | Zero-data-loss migration from the legacy database                                          |
| [0003](0003-i18n-strategy.md)               | Locales, content localisation and routing                                                  |
| [0004](0004-testing-and-ci-strategy.md)     | Tests first, tiers, coverage ratchet, visual parity                                        |
| [0005](0005-ai-agent-policy.md)             | AI agents: attribution ban, identity, enforcement                                          |
| [0006](0006-styling-and-motion.md)          | Tailwind discipline and `motion` as the animation library                                  |
| [0007](0007-rendering-strategy.md)          | SSR-first rendering and caching                                                            |
| [0008](0008-lean-conventions.md)            | Slices, squash merges, Payload's migration workflow, fixed coverage, one enforcement layer |
