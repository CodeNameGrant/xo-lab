# AGENTS.md

XO Lab: a mobile-first hub for tic-tac-toe variants (Classic, Infinite, Ultimate), two players on one device. Vite + React 19 + TypeScript, deployed on Vercel. The spec is GitHub issue #1. The project docs are numbered files in `docs/`, listed in `README.md`: every decision is in `docs/01-decisions.md`, and the game screen's layout and colours are in `docs/02-game-screen.md`.

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
- **`src/game/session.ts` — a game is the first player plus the move list. Current state is never stored**; it is rebuilt by replaying the moves. The move list is what saving (#7) will persist. There is no undo (removed in #4); don't add one back without changing the spec. Don't cache or store a derived state alongside the moves.
- **`src/variants/<id>/` — one self-contained folder per variant**: `info.ts` (`VariantInfo`), `rules.ts`, a board component, `rules.test.ts`. Variants never import from each other; what two share goes in `src/game/` (logic, e.g. `lines.ts`) or `src/boards/` (UI, e.g. `GridBoard`).
- **`src/variants/registry.ts` — adding a variant is its folder plus one entry here.** The hub, `/play/<id>`, the game screen and the contract suite all read this list. Rules and board load through dynamic `import()` so each variant is its own chunk; `info.ts` is imported eagerly, so **`info.ts` must not import the variant's rules or board** — that would pull them into the hub's bundle.
- **A board component receives `BoardProps` — `state`, `rules`, `onMove` — and nothing else.** It draws the state and reports moves; it never decides legality or the outcome itself, only asks `rules`. The shared shell (`src/screens/GameScreen.tsx`) owns the player cards (whose turn, then who won or a draw), the bottom bar (New game, which becomes Play again in the winner's colour when the game ends) and the screen-reader status.
- **Every variant uses the same game screen; only its board differs** (decision D-25). Top bar, player cards, board, bottom bar, in that order, with the sizes, colours and words in `docs/02-game-screen.md`. A variant never restyles the shared parts. Anything it does differently lives in its board and is recorded in that doc's per-variant table; changing a shared part for one variant means changing the doc first.
- **`any` lives only in `src/variants/types.ts` and the registry**, where variants with different types sit side by side. Every variant's own module is fully typed.
- **Imports carry their extension** (`'./rules.ts'`, `'./Board.tsx'`), and type-only imports use `import type` (`verbatimModuleSyntax`). `erasableSyntaxOnly` is on: no `enum`, `namespace` or constructor parameter properties.
- The page title is set with React 19's `<title>` element inside the screen, not `document.title`.

# Theme

**Styling is Tailwind v4 utility classes, written on the element in the component.** There are no per-component stylesheets and no custom class names: a component's look is read from its JSX. `src/index.css` holds only page-wide base rules (body, links, the button cursor, the focus outline) and must never name a component. Don't use `@apply` to rebuild a component class there.

- **Every colour, font, radius and shadow is a token in the `@theme` block of `src/theme/tokens.css`**, which turns each into classes (`--color-surface` → `bg-surface`, `text-surface`, `border-surface`; `--radius-card` → `rounded-card`). Tailwind's default palette is switched off, so `bg-blue-500` doesn't exist. Never an arbitrary colour (`bg-[#fff]`) or a `var(--…)` in a component: a new colour is a new token.
- **The theme is `<html data-theme="light|dark">`**, set by `src/theme/theme.ts` (and an inline script in `index.html` before first paint). Dark is a second set of values for the same variables, in the `:root[data-theme='dark']` block of `tokens.css` — a colour difference between the themes is never a component change. Only where the themes differ in shape (the dark board's separate tiles, glows, uppercase type) does a component carry `dark:` or `light:` classes; both variants follow `data-theme`, so they obey the theme toggle.
- **A token name must not collide with a Tailwind utility.** `--color-x` would make `border-x` also set the left and right border widths; the players' colours are `--color-player-x` and `--color-player-o` for that reason.
- **A class list used by two or more files is a named constant in `src/ui/classes.ts`** (`iconButton`). One used twice in the same file is a constant at the top of that file. Otherwise it stays inline.
- Spacing and sizes use Tailwind's scale (`p-2.5`, `size-11` = 44 px). A value off the scale that matches the artboard is an arbitrary value (`text-[17px]`, `w-[min(342px,100%)]`).
- State-based styling uses variants on the attribute that already carries the meaning: `data-win:`, `disabled:`, `aria-disabled:`, `backdrop:`, `nth-*:`.
- `prettier-plugin-tailwindcss` sorts every class list, so `npm run format` settles class order; never sort by hand.

Light is theme A "Clean minimal", dark is theme B "Neon arcade". The current values are in `docs/02-game-screen.md` → Colours, which supersedes the spec's Theme section where they differ (the light O is `#B12B35`, not the spec's `#E0611A`: decision D-23).

# Icons

**Every icon is a Lucide icon, drawn as `<Icon name="…">` from `src/ui/icon.tsx`**, which imports `lucide-react` for every icon but the game pieces below. Never a hand-drawn inline `<svg>`, an SVG file, or a text character (`✕`, `←`, `+`) standing in for an icon. A new glyph is a semantic name (`newGame`, not `rotate-cw`) added to its `GLYPHS` map. Size it with the numeric `size` prop — a CSS width or height scales the stroke with it — and keep `className` for colour and layout. Icons take `currentColor` and are always decorative: the button or link carries the label (`aria-label` or visible text).

**The game pieces (X, O and Player 3's star) are the one exception: `<Mark player="X">` from `src/ui/Mark.tsx`**, the only other file that imports `lucide-react` and the only icons exported from anywhere but `icon.tsx`. They are pieces, not controls: each takes its player's colour and a stroke weight that varies with where it is shown. They are `X` and `CircleSmall`, a pair picked so both fill the same 12-unit box, and `Star`, drawn at 60 % with a matching stroke to fill that box too (D-36); keep them matched. A piece is always a `<Mark>`, never a letter.

# Accessibility

- **Every square is a real `<button>`** labelled with its position and contents (`Row 2, column 3, X`; Ultimate adds the small board). An unplayable square is `aria-disabled`, not `disabled`, so it stays reachable for screen readers; its click handler does nothing.
- **The screen-reader status is always on the page**: a visually hidden `aria-live="polite"` line that states the game in words (whose turn, who won, or a draw). It must exist before its text changes, so never render it conditionally — a live region inserted together with its text is usually not announced. There is no visible status text: on screen, the player cards carry the turn and the result.
- **Every tap target is at least 44 px**, with one exception: Ultimate's 81 squares, about 38 px on a 390 px phone, where the board reaches past the column's side padding to 6 px from the screen edge (decision D-31). Never shrink them further, and never shrink anything else below 44 px.
- Animation respects `prefers-reduced-motion` (#4).

# Words

Players are **Player 1 (X)**, **Player 2 (O)** and, in a three-player variant, **Player 3 (★, `S` in code)** — never "you", "red", or a typed name. A **variant** is one game (Classic, Infinite, Ultimate, Shift), with a fixed number of players (`VariantInfo.players`); its **id** is its URL slug. The buttons are **New game** (called **Play again** once a game is over) and **How to play**. Use the spec's terms in code, UI copy, issues and tests; once `CONTEXT.md` exists it is the glossary.

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

Single-context: one `CONTEXT.md` at the repo root (created lazily by `/domain-modeling`), and every decision in `docs/01-decisions.md`, not an ADR folder. See `docs/agents/domain.md`.
