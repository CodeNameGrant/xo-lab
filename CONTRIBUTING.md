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

## The four gates

CI doesn't run these yet: a PR is checked only for its title (`pr-title.yml`) and by Vercel's build of the preview. These four are the whole bar, so run them yourself before opening a PR.

**Once per branch, not once per commit.** Reach for a single gate on its own while working if something needs checking, and run all four when the branch is ready.

```bash
npm run lint && npm run format:check && npm run test && npm run build
```

`format:check` fails on anything Prettier would change; `npm run format` rewrites the files. Style is Prettier's alone (`.prettierrc.json`) — oxlint checks correctness, not layout, so the two never disagree. Line endings are LF on every OS (`.gitattributes`); a Windows clone made before that file existed needs `git rm --cached -r . && git reset --hard` once to re-check out with LF.

`build` is also the type check (`tsc -b` before `vite build`), and the only gate that type-checks the test files, because Vitest strips types without checking them. A green `npm run test` says nothing about types.

## Pull requests

**The PR title is a Conventional Commit subject.**

```
<type>[(scope)][!]: <description>
```

Lowercase type from the list above, optional parenthesised scope (a variant id is the natural one: `feat(ultimate): …`), optional `!`, then a colon _and a space_, then a description. `.github/workflows/pr-title.yml` enforces the grammar, and only the grammar: the title still has to describe the change, because squash-merge makes it the permanent subject line in `git log`. A rejected title can be fixed in the GitHub UI; editing it re-runs the check without a push.

**Put `Closes #<n>` in the PR body whenever an issue exists.** Merging then closes the issue; a PR without the link leaves it open.

**The body says what was checked and what wasn't.** A `## Checked` section lists the gates and what was tried in the browser; anything not verified is said plainly. A `## Before merging` checklist holds what only Grant can do — at minimum, test-playing the Vercel preview on a phone.

## Issues and milestones

**Milestones group work that ends in a playable deploy.** The spec's four are closed: M1 to M3 shipped, and M4 · Saving was dropped (decision D-41). When a new milestone is opened, set it on every issue that belongs to it.

**The spec is issue #1**, now closed. It still holds the original user stories, rules decisions and testing decisions; read it, and `docs/01-decisions.md` for what changed since, before reopening a settled question.

**Labels are the ones that exist** — the triage labels in `docs/agents/triage-labels.md` plus GitHub's defaults (`bug`, `enhancement`, `documentation`, `accessibility`, …). Apply them; don't invent new ones. Propose a new label, don't just create it.

**Open an issue for work you find but shouldn't do here.** A PR that grows to cover something it wasn't opened for is harder to review and impossible to revert cleanly. File it, reference it in the PR description, move on.

## Docs are part of the change, not a follow-up

Keeping the docs true is part of the work:

- A PR that settles or sharpens a domain term updates `CONTEXT.md` (created by `/domain-modeling` the first time one is needed).
- A PR that makes a decision worth defending later adds a dated entry to `docs/01-decisions.md` (instructions at the top of that file). A decision that replaces an earlier one marks the old entry superseded rather than rewriting it.
- A PR that changes the game screen's layout, sizes or colours, or builds a variant's board, updates `docs/02-game-screen.md` (its per-variant table for a board).
- A new doc goes in `docs/` with the next number (`03-…`), never a reused one, and gets a line in the README's Docs table.
- A PR that changes how a module works updates the comment at its top. The header comments in `src/game/rules.ts`, `session.ts` and `src/variants/registry.ts` are the architecture docs; a stale one misleads more than a missing one.

## What happens on merge

`main` is squash-only, and **merging deploys.** Vercel builds `main` to production; every other branch gets a preview link. So the preview is the last check: test-play it on a phone before merging, because nothing stands between the merge and the live app.
