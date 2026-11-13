# Decisions

Every decision about XO Lab that is worth defending later, in the order it was made. The spec is issue #1; this file records what was decided on top of it, and where it changed.

**Adding one.** Give it the next number, today's date and a status, then say what was decided, why, and what else was considered. Never delete or rewrite an old entry: when a decision changes, add a new one and mark the old one `Superseded by D-nn`, so the history stays readable. Refer to entries by number (`D-07`) in PRs, issues and code comments.

**Statuses.** `Accepted` is in force. `Superseded by D-nn` was replaced and is kept for the record.

## Index

| #    | Date       | Decision                                                       | Status                                |
| ---- | ---------- | -------------------------------------------------------------- | ------------------------------------- |
| D-01 | 2026-11-09 | Track work in GitHub Issues with the default triage labels     | Accepted                              |
| D-02 | 2026-11-09 | Split the spec into six tickets across four milestones         | Accepted                              |
| D-03 | 2026-11-09 | Vite, React, TypeScript and React Router on Vercel             | Accepted                              |
| D-04 | 2026-11-09 | Pin Vite as the framework in `vercel.json`                     | Accepted                              |
| D-05 | 2026-11-09 | One rules contract for every variant                           | Accepted                              |
| D-06 | 2026-11-09 | A game is the first player plus the move list                  | Accepted, reason updated by D-41      |
| D-07 | 2026-11-09 | A registry of variants, each loaded only when opened           | Accepted                              |
| D-08 | 2026-11-09 | One contract test suite runs for every variant                 | Accepted                              |
| D-09 | 2026-11-09 | Player 1 is X; the first move alternates per new game          | Accepted                              |
| D-10 | 2026-11-09 | Undo in memory now, saved across reloads in M4                 | Superseded by D-21                    |
| D-11 | 2026-11-09 | A status line under the board                                  | Superseded by D-22                    |
| D-12 | 2026-11-09 | Light theme A · Clean minimal from the design canvas           | Accepted, O colour superseded by D-23 |
| D-13 | 2026-11-10 | Tailwind v4 utilities and an app-only token palette            | Accepted                              |
| D-14 | 2026-11-10 | Lucide icons, with X and O as matched game pieces              | Accepted                              |
| D-15 | 2026-11-10 | Prettier, four gates, squash-only `main`                       | Accepted                              |
| D-16 | 2026-11-10 | Agents never commit or push unless asked                       | Accepted                              |
| D-17 | 2026-11-10 | The theme lives on `<html data-theme>`                         | Accepted                              |
| D-18 | 2026-11-10 | Dark theme B · Neon arcade, with `dark:`/`light:` variants     | Accepted                              |
| D-19 | 2026-11-10 | Player colour tokens are `player-x` and `player-o`             | Accepted                              |
| D-20 | 2026-11-10 | Motion only when the device allows it                          | Accepted                              |
| D-21 | 2026-11-10 | No undo                                                        | Accepted                              |
| D-22 | 2026-11-10 | The player cards show the turn and the result                  | Accepted                              |
| D-23 | 2026-11-10 | An off-red O in the light theme                                | Accepted                              |
| D-24 | 2026-11-10 | Winning squares take the winner's tint in light                | Accepted                              |
| D-25 | 2026-11-10 | One game screen for every variant; only the board varies       | Accepted                              |
| D-26 | 2026-11-10 | Docs are numbered files under `docs/`                          | Accepted                              |
| D-27 | 2026-11-10 | Infinite's disappearing piece fades and pulses                 | Accepted                              |
| D-28 | 2026-11-10 | The light 3×3 board is tiles, like the dark one                | Accepted                              |
| D-29 | 2026-11-10 | Ultimate's squares are smaller than 44 px                      | Superseded by D-31                    |
| D-30 | 2026-11-10 | Ultimate's board: rings, tints and a large mark                | Accepted                              |
| D-31 | 2026-11-10 | Ultimate's board reaches to 6 px from the screen edge          | Accepted                              |
| D-32 | 2026-11-11 | Shift: a 3×3 window that moves over a 5×5 field                | Accepted                              |
| D-33 | 2026-11-11 | A draw as soon as no line can be won                           | Accepted                              |
| D-34 | 2026-11-11 | Shift's window moves only by dragging it                       | Accepted                              |
| D-35 | 2026-11-11 | A variant has two or three players, fixed per variant          | Accepted                              |
| D-36 | 2026-11-11 | Player 3 is a gold star                                        | Accepted                              |
| D-37 | 2026-11-11 | Player 3's card is centred on a second row                     | Accepted                              |
| D-38 | 2026-11-11 | Trio is played on a 5×5 board                                  | Superseded by D-39                    |
| D-39 | 2026-11-11 | Trio is played on a 4×4 board                                  | Accepted                              |
| D-40 | 2026-11-12 | Misère: a completed line loses                                 | Accepted                              |
| D-41 | 2026-11-12 | No saved games                                                 | Accepted                              |
| D-42 | 2026-11-12 | The score on the player cards, and a flag for the starter      | Accepted                              |
| D-43 | 2026-11-13 | Shared marks are neutral, and some variants have no draws line | Accepted                              |
| D-44 | 2026-11-13 | Notakto: three boards, everyone plays X                        | Accepted                              |
| D-45 | 2026-11-13 | Wild: 4×4, X or O each turn, chosen in a callout               | Accepted                              |

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

**Status:** Accepted (its reason is updated by D-41: saving was dropped)

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

### D-27 · Infinite's disappearing piece fades and pulses

**Status:** Accepted

**Decision.** In Infinite, once the player to move has three pieces on the board, their oldest piece is drawn at reduced opacity and pulses gently (55 % to 20 %, 1.4 s each way) until they move; its square's label ends "disappears next". When a piece is removed, it fades out from 40 % while shrinking slightly (300 ms). Both use the player's own colour token at reduced opacity, in both themes, so there is no new colour. With reduced motion, the piece is a still 40 % and a removed piece disappears at once. The fading square is still taken: a player can't play on it before it is freed.

**Why.** The spec (#1) asks for the removal never to be a surprise and for removed pieces not to vanish, but there is no mockup for either state. Opacity keeps the piece readable as that player's, in both themes, without a new colour to check for contrast. Only the player to move sees their piece fade, because only their move can remove it.

**Considered.** Showing the opponent's next-to-go piece too (rejected: two fading pieces make it unclear whose disappears on this move). A separate "ghost" colour token (rejected: the spec asks for the existing colours).

### D-28 · The light 3×3 board is tiles, like the dark one

**Status:** Accepted

**Decision.** In light, the 3×3 board (Classic, Infinite) is no longer one white panel with inner grid lines. It is drawn like the dark board: nine separate tiles, 10 px apart, radius 16 px, each with a 1 px border, and pieces at 60 px in both themes. Only the colours differ: light tiles are white with a light grey border on the off-white page. Winning tiles keep the winner's tint in light (D-24) and now take a border in the winner's colour in both themes, as dark already did.

**Why.** Grant chose this while reviewing the Ultimate mockups (#6). Ultimate's nested board is tiled in both themes, and Grant wanted every board in the app to share one shape, so that the themes differ only in colour.

**Considered.** Keeping the classic panel in light and drawing Ultimate as nested panels with grid lines (rejected: the two themes would keep two shapes for every board).

### D-29 · Ultimate's squares are smaller than 44 px

**Status:** Superseded by D-31

**Decision.** Ultimate's board stays inside the game screen's normal 24 px side padding, so on the 390 px reference phone it is 342 px wide, and its 81 squares come out at about 34 px. That is the one exception to the rule that every tap target is at least 44 px. Every other control on the Ultimate screen, and every square on the other boards, stays at 44 px or more. The squares still clear WCAG 2.2's 24 px minimum target size (level AA).

**Why.** Nine 44 px squares need 396 px before any gaps, more than a 390 px phone has, so no plain 9×9 board can meet the rule. Grant compared mockups of the board inside the padding (34 px squares) and out to 4 px from the screen edge (about 38 px), and chose to keep the shared screen unchanged (D-25) over gaining 4 px per square. Most turns send the player to one small board, which is highlighted, so a turn is usually a choice among at most nine squares.

**Considered.**

- **The board breaking out of the side padding** to 4 px from the edge (rejected: about 38 px, still under 44, and the board would be wider than the cards and the button, a change to the shared screen for one variant).
- **Tapping a small board to zoom in** and playing on 44 px squares (rejected for now: an extra tap on every move, and a harder board to build).

### D-30 · Ultimate's board: rings, tints and a large mark

**Status:** Accepted

**Decision.** Ultimate's board uses the tile shape of D-28 at a smaller size. The small boards the player to move may play in get a 2 px ring in that player's colour, set 3 px outside the tiles (with the glow in dark). A won small board takes the winner's tint, fades its pieces to 25 % and shows the winner's mark over the whole board. A small board that fills with no winner fades its pieces to 40 % and shows nothing over it. When the game is won, the winning line of small boards takes the same ring in the winner's colour. No new colours: everything comes from the player colours and tints already in the theme. It adds two radius tokens, `tile-sm` (6 px) and `board-sm` (10 px).

**Why.** There is no mockup for Ultimate (#6); this follows the mockups Grant reviewed for D-29. A ring rather than a fill keeps the pieces inside the allowed board readable, and it reuses the player's colour as the ticket asks. Using the winner's tint for won boards matches the winning squares on the 3×3 board (D-24). The drawn board is faded so it reads as closed, but without a mark, because it counts for nobody.

### D-31 · Ultimate's board reaches to 6 px from the screen edge

**Status:** Accepted (supersedes D-29)

**Decision.** Ultimate's board is wider than the game screen's column: it reaches 18 px into the 24 px side padding on each side, to 6 px from the screen edge. On the 390 px reference phone it is 378 px wide and each of its 81 squares is about 38 px, up from 34 px; on a wider screen it stops at 400 px. Pieces grow from 20 px to 22 px. The player cards, top bar and bottom bar keep the normal padding, so the board is the one part of any screen wider than them. The squares remain the one exception to the 44 px tap-target rule, and still clear WCAG 2.2's 24 px minimum (level AA).

**Why.** After playing D-29's board, Grant found the 34 px squares small and cramped and asked for the board to go to the screen edges. 6 px, not 4 px as in the mockup, leaves room for the 5 px ring around an edge board so the screen edge doesn't cut it off. D-25 allows a change to the shared screen for one variant only through [02-game-screen.md](02-game-screen.md), which now records it.

**Considered.** Narrower gaps between squares and boards instead (rejected: more room per square, but the board would look more cramped, not less). Zooming into a small board to play (still rejected, as in D-29).

## 2026-11-11

### D-32 · Shift: a 3×3 window that moves over a 5×5 field

**Status:** Accepted

**Decision.** Shift (#14, a working name) is played on a 5×5 field of tiles with a 3×3 window over it, starting in the centre. On a turn a player either places a mark on an empty tile inside the window or moves the window one step in any of the eight directions, keeping it on the field; moving is allowed from the first turn and placements are unlimited. Marks stay on their tiles and only marks inside the window count. Three in a row inside the window wins, whether a placement or a window move made it. A window move that makes a line for both players at once is a draw.

**Why.** Grant's idea, settled in a design discussion. If marks travelled with the window, moving it could never make a line, so the window has to be a view over fixed marks. One step at a time keeps moving the window a tactic: if it could jump to any of its nine positions, every line of three on the field would fit under some position, so a line anywhere would win on the next turn and the window would only limit where marks go. A draw for a double line is the simplest fair answer and stops a win by accident.

**Considered.** Moving to any position (rejected, above). Placing anywhere on the field (rejected: moving the window would rarely be worth a turn). The player who moves wins a double line, or the move is illegal (rejected for the draw). A limited number of marks with a third move, sliding your own mark (rejected: changes the game).

### D-33 · A draw as soon as no line can be won

**Status:** Accepted

**Decision.** In Shift, and later in Trio (#16), the game is a draw as soon as every line of three on the field holds marks of more than one player, because nobody can ever win. The check is `anyLineOpen` in `src/game/lines.ts`. Shift has no repetition rule: two players who keep moving the window back and forth can play forever, and can press New game. That gap is to be revisited with the computer opponent, which would happily loop.

**Why.** Grant asked for the game to notice when no win is possible rather than rules that depend on counting moves or repeated positions. It needs no history or clock, so the rules stay pure. In Trio it also stops three players playing on to a draw that is already certain.

**Considered.** A draw on the third repetition of a position, and a draw after N window moves in a row (both rejected: they end games by counting rather than by what is on the board, and the players can always start a new game).

### D-34 · Shift's window moves only by dragging it

**Status:** Accepted

**Decision.** Shift's window is drawn as its four inner grid lines only, a `#` in the colour of the player to move, 8 px wide in the gaps between tiles, with no outer border; marks outside it are faded to 40 %, while the tiles stay as they are. It is moved only by dragging, and a drag can start anywhere inside the window, on a tile or a gap. A press there that moves more than 10 px is a drag: the window follows the pointer, at most one step each way, and snaps to the nearest position on release, and nothing is placed. A press that doesn't move is a tap, and a tap on an empty tile inside the window places a mark. There is no keyboard or screen-reader way to move the window yet, a known exception to the accessibility rules in `AGENTS.md`.

**Why.** Grant pictured moving the board by dragging and compared playable mockups. The first build let only the grid lines be grabbed, to keep a press on a tile always meaning "place here", but on a phone the lines were hard to grab at 8 px and still at 14 px, with the field widened to the screen edge to make room. Grabbing anywhere in the window gives a target the size of the whole window. The movement threshold keeps the two apart, and a press that moves never places a mark, so a drag can't spend the turn on one by mistake, which matters because there is no undo. Accessibility was set aside for now by Grant's choice.

**Considered.** Tapping a tile outside the window to move one step towards it (kept as the likely way to close the accessibility gap). Eight arrow buttons around the board (rejected: they shrink the tiles to about 40 px). Grabbing by the grid lines only, at 8 px and then at 14 px with the field out to 6 px from the screen edge (both built and rejected after test-playing the preview on a phone: the lines were hard to grab).

### D-35 · A variant has two or three players, fixed per variant

**Status:** Accepted

**Decision.** `Player` has a third value, `S`, for Player 3. Each variant's `VariantInfo` says how many players it has, 2 or 3, and that never changes: there is no choice of player count. Turns go Player 1 → Player 2 → Player 3, and each new game passes the first move one place along that order (`nextPlayer` in `src/game/rules.ts`, used by `newGame` in the session); with two players that is the alternation there was before. The contract suite takes each variant's players from its `VariantInfo` and checks that every move passes the turn to the next player. The game screen draws one card per player. This amends the shared screen of D-25: a three-player variant has a third card.

**Why.** Trio (#16) is a three-player game, and the spec's two-player contract had `'X' | 'O'` built in. Fixing the count per variant keeps every existing variant exactly as it was and keeps the change to what Trio needs; Grant chose it over offering three players in every variant.

**Considered.** A player-count choice per game (rejected: a second setting for every variant, and their rules assume two players). A generic player type per variant (rejected for now: it spreads type parameters through the session and every caller for little gain; two-player variants simply never receive `S`).

### D-36 · Player 3 is a gold star

**Status:** Accepted

**Decision.** Player 3 plays a star, Lucide's `Star`, in gold: `player-s` is `#946800` in light and `#FFC93C` in dark, with `tint-s` `#FBF1DA` / `#352C14` and `on-player-s` white / `#0B1020`, and glows built like X's and O's. The star is 20 of Lucide's 24 units across, against 12 for X and O, so `<Mark>` draws it at 60 % (the `scale` property, which leaves the pop-in's `transform` alone) with its stroke widened by the same factor, so it fills the same box with lines as heavy.

**Why.** Grant compared mockups of a bright yellow, a gold and a purple beside X and O in both themes. Bright yellow is about 2:1 on white and washes out in light; the dark gold reads at about 4.6:1 and is the yellow Grant wanted in dark. It is also the colour furthest from blue/cyan X and red/pink O in both themes, where purple sits near the pink O in dark.

**Considered.** Bright yellow (rejected: too faint in light). Purple (rejected: close to O in dark). A glyph already 12 units across, such as a triangle (rejected: Grant wanted a star).

### D-37 · Player 3's card is centred on a second row

**Status:** Accepted

**Decision.** With three players, Players 1 and 2 keep their cards side by side and Player 3's card wraps to a second row, the same width as theirs and centred (layout A).

**Why.** Grant compared three layouts at the 342 px phone column. All three cards the same size means no player looks more or less important, and it costs no more height than a full-width third card; stacking all three costs about 78 px of the board's height.

**Considered.** A full-width third card (the fallback if A looks wrong on a phone). All three cards stacked (rejected: too much height).

### D-38 · Trio is played on a 5×5 board

**Status:** Superseded by D-39

**Decision.** Trio (#16), the three-player variant, is played on a 5×5 board, first to three in a row, and is a draw as soon as no line can be won (D-33). It uses the shared grid board, which now takes a `size` of 3 or 5.

**Why.** Between your turns two opponents each move, so an open two (a pair with both ends free) is blocked twice before you play again, and a forced win needs several threats at once. On 4×4 (16 squares, 24 lines) the board would fill before anyone could set that up, and most games would be draws; 5×5 (25 squares, 48 lines) leaves room to build threats in more than one place. Grant chose 5×5 without prototyping 4×4.

**Considered.** 4×4 (rejected, above). Prototyping both sizes first (skipped).

**Open concern (Grant, 2026-11-11).** After playing it, Grant thinks 5×5 is too big: with this much room the player who starts finds it too easy to win, because the other two can't block every threat. The first move rotates between new games, which spreads the advantage across a session but doesn't remove it from any one game. To revisit with more play: a smaller board (4×4, the size this decision rejected), or a rule that limits the starter (for example, no first move in the centre).

### D-39 · Trio is played on a 4×4 board

**Status:** Accepted (supersedes D-38)

**Decision.** Trio is played on a 4×4 board (16 squares, 24 lines of three), still first to three in a row, with the draw as soon as no line can be won (D-33). The shared grid board takes a `size` of 3 or 4; on the 390 px phone Trio's tiles are about 80 px and its pieces 48 px.

**Why.** After playing the 5×5 board, Grant found it too big: the player who starts wins too easily, because with that much room the other two can't block every threat (D-38's open concern). A smaller board gives the two opponents a better chance to block. D-38 expected 4×4 to end in many draws; whether it does is for play to tell.

**Considered.** Keeping 5×5 with a rule that limits the starter, such as no first move in the centre (not tried: a smaller board is the simpler change).

## 2026-11-12

### D-40 · Misère: a completed line loses

**Status:** Accepted

**Decision.** Misère (#19) is Classic with the result turned round: whoever makes a completed line loses, and their opponent is the winner; a move that completes two lines also loses; a full board with no completed line is a draw. A player must move every turn, even when every empty square loses, and there is no rule against the first player's centre-and-mirror strategy. The contract is unchanged: the outcome is `won` by the opponent, and `highlight` is the completed line. On the board the completed line keeps the colour of the player whose marks it holds, the loser, while the player cards, Play again and the screen-reader line name the winner. How to play paragraphs may mark words `**like this**` to draw them in bold, which Misère uses for "Don't" and "you lose".

**Why.** Grant set the meaning of the highlight: it says "this player has completed a line", and whether that wins or loses is the variant's rule, winning by default. So the shared board needs no change, and `CONTEXT.md` now calls it the completed line rather than the winning line. Naming the winner on the shared screen is accurate, because in Misère you win by making your opponent complete a line; How to play explains why. The mirror strategy (take the centre, then answer every move with the square opposite it) means the first player can never be forced to lose, so careful play is a draw as in Classic; the rules stay standard because most players won't find it and the first move rotates anyway.

**Considered.** Tinting the completed line in the winner's colour, or a neutral "losing line" look (rejected: the line is the loser's marks, and the highlight means "completed", not "won"). A new outcome that names the loser (rejected: a contract and shared-screen change for one variant). Rich text in `info.ts` as JSX (rejected for `**…**` markers, which keep info files plain data).

### D-41 · No saved games

**Status:** Accepted

**Decision.** The app does not keep a game in progress across a reload or a closed tab: reloading a variant starts a fresh game. Ticket #7 (M4 · Saving) is closed as not planned, the M4 milestone is closed with it, and the spec (#1) is closed with milestones M1 to M3 shipped. Nothing is stored on the device except the theme choice (D-17), and the starting player is not remembered between visits.

The game session stays as D-06 describes it, the first player plus the move list, replayed to get the current state. Its reason is now the one that still holds: a game is two plain values, the rules are the only code that builds a state, and every variant is driven through the same contract.

**Why.** Grant decided the app doesn't need the feature. No further reason was recorded; add one here if it matters later.

**Considered.** Building #7 as specified: one saved game and one next-starting-player per variant in local storage, discarding broken saves.

### D-42 · The score on the player cards, and a flag for the starter

**Status:** Accepted

**Decision.** Every variant's game screen keeps a **Score** (#21): each player's wins and the number of draws since the screen was opened. A finished game adds one to its winner (in Misère, the opponent of the player who made the completed line) or to the draws; a game abandoned with New game counts for nobody. The score lives in memory on the game screen only, beside the game: it is never part of the game (D-06), it is not saved (D-41), it starts at 0 whenever the screen opens, and there is no reset button. Each player card shows its player's wins in a small box on its right, filled with the player's tint (with `surface` on the Won card, which is already tinted); the draws are a line under the cards. The "· first move" text on the starter's card is replaced by a flag icon after the name, and the card's side padding and the gap after its piece are halved (14 → 7 px, 12 → 6 px) to make room. The screen-reader status line adds the score once a game is over: "Player 2 wins! Player 1 leads 3 games to 1." or "… The score is tied at 3 games each.", and with three players "… Player 3 leads with 3 games." or "… Player 1 and Player 3 are tied at 2 games each."

**Why.** Grant wanted a running score per variant without changing the shared layout, and chose the cards because the score then sits with its player and Trio's third card gets one too. A plain number read as dull, so it is boxed like a scorecard; the tint fill matches the winning card, and switching to `surface` on that card keeps the score visible at the moment it changes. The box needed room beside the name on a 390 px phone, which the tighter padding gives. The highlighted card already shows who moves first when a game starts, so the text note became a small flag that still shows the starter mid-game. The status line names only the leader, so it stays short with any number of players.

**Considered.** Mocked up in [score on the player cards](https://claude.ai/artifact/QqLNN1J7b8dRCVgbAj1dYG): a score strip under the cards (a fifth part, taking board height), a line in the top bar (small, and awkward with three players), and tally dots (they overflow after about five wins). For the box: a neutral page-coloured slot and a player-coloured frame (Grant preferred the tint). For the starter: a "1st" box stacked under the score (rejected: both boxes became too small), a play triangle, and a coloured dot beside the name or on the box.

## 2026-11-13

### D-43 · Shared marks are neutral, and some variants have no draws line

**Status:** Accepted

**Decision.** A variant whose marks belong to nobody declares `sharedMarks` in its `VariantInfo`: the marks every player places and the cards' detail line. Each player card then shows those marks in that player's colour (Notakto: an X, "Crosses"), while the board and the hub picture draw them neutral, in the normal text colour with no glow in dark. `<Mark>` takes a `tone`: its own player's colour by default, another player's, or `neutral`. A variant that can never end in a draw says `canDraw: false`, and the draws line under the cards is left out; that is Notakto and Infinite.

**Why.** Grant chose neutral marks for Notakto: its whole trick is that the X's belong to nobody, and coloured X's would invite reading lines as mine and yours. The glow means "this belongs to a player", so neutral marks have none. Showing an X in each player's colour on the cards keeps the players apart while saying what they play; Wild (#24) will show an X and O pair the same way. Grant asked for the draws line to go where a draw can't happen; Infinite can't draw either, so it drops the line too.

**Considered.** Colouring each X by the player who placed it (rejected: suggests ownership the rules don't have). Leaving Player 2's card showing an O nobody plays (rejected). Keeping "0 draws" on screen in variants without draws (rejected by Grant).

### D-44 · Notakto: three boards, everyone plays X

**Status:** Accepted

**Decision.** Notakto (#23) is played on three 3×3 boards, and both players place an X. Completing a line kills that board; whoever kills the last live board loses, and their opponent is the winner. There are no draws. The rules record who killed each board, so its completed line can keep that player's colour, as in Misère (D-40). The boards sit two side by side and one centred below, about 52 px squares on a 390 px phone.

**Why.** On one board the first player can always win with perfect play; with three, choosing which board to kill and when decides who faces the last board, which is what makes Notakto worth playing. Grant compared three layouts: two-and-one keeps squares nearly as big as three stacked (52 px against 56) while leaving room on the screen, and three in a row would shrink squares to about 32 px, under the 44 px rule.

**Considered.** One or two boards (rejected: one is a solved first-player win; three is the usual game). A choice of board count (rejected: no variant has settings). Three stacked, or three in a row (rejected, above).

### D-45 · Wild: 4×4, X or O each turn, chosen in a callout

**Status:** Accepted

**Decision.** Wild (#24) is played on a 4×4 board, three in a row to win. On every turn, the player to move chooses to place an X or an O; whoever completes a line of three matching marks wins, whoever placed the rest, and a full board with no line is a draw. A move is `{ square, mark }`. The marks are shared (D-43): neutral on the board, and an X and O pair in each player's colour on the cards, with the detail line "X or O". The completed line takes the winner's colour, which the shared grid board now accepts as `lineOwner`, since a neutral mark doesn't say whose it is. The mark is chosen in a small callout next to the tapped square, with an X and an O button: tapping another empty square moves it, and tapping anywhere else closes it.

**Why.** There is no undo, so the mark is chosen at the moment of the move rather than set beforehand. Grant compared a split-square picker and rejected it, then chose a callout, and chose that tapping another empty square moves it straight there. The board was first built at 3×3, as the issue specified; after playing it Grant found it drew too easily, with too little room to trap the opponent, and moved it to 4×4. With either mark open to either player, two matching marks in a line with the third square empty are a win for whoever moves next, so on 4×4's 24 lines of three every move has to avoid leaving one, and someone usually gets trapped.

**Considered.** 3×3 (built first, rejected after play: too many draws). 4×4 with four in a row (rejected: only 10 lines, nearly all spoiled early, so even more draws). An X/O switch next to the board (rejected: easy to forget its setting and place the wrong mark, with no undo). Splitting the tapped square into an X half and an O half (rejected by Grant after trying it). Tapping for X and long-pressing for O (rejected: hidden and error-prone). A callout that only closes when another square is tapped (rejected for moving it).
