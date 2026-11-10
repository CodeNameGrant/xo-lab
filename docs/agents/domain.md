# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repo root: the glossary.
- **`docs/01-decisions.md`**: every decision made so far, numbered `D-01`, `D-02`, … with dates and statuses. Read the entries that touch the area you're about to work in, and skip the ones marked `Superseded`.

If `CONTEXT.md` doesn't exist yet, **proceed silently**. Don't flag its absence; don't suggest creating it upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates it lazily when terms actually get resolved.

## File structure

This repo is single-context, and keeps its decisions in one file instead of an ADR folder:

```
/
├── CONTEXT.md                ← glossary, created when first needed
├── docs/01-decisions.md      ← every decision, dated, in order
├── docs/02-game-screen.md    ← the screen every variant shares
└── src/
```

## Recording a decision

When a skill would write an ADR (`docs/adr/NNNN-*.md`), add an entry to `docs/01-decisions.md` instead, following the instructions at the top of that file: the next `D-nn` number, the date, a status, the decision, why, and what else was considered. Never create `docs/adr/`. When a decision replaces an earlier one, add the new entry and mark the old one `Superseded by D-nn`; don't rewrite or delete it.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal: either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag decision conflicts

If your output contradicts an accepted decision, surface it explicitly rather than silently overriding:

> _Contradicts D-06 (a game is the first player plus the move list), but worth reopening because…_
