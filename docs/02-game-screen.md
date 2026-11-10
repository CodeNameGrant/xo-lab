# The game screen

The layout, sizes and colours of the screen a variant is played on. **This applies to every variant.** A new variant gets this screen as it is; it does not restyle it.

The screen is shared code: `src/screens/GameScreen.tsx` draws everything except the board, and each variant supplies only its board component. The rule behind this is decision D-25 in [01-decisions.md](01-decisions.md).

## What a variant may change

**Only its board.** The top bar, the player cards and the bottom bar are the same in every variant: same order, same sizes, same colours, same words.

A variant that needs anything different does it inside its own board component, and records it in [Per-variant differences](#per-variant-differences) below and as a decision. A difference that would change the shared parts for one variant is a change to this document first, not a special case in the code.

## Layout

Top to bottom, in one centred column:

| #   | Part             | What it holds                                                                         |
| --- | ---------------- | ------------------------------------------------------------------------------------- |
| 1   | **Top bar**      | Back to the hub · the variant's name · How to play and the theme toggle               |
| 2   | **Player cards** | Player 1 (X) and Player 2 (O), side by side: whose turn it is, then who won or a draw |
| 3   | **Board**        | The variant's own board, centred in all the remaining height                          |
| 4   | **Bottom bar**   | One full-width button: New game during play, Play again once the game is over         |

There is **no visible status text** anywhere on the screen. The player cards carry the turn and the result. A visually hidden line (below) carries them for screen readers.

### Column

- Width: fills the screen up to **440 px**, centred, so it never stretches edge to edge on desktop.
- Padding: **16 px** top, **24 px** sides, **32 px** bottom.
- Gap between the four parts: **24 px**.
- At least the full screen height, so the bottom bar sits at the bottom and the board takes the space between.

The reference size is a 390 px-wide phone held upright.

### 1 · Top bar

- **48 px** tall, three columns. The outer two are equal, so the name stays centred whatever buttons sit either side.
- **Left:** back to the hub, a chevron icon button labelled "Back to all variants".
- **Centre:** the label "VARIANT" over the variant's name.
- **Right:** How to play (question-mark icon), then the theme toggle (moon in light, sun in dark), 4 px apart.
- Icon buttons are **44 × 44 px**, radius 12 px, icons 24 px. In dark they get a 1 px border and 22 px icons.

### 2 · Player cards

- Two equal columns, **12 px** apart. Player 1 (X) is always on the left.
- Each card: radius **14 px**, padding 12 px × 14 px, a **2 px** border. The player's piece at 28 px, then two lines: the name ("Player 1", 15 px, semibold) and a detail line (13 px, secondary text).
- The detail line is "Crosses" or "Noughts", followed by "· first move" on the card of the player who started this game.

A card has one of five looks:

| Look        | When                         | Border                                    | Background            | Detail line       |
| ----------- | ---------------------------- | ----------------------------------------- | --------------------- | ----------------- |
| **Turn**    | It's this player's move      | Player's colour (+ glow in dark)          | Surface               | Crosses / Noughts |
| **Waiting** | It's the other player's move | Invisible in light, dim grid line in dark | Surface               | Crosses / Noughts |
| **Won**     | This player won              | Player's colour (+ glow in dark)          | Player's tint         | "Wins!", semibold |
| **Lost**    | The other player won         | As Waiting                                | Surface, 40 % opacity | Crosses / Noughts |
| **Draw**    | The game is a draw           | Grid line                                 | Page colour           | "Draw"            |

Names and detail text always stay in the normal text colours, never the player's colour, so they keep their contrast. The colour comes from the border, the tint and the piece.

### 3 · Board

- Centred, horizontally and vertically, in all the height left between the cards and the bottom bar.
- It is the variant's own component (see [Per-variant differences](#per-variant-differences)). It receives the state, the rules and a "play this move" callback, and nothing else.
- Every square is a real button at least **44 px** square, labelled with its position and contents ("Row 2, column 3, X").
- The winning line is highlighted: in light, the winning squares take **the winner's tint**; in dark, they take the shared win highlight with a 1 px border in the winner's colour.
- The 3×3 board (Classic, Infinite) is **342 px** wide at most. In light it is one white panel, radius 20 px, padding 10 px, with 2 px inner grid lines and a soft shadow; pieces are 64 px. In dark it is nine separate tiles, 10 px apart, radius 16 px, each with a 1 px border; pieces are 60 px.

### 4 · Bottom bar

One full-width button, **52 px** tall, radius 14 px, 16 px semibold text with a 20 px icon:

| When         | Label          | Look                                                                        |
| ------------ | -------------- | --------------------------------------------------------------------------- |
| During play  | **New game**   | Outlined: surface fill (transparent in dark), 1 px line border, normal text |
| Player 1 won | **Play again** | Filled with Player 1's colour, its on-colour text (+ glow in dark)          |
| Player 2 won | **Play again** | Filled with Player 2's colour, its on-colour text (+ glow in dark)          |
| Draw         | **Play again** | The primary button: dark fill in light, cyan in dark (+ glow)               |

In dark, both labels are bold. Either button starts a fresh game of the same variant, started by the other player.

### Screen-reader status

A visually hidden `aria-live="polite"` line is always on the page and says the game in words: "Player 1 to move", "Player 2 wins!", "It's a draw". It must be there from the start and never added conditionally, because a live region inserted together with its text is usually not announced.

## Colours

Every colour is a token in `src/theme/tokens.css`; components use the token, never the hex value. Light is theme A · Clean minimal, dark is theme B · Neon arcade. Which one shows is set by `data-theme` on the page (decision D-17).

| Token                | Used for                                            | Light                | Dark                 |
| -------------------- | --------------------------------------------------- | -------------------- | -------------------- |
| `page`               | Page background; draw card background               | `#F7F7F5`            | `#0B1020`            |
| `surface`            | Cards, board panel or tiles, outlined button        | `#FFFFFF`            | `#141B33`            |
| `ink`                | Text                                                | `#16181D`            | `#E8ECF8`            |
| `ink-muted`          | Secondary text                                      | `#5B606B`            | `#9AA3BF`            |
| `line`               | Button and icon-button borders                      | `#D9DBE0`            | `#2E3A60`            |
| `grid`               | Board grid lines and tile borders; dim card borders | `#E3E5EA`            | `#26304F`            |
| `player-x`           | Player 1's pieces, card border and Play again       | `#2457D6`            | `#3DE0FF`            |
| `player-o`           | Player 2's pieces, card border and Play again       | `#B12B35`            | `#FF4FB0`            |
| `tint-x`             | Player 1's winning card and, in light, squares      | `#EAF0FD`            | `#1E2A52`            |
| `tint-o`             | Player 2's winning card and, in light, squares      | `#FEEBEA`            | `#34163A`            |
| `win`                | Winning squares in dark                             | (not used in light)  | `#1E2A52`            |
| `on-player-x`        | Text on Player 1's Play again                       | `#FFFFFF`            | `#0B1020`            |
| `on-player-o`        | Text on Player 2's Play again                       | `#FFFFFF`            | `#0B1020`            |
| `primary`            | Play again after a draw                             | `#16181D`            | `#3DE0FF`            |
| `on-primary`         | Its text                                            | `#FFFFFF`            | `#0B1020`            |
| `link`, `link-hover` | Links                                               | `#2457D6`, `#163C9E` | `#3DE0FF`, `#9DEFFF` |

**Glows** exist only in dark, all built from the player colours: pieces have a 6 px drop shadow (4 px at 28 px and smaller), the active or winning card has a 16 px glow at 35 %, and Play again has an 18 px glow at 45 %.

**Contrast.** All text is at least 4.5:1 against what it sits on, in both themes. A new colour pairing gets checked before it ships.

## Type

| Theme | Font          | Top-bar label                     | Variant name                    |
| ----- | ------------- | --------------------------------- | ------------------------------- |
| Light | Inter         | 12 px, medium, uppercase, 0.08 em | 18 px, semibold                 |
| Dark  | Space Grotesk | 12 px, medium, uppercase, 0.2 em  | 20 px, bold, uppercase, 0.12 em |

## Motion

A piece pops in when placed (180 ms); winning squares and card changes fade (200–300 ms). Every animation is behind `motion-safe:`, so a device set to reduce motion gets none (decision D-20).

Infinite adds two (decision D-27): the piece that disappears next pulses between 55 % and 20 % opacity (1.4 s each way), and a removed piece fades from 40 % to nothing while shrinking to 80 % (300 ms). With reduced motion the disappearing piece is a still 40 %, and a removed piece is simply gone.

## Per-variant differences

What each variant does differently from the shared screen. All of it is inside the variant's board; the top bar, cards and bottom bar never change.

| Variant      | Board                                                                                                                                                                                                                                           | Other differences | Status        |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------- |
| **Classic**  | The shared 3×3 board (`src/boards/GridBoard.tsx`)                                                                                                                                                                                               | None              | Built (#3)    |
| **Infinite** | The shared 3×3 board, plus the mover's oldest piece drawn at 40 % opacity and pulsing once they have three (its square's label adds "disappears next"), and a fade-out when a piece is removed. Both in the player's own colour; no new colours | None              | Built (#5)    |
| **Ultimate** | Its own nested 9×9 board: highlighted boards the player may play in, a large X or O over each won small board                                                                                                                                   | None planned      | To build (#6) |

When #5 or #6 is built, fill in its row with what was actually built, and add the board's sizes and colours here.
