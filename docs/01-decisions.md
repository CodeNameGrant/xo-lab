# Decisions

Every decision about XO Lab that is worth defending later, in the order it was made. The spec is issue #1; this file records what was decided on top of it, and where it changed.

**Adding one.** Give it the next number, today's date and a status, then say what was decided, why, and what else was considered. Never delete or rewrite an old entry: when a decision changes, add a new one and mark the old one `Superseded by D-nn`, so the history stays readable. Refer to entries by number (`D-07`) in PRs, issues and code comments.

**Statuses.** `Accepted` is in force. `Superseded by D-nn` was replaced and is kept for the record.

## Index

| #    | Date       | Decision                                                   | Status                                |
| ---- | ---------- | ---------------------------------------------------------- | ------------------------------------- |
| D-01 | 2026-11-09 | Track work in GitHub Issues with the default triage labels | Accepted                              |
| D-02 | 2026-11-09 | Split the spec into six tickets across four milestones     | Accepted                              |
| D-03 | 2026-11-09 | Vite, React, TypeScript and React Router on Vercel         | Accepted                              |
| D-04 | 2026-11-09 | Pin Vite as the framework in `vercel.json`                 | Accepted                              |
| D-05 | 2026-11-09 | One rules contract for every variant                       | Accepted                              |
| D-06 | 2026-11-09 | A game is the first player plus the move list              | Accepted                              |
| D-07 | 2026-11-09 | A registry of variants, each loaded only when opened       | Accepted                              |
| D-08 | 2026-11-09 | One contract test suite runs for every variant             | Accepted                              |
| D-09 | 2026-11-09 | Player 1 is X; the first move alternates per new game      | Accepted                              |
| D-10 | 2026-11-09 | Undo in memory now, saved across reloads in M4             | Superseded by D-21                    |
| D-11 | 2026-11-09 | A status line under the board                              | Superseded by D-22                    |
| D-12 | 2026-11-09 | Light theme A · Clean minimal from the design canvas       | Accepted, O colour superseded by D-23 |
| D-13 | 2026-11-10 | Tailwind v4 utilities and an app-only token palette        | Accepted                              |
| D-14 | 2026-11-10 | Lucide icons, with X and O as matched game pieces          | Accepted                              |
| D-15 | 2026-11-10 | Prettier, four gates, squash-only `main`                   | Accepted                              |
| D-16 | 2026-11-10 | Agents never commit or push unless asked                   | Accepted                              |
| D-17 | 2026-11-10 | The theme lives on `<html data-theme>`                     | Accepted                              |
| D-18 | 2026-11-10 | Dark theme B · Neon arcade, with `dark:`/`light:` variants | Accepted                              |
| D-19 | 2026-11-10 | Player colour tokens are `player-x` and `player-o`         | Accepted                              |
| D-20 | 2026-11-10 | Motion only when the device allows it                      | Accepted                              |
| D-21 | 2026-11-10 | No undo                                                    | Accepted                              |
| D-22 | 2026-11-10 | The player cards show the turn and the result              | Accepted                              |
| D-23 | 2026-11-10 | An off-red O in the light theme                            | Accepted                              |
| D-24 | 2026-11-10 | Winning squares take the winner's tint in light            | Accepted                              |
| D-25 | 2026-11-10 | One game screen for every variant; only the board varies   | Accepted                              |
| D-26 | 2026-11-10 | Docs are numbered files under `docs/`                      | Accepted                              |

---

## 2026-11-09

### D-01 · Track work in GitHub Issues with the default triage labels

**Status:** Accepted

**Decision.** Issues live in GitHub Issues for `CodeNameGrant/xo-lab`, worked with the `gh` CLI. The triage labels are the five defaults: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. Domain docs are single-context: one `CONTEXT.md` at the root, created when the first term needs settling.

**Why.** The repo is on GitHub and one developer works on it; nothing calls for another tracker or custom labels.

**Considered.** Local markdown issues under `.scratch/`: no remote needed, but no preview links, sub-issues or blocking links.

### D-02 · Split the spec into six tickets across four milestones

**Status:** Accepted

**Decision.** The spec (#1) became six tickets, each ending in a deploy Grant can play: #2 skeleton, #3 Classic, #4 dark theme (together M1), #5 Infinite (M2), #6 Ultimate (M3), #7 saving (M4). Each is a sub-issue of #1 with GitHub's native "blocked by" links. Every ticket after #2 depends only on what it really needs, so #5, #6 and #7 all wait on Classic (#3) alone.

**Why.** A single issue for four milestones was too heavy to work from. Each ticket carries its own design values (token tables, layout sizes) because the design canvas is private to Grant's account.

**Considered.** One ticket per milestone: M1 would have been skeleton, Classic and both themes in one change.

### D-03 · Vite, React, TypeScript and React Router on Vercel

**Status:** Accepted

**Decision.** A single-page app built with Vite, React 19 and TypeScript, routed by React Router, tested with Vitest. Vercel deploys `main` to production and every branch to a preview link. `vercel.json` rewrites every address to the app, so `/play/<id>` works on a direct visit or refresh.

**Why.** The spec's stack. Preview links per branch let each milestone be test-played on a phone before merging.

### D-04 · Pin Vite as the framework in `vercel.json`

**Status:** Accepted

**Decision.** `vercel.json` names the framework (`vite`), the build command and the `dist` output folder instead of relying on Vercel's detection.

**Why.** The Vercel project was linked while the repo was still empty, so it detected nothing and the first preview deploy failed. Naming them made the next deploy pass and is correct regardless.

### D-05 · One rules contract for every variant

**Status:** Accepted

**Decision.** Every variant implements `VariantRules` (`src/game/rules.ts`): initial state, whose turn, legal moves, apply a move, outcome, plus selectors only its own board uses. Rules are pure TypeScript with no React, browser APIs, clock or randomness; states and moves are plain JSON data; an illegal move throws `IllegalMoveError`.

**Why.** It is the one seam the app is built around: the game screen, the tests and a future computer opponent all drive any variant through it, and pure rules are easy to test.

### D-06 · A game is the first player plus the move list

**Status:** Accepted

**Decision.** The game session (`src/game/session.ts`) stores only who started and the moves played. The current state is never stored; it is rebuilt by replaying the moves through the rules.

**Why.** Saves (#7) stay tiny and can be checked by replaying them, so a corrupt or outdated save is caught by the rules rather than trusted.

**Considered.** Storing state snapshots: bigger saves, and nothing checks them.

### D-07 · A registry of variants, each loaded only when opened

**Status:** Accepted

**Decision.** `src/variants/registry.ts` lists every variant. The hub, the `/play/<id>` routes, the game screen and the contract tests all read it. A variant's info (name, description, How to play, preview) loads with the hub; its rules and board load through `import()` only when it is opened, each as its own download. An unknown `/play/<id>` redirects to the hub.

**Why.** Adding a variant is one folder and one registry entry, and the hub stays small however many variants there are.

### D-08 · One contract test suite runs for every variant

**Status:** Accepted

**Decision.** `src/game/contract.test.ts` runs the contract's promises over every registered variant, using seeded random games so a failure replays exactly. Each variant adds scenario tests written as move sequences. Components and styling are not unit-tested; they are checked by playing the Vercel preview.

**Why.** A new variant is covered by registering it, and can't break the shared screen without a test failing.

### D-09 · Player 1 is X; the first move alternates per new game

**Status:** Accepted

**Decision.** Player 1 always plays X and Player 2 always plays O. The first game of a variant starts with Player 1, and each new game hands the first move to the other player. The player card shows who moved first.

**Why.** Neither player keeps the first-move advantage on a shared device.

### D-10 · Undo in memory now, saved across reloads in M4

**Status:** Superseded by D-21

**Decision.** Undo takes back the last move, repeatedly, including after the game ends; disabled when there's nothing to undo. Milestone 1 keeps undo history in memory; milestone 4 makes it survive reloads.

### D-11 · A status line under the board

**Status:** Superseded by D-22

**Decision.** A line under the board states the game in words: "Player 1 to move", "Player 2 wins!", "It's a draw". It is `aria-live`, so screen readers announce it.

### D-12 · Light theme A · Clean minimal from the design canvas

**Status:** Accepted (its O colour is superseded by D-23)

**Decision.** The light theme is artboard A of the "Tic-tac-toe hub — theme options" canvas: Inter, `#F7F7F5` page, white surfaces, `#16181D` text, `#5B606B` secondary text, X `#2457D6`, O `#E0611A`, winning squares `#EAF0FD`. Every value is a design token.

**Why.** Grant picked A for light and B for dark from the four options on the canvas. Tokens from the start meant the dark theme could be a second set of values instead of a restyle.

---

## 2026-11-10

### D-13 · Tailwind v4 utilities and an app-only token palette

**Status:** Accepted

**Decision.** Styling is Tailwind v4 utility classes on each element; there are no component stylesheets. Every colour, font, radius, shadow and animation is a token in the `@theme` block of `src/theme/tokens.css`, and Tailwind's own palette is switched off, so only app tokens exist. Class lists shared by two files live in `src/ui/classes.ts`.

**Why.** A component's look can be read from its JSX, and nobody can reach for a colour outside the design.

**Considered.** Keeping one CSS file per component (the #3 approach).

### D-14 · Lucide icons, with X and O as matched game pieces

**Status:** Accepted

**Decision.** Every icon is a Lucide icon drawn through `<Icon name="…">` (`src/ui/icon.tsx`), named for its job (`newGame`, not `rotate-cw`). The X and O pieces are the one exception: `<Mark>` in `src/ui/Mark.tsx`, using Lucide's `X` and `CircleSmall`, a pair that fills the same 12-unit box.

**Why.** One consistent icon set instead of hand-drawn SVGs, and X and O at visibly equal size. Plain `Circle` would dwarf the X.

### D-15 · Prettier, four gates, squash-only `main`

**Status:** Accepted

**Decision.** Prettier owns formatting, with Tailwind class sorting. Before a PR, run the four gates: `lint`, `format:check`, `test` and `build` (the only gate that type-checks tests). Branches are `<type>/<issue>-<slug>`; PR titles are Conventional Commits; `main` is squash-only and merging deploys. Details are in `CONTRIBUTING.md`.

**Why.** One developer, so the process exists to be read later: the PR title becomes the permanent history line, and the gates are the whole bar until CI runs them.

### D-16 · Agents never commit or push unless asked

**Status:** Accepted

**Decision.** An agent finishes the work, runs the gates and leaves the change in the working tree. It commits, pushes or opens a PR only when asked in that message; an earlier approval doesn't carry over.

**Why.** The diff is what gets reviewed. A commit made before that review records contents nobody chose.

### D-17 · The theme lives on `<html data-theme>`

**Status:** Accepted

**Decision.** The theme is `data-theme="light"` or `"dark"` on the page. With no saved choice it follows the device's setting, including when that setting changes. A sun/moon toggle, on the hub and in the game screen's top bar right of How to play, saves a choice on the device; if storage is blocked, the choice lasts until the page closes. A short inline script in `index.html` sets the attribute before the page first draws; `src/theme/theme.ts` keeps it in step after that.

**Why.** Dark mode never flashes light on load, and one attribute drives every theme difference, so the toggle overrides the device setting everywhere.

**Considered.** Following `prefers-color-scheme` in CSS alone: no flash for most players, but a saved choice against the device setting would have flashed, and every dark rule would have needed writing twice.

### D-18 · Dark theme B · Neon arcade, with `dark:`/`light:` variants

**Status:** Accepted

**Decision.** Dark is artboard B: Space Grotesk, `#0B1020` page, `#141B33` surfaces, X `#3DE0FF` and O `#FF4FB0` with neon glows. Colour differences are a second set of token values under `:root[data-theme='dark']`, never a component change. Where the themes differ in shape (nine separate tiles instead of one panel, glows, uppercase type, bordered icon buttons), components use custom `dark:` and `light:` variants that follow `data-theme`. In dark, the top bar's icons are sized to 22 px with CSS, which scales the stroke exactly as the artboard does; elsewhere icons are sized with the `size` prop.

**Why.** Grant picked B for dark. Keeping colours in tokens and shape in variants means neither theme needs its own components.

### D-19 · Player colour tokens are `player-x` and `player-o`

**Status:** Accepted

**Decision.** The players' colours are `--color-player-x` and `--color-player-o`. No token may share a name with a Tailwind utility.

**Why.** `--color-x` made `border-x` also run Tailwind's own `border-x` utility, which set the left and right border widths to 1 px, so Player 1's active card had thinner side borders than Player 2's in both themes.

### D-20 · Motion only when the device allows it

**Status:** Accepted

**Decision.** A piece pops in when placed; winning squares and player-card changes fade. Every animation and transition is written `motion-safe:`, so a device set to reduce motion gets none.

**Why.** The spec asks for a responsive feel and for respecting reduced motion.

### D-21 · No undo

**Status:** Accepted (supersedes D-10)

**Decision.** There is no undo: no button, no undo in the game session, no undo tests. Stories 19–22, 28 and 37 of the spec are struck through, and #5 and #7 no longer mention undo. Saving (#7) still stores the move list (D-06).

**Why.** Grant's call before merging #4. No reason was recorded; add one here if it matters later.

**Considered.** Hiding the button but keeping the session code, so it could come back easily; Grant chose to remove it entirely.

### D-22 · The player cards show the turn and the result

**Status:** Accepted (supersedes D-11)

**Decision.**

- During play, the current player's card has a border in their colour (and a glow in dark). There is no visible status text.
- When the game ends, the winner's card is tinted in their colour and says "Wins!", and the other card fades. A draw turns both cards grey with "Draw".
- The bottom bar is a quiet outlined New game during play and becomes **Play again** in the winner's colour once the game is over (the usual primary colour after a draw).
- A visually hidden `aria-live` line is always on the page and announces every turn and the result. It must never be added conditionally: a live region inserted together with its text is usually not announced.

**Why.** The visible status line left dead space between the board and the button, and the highlighted cards already showed whose turn it was. Putting the result on the cards keeps the board uncovered and stops the board moving when the game ends.

**Considered.** Three options were mocked up side by side ([turn and result options](https://claude.ai/artifact/TLBEKsJLg85snrCsAAZxpN)):

- **A, a result panel over the board** with New game inside: the clearest game-over moment, but it covers the winning line.
- **B, the player cards** (chosen, with C's bar).
- **C, the result line in the bottom bar** above Play again: tried first with B, then the visible result line was dropped because Grant didn't want text between the board and the button.

### D-23 · An off-red O in the light theme

**Status:** Accepted (supersedes D-12's O colour)

**Decision.** In light, O is `#B12B35`: the X blue's OKLCH lightness (0.505) at a red hue (22) with a little less chroma (0.17 against the blue's 0.20). The winner's tint for O is `#FEEBEA`, at the same lightness and chroma as the blue tint. Play again uses white text for both players. Dark keeps its magenta.

**Why.** Grant didn't like the burnt orange. Matching the blue's perceived lightness keeps either piece from outweighing the other, and lower chroma keeps the red soft. It also fixed contrast: the orange was 3.3:1 on the page and needed dark button text; the red is 6.0:1 on the page and 6.4:1 with white.

### D-24 · Winning squares take the winner's tint in light

**Status:** Accepted

**Decision.** In light, winning squares are tinted with the winner's tint (`tint-x` or `tint-o`), the same tint as their player card. Dark keeps one shared highlight (`#1E2A52`) with a border in the winner's colour.

**Why.** With a red O, the shared blue highlight put red rings on blue squares. Dark was left as it was, because Grant asked for the colour change in light only.

### D-25 · One game screen for every variant; only the board varies

**Status:** Accepted

**Decision.** Every variant is played on the same screen, in the same order: the top bar (back, the variant's name, How to play and the theme toggle), the player cards, the board, and the bottom bar (New game, then Play again). Its layout, sizes, colours and words are written down in [02-game-screen.md](02-game-screen.md) and apply to every variant from now on. A variant may change only its own board. Anything it does differently is recorded in that document's per-variant table and as a decision; a change to the shared parts for one variant means changing the document first.

**Why.** Grant wants the variants to look and behave as one app, with new variants (Infinite, Ultimate, and any later) fitting in without restyling. It also keeps D-07 true: adding a variant is its folder and one registry entry.

### D-26 · Docs are numbered files under `docs/`

**Status:** Accepted

**Decision.** Project docs live in `docs/` as numbered files: `01-decisions.md`, `02-game-screen.md`, and so on. A new doc takes the next number; a number is never reused or reassigned, even if a doc is retired. The README lists them. Agent configuration stays in `docs/agents/`, unnumbered.

**Why.** A fixed number gives every doc a stable name, so references in PRs, issues and other docs don't get mixed up as more docs are added.
