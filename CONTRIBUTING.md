# Contributing

This is the process doc: how a change gets from an idea to `main`. It is canonical — `AGENTS.md` covers how to _write_ the code (the rules contract, variants, theming, testing) and points here for everything below.

One developer works on this repo, so the tracking exists to be read later, not to coordinate anyone. Do the `gh` admin as part of the change rather than leaving it as a chore.

## Before you start

```bash
npm install
npm run dev
```

The dev server is on http://localhost:5173. Node and npm are the only prerequisites; there are no environment variables or services.

**Never commit to `main`; branch first.**

## Branches

```
<type>/<issue>-<slug>
```

e.g. `feat/5-infinite`.

- **type** — the same Conventional Commits type the PR title will carry: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`. Branch type and PR-title type must agree; if you can't pick one, the branch is doing two things.
- **issue** — the bare GitHub issue number, no `#` (a `#` starts a comment in most shells). No linked issue → drop the segment: `fix/undo-after-draw`.
- **slug** — 1–5 lowercase kebab-case words. Compress the issue title, don't transcribe it.

One `/`, after the type. `main` is squash-only and the PR title becomes the commit subject, so a branch name never reaches history — it's a working label, so optimise it for scanning `git branch`. GitHub deletes the branch on merge.

## The three gates

There is no CI yet: nothing checks a PR except Vercel's build of the preview. These three are the whole bar, so run them yourself before opening a PR.

**Once per branch, not once per commit.** Reach for a single gate on its own while working if something needs checking, and run all three when the branch is ready.

```bash
npm run lint && npm run test && npm run build
```

`build` is also the type check (`tsc -b` before `vite build`), and the only gate that type-checks the test files, because Vitest strips types without checking them. A green `npm run test` says nothing about types.

## Pull requests

**The PR title is a Conventional Commit subject.**

```
<type>[(scope)][!]: <description>
```

Lowercase type from the list above, optional parenthesised scope (a variant id is the natural one: `feat(ultimate): …`), optional `!`, then a colon _and a space_, then a description. Nothing enforces this yet, so get it right by hand: squash-merge makes it the permanent subject line in `git log`.

**Put `Closes #<n>` in the PR body whenever an issue exists.** Merging then closes the issue; a PR without the link leaves it open.

**The body says what was checked and what wasn't.** A `## Checked` section lists the gates and what was tried in the browser; anything not verified is said plainly. A `## Before merging` checklist holds what only Grant can do — at minimum, test-playing the Vercel preview on a phone.

## Issues and milestones

**Milestones are the plan.** Each one (`M1 · Foundation, Classic and themes` through `M4 · Saving`) ends in a playable deploy, as laid out in the spec, issue #1. Set the milestone on every new issue that belongs to one.

**The spec is issue #1.** It holds the user stories, the rules decisions and the testing decisions for milestones 1–4. Read it before reopening a settled question.

**Labels are the ones that exist** — the triage labels in `docs/agents/triage-labels.md` plus GitHub's defaults (`bug`, `enhancement`, `documentation`, `accessibility`, …). Apply them; don't invent new ones. Propose a new label, don't just create it.

**Open an issue for work you find but shouldn't do here.** A PR that grows to cover something it wasn't opened for is harder to review and impossible to revert cleanly. File it, reference it in the PR description, move on.

## Docs are part of the change, not a follow-up

Keeping the docs true is part of the work:

- A PR that settles or sharpens a domain term updates `CONTEXT.md` (created by `/domain-modeling` the first time one is needed).
- A PR that makes a design decision worth defending later records it as an ADR in `docs/adr/`.
- A PR that changes how a module works updates the comment at its top. The header comments in `src/game/rules.ts`, `session.ts` and `src/variants/registry.ts` are the architecture docs; a stale one misleads more than a missing one.

## What happens on merge

`main` is squash-only, and **merging deploys.** Vercel builds `main` to production; every other branch gets a preview link. So the preview is the last check: test-play it on a phone before merging, because nothing stands between the merge and the live app.

When saving lands (#7), a change to a variant's `State` or `Move` shape can break games already saved on players' devices. Check that before merging such a change.
