# AGENTS.md

XO Lab: a mobile-first hub for tic-tac-toe variants (Classic, Infinite, Ultimate), two players on one device. Vite + React 19 + TypeScript, deployed on Vercel. The spec is GitHub issue #1.

# Commands

- `npm run dev` (port 5173), `npm run test`, `npm run test:watch`, `npm run lint` (oxlint), `npm run format` / `format:check` (Prettier), `npm run build`.
- **Run `npm run format` after editing**, so the diff carries no style noise; never hand-format against `.prettierrc.json`.
- **Run the four gates once, when the branch is ready for a PR — not before each commit.** The list is in `CONTRIBUTING.md` → The four gates. There is no `typecheck` script: `build` runs `tsc -b`, and it is the only gate that type-checks the test files.

# Process

**Never commit, and never push, unless you are asked to in that message.** Finish the work, run the gates, and stop with the change in the working tree — the diff is what gets reviewed, and a commit made before that review is a commit whose contents nobody chose. "You have permission to edit these files" is not permission to commit them, an approval to commit one change does not carry to the next, and neither does having been asked to commit earlier in the same session. This applies to `git commit`, `git push`, opening a PR, and anything that writes to a branch on the user's behalf. Branching is fine unasked; recording history is not.

Before opening a PR, read **`CONTRIBUTING.md`**: branch names, PR titles, the gates, issues, milestones and labels. Two of its rules bite mid-change: never commit to `main`, and a PR body carries `Closes #<n>` whenever an issue exists. Merging to `main` deploys to production.

**Grant is new to this stack.** When a change introduces a piece of it Grant hasn't seen (a React API, a Vite or Vitest feature, a TypeScript pattern), explain it briefly in the reply.

# Architecture

- **`src/game/rules.ts` — the `VariantRules` contract is the one seam the app is built around.** Every variant implements it for its own `State` and `Move`. Rules are pure TypeScript: no React, no browser APIs, no hidden state, no clock, no randomness. `applyMove` never modifies its input and throws `IllegalMoveError` for an illegal move. States and moves are plain JSON-serialisable data. A future computer opponent drives variants through this interface, so nothing variant-specific belongs outside it.
- **`selectors` are for the variant's own board only.** Shared code (the game screen, the session, the contract suite) never calls them; anything it needs belongs on the contract itself.
- **`src/game/session.ts` — a game is the first player plus the move list. Current state is never stored**; it is rebuilt by replaying the moves. That is what makes undo exact (including Infinite's removed marks) and what saving (#7) will persist. Don't cache or store a derived state alongside the moves.
- **`src/variants/<id>/` — one self-contained folder per variant**: `info.ts` (`VariantInfo`), `rules.ts`, a board component, `rules.test.ts`. Variants never import from each other; what two share goes in `src/game/` (logic, e.g. `lines.ts`) or `src/boards/` (UI, e.g. `GridBoard`).
- **`src/variants/registry.ts` — adding a variant is its folder plus one entry here.** The hub, `/play/<id>`, the game screen and the contract suite all read this list. Rules and board load through dynamic `import()` so each variant is its own chunk; `info.ts` is imported eagerly, so **`info.ts` must not import the variant's rules or board** — that would pull them into the hub's bundle.
- **A board component receives `BoardProps` — `state`, `rules`, `onMove` — and nothing else.** It draws the state and reports moves; it never decides legality or the outcome itself, only asks `rules`. The shared shell (`src/screens/GameScreen.tsx`) owns the player cards, status line, Undo and New game.
- **`any` lives only in `src/variants/types.ts` and the registry**, where variants with different types sit side by side. Every variant's own module is fully typed.
- **Imports carry their extension** (`'./rules.ts'`, `'./Board.tsx'`), and type-only imports use `import type` (`verbatimModuleSyntax`). `erasableSyntaxOnly` is on: no `enum`, `namespace` or constructor parameter properties.
- The page title is set with React 19's `<title>` element inside the screen, not `document.title`.

# Theme

**Styling is Tailwind v4 utility classes, written on the element in the component.** There are no per-component stylesheets and no custom class names: a component's look is read from its JSX. `src/index.css` holds only page-wide base rules (body, links, the button cursor, the focus outline) and must never name a component. Don't use `@apply` to rebuild a component class there.

- **Every colour, font, radius and shadow is a token in the `@theme` block of `src/theme/tokens.css`**, which turns each into classes (`--color-surface` → `bg-surface`, `text-surface`, `border-surface`; `--radius-card` → `rounded-card`). Tailwind's default palette is switched off, so `bg-blue-500` doesn't exist. Never an arbitrary colour (`bg-[#fff]`) or a `var(--…)` in a component: a new colour is a new token.
- The dark theme (#4) is a second set of values for the same `--color-*` variables, not a change to any component.
- **A class list used by two or more files is a named constant in `src/ui/classes.ts`** (`iconButton`). One used twice in the same file is a constant at the top of that file (`actionButton` in `GameScreen.tsx`). Otherwise it stays inline.
- Spacing and sizes use Tailwind's scale (`p-2.5`, `size-11` = 44 px). A value off the scale that matches the artboard is an arbitrary value (`text-[17px]`, `w-[min(342px,100%)]`).
- State-based styling uses variants on the attribute that already carries the meaning: `data-win:`, `disabled:`, `aria-disabled:`, `backdrop:`, `nth-*:`.
- `prettier-plugin-tailwindcss` sorts every class list, so `npm run format` settles class order; never sort by hand.

Light is theme A "Clean minimal", dark is theme B "Neon arcade"; the values are in the spec (#1) → Theme.

# Icons

**Every icon is a Lucide icon, drawn as `<Icon name="…">` from `src/ui/icon.tsx`**, which imports `lucide-react` for every icon but the game pieces below. Never a hand-drawn inline `<svg>`, an SVG file, or a text character (`✕`, `←`, `+`) standing in for an icon. A new glyph is a semantic name (`newGame`, not `rotate-cw`) added to its `GLYPHS` map. Size it with the numeric `size` prop — a CSS width or height scales the stroke with it — and keep `className` for colour and layout. Icons take `currentColor` and are always decorative: the button or link carries the label (`aria-label` or visible text).

**The X and O game pieces are the one exception: `<Mark player="X">` from `src/ui/Mark.tsx`**, the only other file that imports `lucide-react` and the only icons exported from anywhere but `icon.tsx`. They are pieces, not controls: each takes its player's colour and a stroke weight that varies with where it is shown. They are `X` and `CircleSmall`, a pair picked so both fill the same 12-unit box; keep them a matched pair. A piece is always a `<Mark>`, never a letter.

# Accessibility

- **Every square is a real `<button>`** labelled with its position and contents (`Row 2, column 3, X`; Ultimate adds the small board). An unplayable square is `aria-disabled`, not `disabled`, so it stays reachable for screen readers; its click handler does nothing.
- The status line is `aria-live="polite"`, and states the game in words: whose turn, who won, or a draw.
- **Every tap target is at least 44 px.** On Ultimate's 81-square board that is the hard constraint on layout.
- Animation respects `prefers-reduced-motion` (#4).

# Words

Players are **Player 1 (X)** and **Player 2 (O)** — never "you", "red", or a typed name. A **variant** is one game (Classic, Infinite, Ultimate); its **id** is its URL slug. The buttons are **Undo**, **New game** and **How to play**. Use the spec's terms in code, UI copy, issues and tests; once `CONTEXT.md` exists it is the glossary.

# Testing

Vitest with jsdom and Testing Library. Tests sit beside the module they cover and import `describe`/`it`/`expect` from `vitest` — there are no globals.

- **`src/game/contract.test.ts` runs for every registered variant.** A new variant is covered by registering it; it never needs a copy of those tests. A property every variant should have goes there, not in one variant's file.
- **Each variant's `rules.test.ts` holds its scenario tests, written as move sequences** that read as rules examples ("X takes 0, 1, 2 and wins"). The scenarios each variant needs are listed in the spec (#1) → Testing Decisions.
- **Tests go through the contract and the session**, comparing whole states and outcomes as data. They never reach into a variant's state layout beyond what its selectors expose.
- **Expected values come from the rules, written out** — the eight winning lines listed, not generated by the same loop the code uses.
- **Randomness is seeded** (`seededRandom` in the contract suite), so a failing random game replays exactly.
- **Components and styling are not unit-tested.** `src/AppRoutes.test.tsx` is the one exception, a smoke test that routing and lazy loading work. Everything visual is checked by test-playing the Vercel preview on a phone and on desktop; say in the PR what was and wasn't checked.

# Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for `CodeNameGrant/xo-lab`, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The default label vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root, both created lazily by `/domain-modeling`. See `docs/agents/domain.md`.
