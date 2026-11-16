# The game screen

The layout, sizes and colours of the screen a variant is played on. **This applies to every variant.** A new variant gets this screen as it is; it does not restyle it.

The screen is shared code: `src/screens/GameScreen.tsx` draws everything except the board, and each variant supplies only its board component. The rule behind this is decision D-25 in [01-decisions.md](01-decisions.md).

## What a variant may change

**Only its board.** The top bar, the player cards and the bottom bar are the same in every variant: same order, same sizes, same colours, same words. The board normally sits inside the column's 24 px side padding; the one exception is Ultimate's, which reaches to 6 px from the screen edge (decision D-31).

A variant that needs anything different does it inside its own board component, and records it in [Per-variant differences](#per-variant-differences) below and as a decision. A difference that would change the shared parts for one variant is a change to this document first, not a special case in the code.

## Layout

Top to bottom, in one centred column:

| #   | Part             | What it holds                                                                                                                                                                                                                                                    |
| --- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Top bar**      | Back to the hub · the variant's name · How to play and the theme toggle                                                                                                                                                                                          |
| 2   | **Player cards** | Player 1 (X) and Player 2 (O), side by side, and Player 3 (★) below in a three-player variant: whose turn it is, then who won or a draw; each player's score, and the draws under them; in a two-player variant, Player 2's card also chooses a person or the AI |
| 3   | **Board**        | The variant's own board, centred in all the remaining height                                                                                                                                                                                                     |
| 4   | **Bottom bar**   | One full-width button: New game during play, Play again once the game is over                                                                                                                                                                                    |

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
- **Centre:** the label "Tic-Tac-Toe" (shown in capitals) over the variant's name.
- **Right:** How to play (question-mark icon), then the theme toggle (moon in light, sun in dark), 4 px apart. How to play opens a panel with the variant's own paragraphs; in a two-player variant it ends with a shared one: "**Playing alone?** Tap Player 2's card to play against the AI, at Easy, Medium or Hard." (decision D-52).
- Icon buttons are **44 × 44 px**, radius 12 px, icons 24 px. In dark they get a 1 px border and 22 px icons.
- Each icon button shows its label as a **tooltip** on hover, keyboard focus or a long press (`<Tooltip>`, decision D-51): back's lines up with its left edge, the right-hand buttons' with their right edge.

### 2 · Player cards

- Two equal columns, **12 px** apart. Player 1 (X) is always on the left.
- **Three players** (a variant whose `VariantInfo` says `players: 3`): Player 3's card wraps to a second row, 12 px below, the same width as the other two and centred (layout A, decision D-37).
- Each card: radius **14 px**, padding 12 px × 7 px, a **2 px** border. The player's piece at 28 px, 6 px from two lines: the name ("Player 1", 15 px, semibold) and a detail line (13 px, secondary text). Then, 8 px after the text and centred on the card, the score box (decision D-42).
- The detail line is "Crosses", "Noughts" or "Stars".
- **Number sides** (a variant whose `VariantInfo` has `numberSides`, Numerical): each card shows a sample of the numbers its player plays this game, two digits at 18 px in their colour, and that side's detail line ("Odd numbers" or "Even numbers"). The starter has one side and the other player the other, so **they swap with each new game** (decision D-57).
- **Shared marks** (a variant whose `VariantInfo` has `sharedMarks`, such as Notakto; SOS gives `letters` instead of `marks`, drawn by `<GlyphPiece>`): each card shows the marks every player places, in that card's player's colour, and the variant's detail line instead ("Crosses" in Notakto). One mark is 28 px; two sit side by side at 18 px. On the board those marks are neutral: the normal text colour, with no glow in dark (decision D-43).
- **Starter:** the card of the player who started this game shows a flag icon after the name, 13 px, in the secondary text colour, 4 px from it.
- **Score box:** the player's **Score** (see `CONTEXT.md`), their wins since the game screen opened: 15 px semibold (bold in dark), tabular figures, in the normal text colour, in a box **26 px** tall and at least 26 px wide, with 6 px side padding, radius 7 px and no border. The box is filled with the player's tint, or with `surface` on the Won card, whose background is already the tint. It shows 0 before any game finishes, and the number pops in (180 ms) when it changes.
- **Draws:** "0 draws", "1 draw", "2 draws", 13 px, secondary text, centred **8 px** under the cards (under Player 3's card in a three-player variant). Left out for a variant that can never end in a draw, Infinite and Notakto, whose `VariantInfo` says `canDraw: false` (decision D-43).

The score is kept only while the game screen is open: it starts at 0 whenever the screen opens, including after a reload, and is gone when the player goes back to the hub. A game abandoned with New game doesn't count.

#### Player 2 played by the AI

In every two-player variant, Player 2's card chooses who plays Player 2: a person or the **AI** (see `CONTEXT.md`), at Easy, Medium or Hard (decisions D-46, D-48). Trio's cards are unchanged.

- **The card is a button.** It looks exactly like the other cards, with a **14 px** chevron-down after the name, in the secondary text colour, 3 px from it. Its label says who plays it and what tapping does: "AI, Medium, Noughts. Change who plays Player 2". While its menu is open, its border is Player 2's colour.
- **Against the AI**, the name is "AI" instead of "Player 2", and the detail line is the level, "Easy", "Medium" or "Hard", instead of "Noughts" or the variant's shared-marks detail. Everything else (piece, starter flag, score box, the five looks) is as for any card.
- **The menu** opens 8 px under the card, its right edge on the card's right edge, over the board: **230 px** wide, `surface`, a 1 px `grid` border (`line` in dark), radius 14 px, `shadow-board`, 6 px padding. A heading, "Player 2 is played by", is 12 px, medium, uppercase, secondary text, with the top bar label's letter spacing. Then four rows, **44 px** tall, radius 10 px, 15 px text: "A person", "AI · Easy", "AI · Medium", "AI · Hard". The current row is filled with `tint-o`, semibold, with an 18 px check in Player 2's colour at its right. Last, under a 1 px `grid` line, a 12 px note in secondary text: "Changing this starts a new game and sets the score back to 0."
- **Choosing a row** closes the menu. A different choice changes the address to `?ai=easy`, `?ai=medium`, `?ai=hard`, or no parameter for a person, which opens the screen afresh: a new game with Player 1 to start, and every score and the draws at 0. The choice is also remembered on the device, and the hub's links open every two-player variant with it (decision D-49). Choosing the current row, tapping outside the menu, or Escape closes it with no change. The menu is a `menu` of `menuitemradio` buttons; focus moves to the current row when it opens and back to the card when it closes.
- **While the AI thinks**, its card has the Turn look, the board's squares are all `aria-disabled` (the board is given the rules with no legal moves), and its move appears no sooner than **400 ms** after the person's.

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
- Every square is a real button at least **44 px** square, labelled with its position and contents ("Row 2, column 3, X"). The one exception is Ultimate, whose 81 squares are about 38 px on the 390 px reference phone (decision D-31).
- The **completed line** (see `CONTEXT.md`) is highlighted in the colour of the player whose marks it holds: in light, its squares take **that player's tint**; in dark, they take the shared `win` highlight with a 1 px border in that player's colour. In most variants that player is the winner; in Misère they are the loser (D-40).
- The 3×3 board (Classic, Infinite) is **342 px** wide at most: nine separate tiles, 10 px apart, radius 16 px, each with a 1 px `grid` border on `surface`, and no panel behind them; pieces are 60 px. It is the same shape in both themes and only the colours change (decision D-28). A tile of the completed line takes its player's colour on its border in both themes.

### 4 · Bottom bar

One full-width button, **52 px** tall, radius 14 px, 16 px semibold text with a 20 px icon:

| When         | Label          | Look                                                                        |
| ------------ | -------------- | --------------------------------------------------------------------------- |
| During play  | **New game**   | Outlined: surface fill (transparent in dark), 1 px line border, normal text |
| Player 1 won | **Play again** | Filled with Player 1's colour, its on-colour text (+ glow in dark)          |
| Player 2 won | **Play again** | Filled with Player 2's colour, its on-colour text (+ glow in dark)          |
| Player 3 won | **Play again** | Filled with Player 3's colour, its on-colour text (+ glow in dark)          |
| Draw         | **Play again** | The primary button: dark fill in light, cyan in dark (+ glow)               |

In dark, both labels are bold. Either button starts a fresh game of the same variant, started by the other player.

### Screen-reader status

A visually hidden `aria-live="polite"` line is always on the page and says the game in words: "Player 1 to move", "Player 2 wins!", "It's a draw.". Once a game is over it adds the score, without the draws:

| Players | Score                | Example                                                          |
| ------- | -------------------- | ---------------------------------------------------------------- |
| Two     | One leads            | "Player 2 wins! Player 1 leads 3 games to 1."                    |
| Two     | Level                | "It's a draw. The score is tied at 3 games each."                |
| Three   | One leads            | "Player 3 wins! Player 3 leads with 3 games."                    |
| Three   | Two level at the top | "Player 3 wins! Player 1 and Player 3 are tied at 2 games each." |
| Three   | All level            | "It's a draw. All three players are tied at 2 games each."       |

Against the AI, Player 2 is "AI" throughout: "AI is thinking" while it searches, "AI wins! AI leads 3 games to 1.", "Player 1 wins! The score is tied at 2 games each."

Each player card also says its score and, on the starter's card, "started this game", in visually hidden text.

It must be there from the start and never added conditionally, because a live region inserted together with its text is usually not announced.

## Colours

Every colour is a token in `src/theme/tokens.css`; components use the token, never the hex value. Light is theme A · Clean minimal, dark is theme B · Neon arcade. Which one shows is set by `data-theme` on the page (decision D-17).

| Token                | Used for                                                 | Light                | Dark                 |
| -------------------- | -------------------------------------------------------- | -------------------- | -------------------- |
| `page`               | Page background; draw card background                    | `#F7F7F5`            | `#0B1020`            |
| `surface`            | Cards, board panel or tiles, outlined button             | `#FFFFFF`            | `#141B33`            |
| `ink`                | Text                                                     | `#16181D`            | `#E8ECF8`            |
| `ink-muted`          | Secondary text                                           | `#5B606B`            | `#9AA3BF`            |
| `line`               | Button and icon-button borders                           | `#D9DBE0`            | `#2E3A60`            |
| `grid`               | Board grid lines and tile borders; dim card borders      | `#E3E5EA`            | `#26304F`            |
| `player-x`           | Player 1's pieces, card border and Play again            | `#2457D6`            | `#3DE0FF`            |
| `player-o`           | Player 2's pieces, card border and Play again            | `#B12B35`            | `#FF4FB0`            |
| `player-s`           | Player 3's pieces, card border and Play again (gold)     | `#946800`            | `#FFC93C`            |
| `tint-x`             | Player 1's winning card and score box; in light, squares | `#EAF0FD`            | `#1E2A52`            |
| `tint-o`             | Player 2's winning card and score box; in light, squares | `#FEEBEA`            | `#34163A`            |
| `tint-s`             | Player 3's winning card and score box; in light, squares | `#FBF1DA`            | `#352C14`            |
| `win`                | The completed line's squares in dark                     | (not used in light)  | `#1E2A52`            |
| `on-player-x`        | Text on Player 1's Play again                            | `#FFFFFF`            | `#0B1020`            |
| `on-player-o`        | Text on Player 2's Play again                            | `#FFFFFF`            | `#0B1020`            |
| `on-player-s`        | Text on Player 3's Play again                            | `#FFFFFF`            | `#0B1020`            |
| `primary`            | Play again after a draw                                  | `#16181D`            | `#3DE0FF`            |
| `on-primary`         | Its text                                                 | `#FFFFFF`            | `#0B1020`            |
| `link`, `link-hover` | Links                                                    | `#2457D6`, `#163C9E` | `#3DE0FF`, `#9DEFFF` |

**Glows** exist only in dark, all built from the player colours: pieces have a 6 px drop shadow (4 px at 28 px and smaller), the active or winning card has a 16 px glow at 35 %, and Play again has an 18 px glow at 45 %.

**Contrast.** All text is at least 4.5:1 against what it sits on, in both themes. A new colour pairing gets checked before it ships.

## Type

| Theme | Font          | Top-bar label                     | Variant name                    |
| ----- | ------------- | --------------------------------- | ------------------------------- |
| Light | Inter         | 12 px, medium, uppercase, 0.08 em | 18 px, semibold                 |
| Dark  | Space Grotesk | 12 px, medium, uppercase, 0.2 em  | 20 px, bold, uppercase, 0.12 em |

## Motion

A piece pops in when placed, and a score when it changes (180 ms); the completed line's highlight and card changes fade (200–300 ms). Every animation is behind `motion-safe:`, so a device set to reduce motion gets none (decision D-20).

Infinite adds two (decision D-27): the piece that disappears next pulses between 55 % and 20 % opacity (1.4 s each way), and a removed piece fades from 40 % to nothing while shrinking to 80 % (300 ms). With reduced motion the disappearing piece is a still 40 %, and a removed piece is simply gone.

## Per-variant differences

What each variant does differently from the shared screen. All of it is inside the variant's board; the top bar, cards and bottom bar never change.

| Variant       | Board                                                                                                                                                                                                                                           | Other differences                                                       | Status      |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------- |
| **Classic**   | The shared 3×3 board (`src/boards/GridBoard.tsx`)                                                                                                                                                                                               | None                                                                    | Built (#3)  |
| **Infinite**  | The shared 3×3 board, plus the mover's oldest piece drawn at 40 % opacity and pulsing once they have three (its square's label adds "disappears next"), and a fade-out when a piece is removed. Both in the player's own colour; no new colours | None                                                                    | Built (#5)  |
| **Ultimate**  | Its own nested board (`src/variants/ultimate/UltimateBoard.tsx`), described below                                                                                                                                                               | The board is wider than the column, to 6 px from the screen edge (D-31) | Built (#6)  |
| **Shift**     | Its own 5×5 field (`src/variants/shift/ShiftBoard.tsx`), described below                                                                                                                                                                        | None                                                                    | Built (#14) |
| **Trio**      | The shared grid board at 4×4 (`src/boards/GridBoard.tsx` with `size={4}`): 16 tiles 8 px apart, about 80 px on the 390 px phone, pieces 48 px                                                                                                   | Three player cards, Player 3 centred on a second row (D-37)             | Built (#16) |
| **Misère**    | The shared 3×3 board (`src/boards/GridBoard.tsx`); the completed line keeps the colour of the player who made it, the loser (D-40)                                                                                                              | None                                                                    | Built (#19) |
| **Notakto**   | Its own three boards (`src/variants/notakto/NotaktoBoard.tsx`), described below                                                                                                                                                                 | Shared marks on the cards; no draws line (D-43)                         | Built (#23) |
| **Wild**      | The shared grid board at 4×4 with neutral marks, plus a callout to choose X or O (`src/variants/wild/WildBoard.tsx`), described below                                                                                                           | Shared marks on the cards: an X and O pair, "X or O" (D-43)             | Built (#24) |
| **Pyramid**   | Its own pyramid of nine tiles (`src/variants/pyramid/PyramidBoard.tsx`), described below                                                                                                                                                        | None                                                                    | Built (#32) |
| **Harvest**   | The shared grid board at 5×5 with every line lit as it's made, and a line count above it (`src/variants/harvest/HarvestBoard.tsx`), described below                                                                                             | None                                                                    | Built (#33) |
| **March**     | The shared grid board at 4×4 with pieces that move, by tap-tap (`src/variants/march/MarchBoard.tsx`), described below                                                                                                                           | None                                                                    | Built (#34) |
| **Numerical** | Its own 3×3 board with numbers for pieces, a callout to choose one, and each player's numbers left above it (`src/variants/numerical/NumericalBoard.tsx`), described below                                                                      | Number sides on the cards, swapping each game (D-57)                    | Built (#37) |
| **SOS**       | Its own 6×6 board of neutral letters with strokes through each SOS, a tinted S/O tray and a count above it (`src/variants/sos/SosBoard.tsx`), described below                                                                                   | Shared letters on the cards, "S or O" (D-59)                            | Built (#39) |

### Ultimate's board

The tile shape of the 3×3 board, scaled down to nine small boards (decisions D-28, D-30, D-31). The same shape in both themes; only the colours change.

- **Wider than the column:** it reaches 18 px into the side padding on each side, so on the 390 px phone it is **378 px** wide, 6 px from each screen edge; at most **400 px** on a wider screen. The player cards and the bottom bar keep the normal padding. Small boards are **10 px** apart; inside one, squares are **3 px** apart. On the 390 px phone each square is about **38 px**, the one exception to the 44 px rule (D-31).
- **Squares:** tiles with radius 6 px and a 1 px `grid` border on `surface`. Pieces are 22 px.
- **Boards you may play in:** a 2 px ring in the current player's colour, 3 px outside the tiles (+ the player's glow in dark). On the first move, and whenever the player is sent to a won or full board, every open board is ringed.
- **A won small board:** its squares take the winner's tint, its pieces fade to 25 %, and the winner's mark is drawn over it at the board's full size (+ glow in dark).
- **A full small board with no winner:** its pieces fade to 40 %, with no mark over it.
- **The completed line of small boards:** the same ring, in the winner's colour, once the game is won.
- **Labels:** each small board is a group named by position ("Top-right board", then ", won by Player 1", ", full, no winner" or ", play here"); each square reads "Top-right board, row 2, column 1, empty".

### Shift's board

The tile shape of the 3×3 board on a 5×5 field (decisions D-28, D-32, D-34). The same shape in both themes; only the colours change.

- **Field:** 342 px wide at most, 25 tiles **8 px** apart, radius 16 px, each with a 1 px `grid` border on `surface`. On the 390 px phone each tile is about **62 px**. Pieces are 40 px.
- **The window:** its four inner grid lines only, a `#` with no outer border, each line 8 px wide in a gap between tiles, in the colour of the player to move at 60 % (+ glow in dark), 90 % while dragged. Once the game is over the lines turn the `line` colour and the window can't be dragged.
- **Outside the window:** tiles look the same as inside; only their pieces fade, to 40 % opacity, because they don't count. While the window is dragged, the pieces it would cover on release are shown at full strength.
- **Moving it:** drag from anywhere inside the window, tiles or gaps. A press that moves more than 10 px is a drag and places nothing; one that doesn't is a tap. The window follows the pointer at most one step each way and snaps to the nearest position on release (D-34). The board turns off touch scrolling so a drag never scrolls the page.
- **Completed line:** as on the 3×3 board: its player's tint in light, the shared highlight in dark, and a border in its player's colour.
- **Labels:** "Row 2, column 5, X", with ", outside the board" for a tile outside the window.

### Notakto's board

Three 3×3 boards in the tile shape of the 3×3 board, the same shape in both themes (decisions D-43, D-44).

- **Layout:** two boards side by side, 12 px apart, and the third centred below them, the same width, 12 px down: the shape of three player cards (D-37). On the 390 px phone each board is about **165 px** and each square about **52 px**, with squares **4 px** apart, radius 6 px.
- **Marks:** every X is neutral, in the normal text colour with no glow, at 32 px.
- **A dead board:** its X's fade to 40 %, except the completed line's, whose squares take the colour of the player who completed it: their tint in light, the shared highlight in dark, and a border in their colour. Its squares are no longer playable.
- **Labels:** each board is a group, "Board 1" to "Board 3", read left to right and then down, with ", dead" once it's dead; each square reads "Board 2, row 1, column 3, X".

### Wild's board

The shared grid board at 4×4, as Trio's (decision D-28): 16 tiles 8 px apart, about 80 px on the 390 px phone, pieces 48 px. Its marks are neutral, and the mark is picked up from a tray above the board (decisions D-45, D-58).

- **Marks:** X's and O's are both neutral, in the normal text colour with no glow. The completed line takes the colour of the player who completed it, the winner, whatever its marks are.
- **The tray:** 12 px above the board and centred, one X and one O chip (see **Piece trays** below), with neutral marks at 24 px. It belongs to whoever is to move: the picked chip fills with their colour.
- **Placing:** pick X or O up, then tap an empty square. While a mark is picked up, the empty squares have a dashed border in the mover's colour, and their labels add ", place X here". The pick clears after every move.

### Pyramid's board

Nine tiles in the tile shape of the 3×3 board (decision D-28), stacked 1, 3 and 5 in a grid 5 squares wide and 3 tall, so the base sets the size (decision D-54).

- **Size:** 342 px wide at most, squares **8 px** apart; on the 390 px phone each square is about **62 px**. Pieces are 40 px.
- **Shape:** the apex sits over the middle square of the base, and the middle row over the base's three middle squares. The empty grid corners show the page behind them.
- **Completed line:** as on the 3×3 board, in its player's colour.
- **Labels:** rows and columns count in the 5-wide grid: the apex is "Row 1, column 3", the middle row is columns 2–4, the base columns 1–5.
- **Hub picture:** a space in `preview` is a square that isn't there, and the picture's columns come from its row length, so Pyramid's is 5 wide and 3 tall.

### Harvest's board

The shared grid board at 5×5 (decision D-55): 25 tiles 8 px apart, about 62 px on the 390 px phone, pieces 40 px.

- **Lines light up as they're made**, not only at the end: every square of every line takes its player's colour as on the 3×3 board. A square can belong to lines of both players only if it held both marks, which it can't, so each square has one colour.
- **The line count** sits 12 px above the board, centred: each player's mark at 16 px, then "2 lines", 15 px semibold with tabular figures, the two 16 px apart. It's a polite live region, always on the page, so screen readers hear each new line ("Player 1: 2 lines").
- The player cards keep the session's score; the count above the board is this game's lines.

### March's board

The shared grid board at 4×4, as Trio's (decision D-28): 16 tiles 8 px apart, about 80 px on the 390 px phone, pieces 48 px in their players' colours. Nothing is placed: the pieces start on the board and move (decision D-56).

- **Picking up a piece:** tapping one of your pieces that can move gives its square a 2 px border in your colour, and marks each empty square it can step to with a **12 px dot** in your colour at 60 %.
- **Moving it:** tapping a dot moves the piece there. Tapping another of your movable pieces picks that one up instead; tapping the chosen piece again, any other square, a gap or anywhere off the board puts it down. A move or a new game also clears it.
- **Labels:** a piece that can move adds ", can move" ("Row 1, column 3, X, can move"); a dot's square adds ", move here".
- **Completed line:** as on the 3×3 board, in its player's colour.

### Numerical's board

The tile shape of the 3×3 board (decision D-28): 342 px wide at most, squares 10 px apart, about 107 px on the 390 px phone (decision D-57).

- **Pieces:** numbers drawn by `<GlyphPiece>` at 60 px, each in the colour of the player who owns it this game (the odd numbers are the starter's), with the player's glow in dark.
- **Trays:** above the board, 12 px from it, a tray per player, 8 px apart: "Player 1" (13 px, secondary text) and then their five or four numbers as chips (see **Piece trays** below), digits at 20 px in their colour. Only the tray of the player to move is live; the other is at 40 %. A used number stays in its tray, struck through on a dashed chip. Groups are named "Player 1's numbers".
- **Placing:** pick a number up, then tap an empty square. While a number is picked up, the empty squares have a dashed border in the mover's colour, and their labels add ", place 7 here". The pick clears after every move.
- **Completed line:** a full line of 15 takes the colour of the player who completed it, whatever numbers it holds.

### Piece trays

Numerical and Wild choose what to place from a **tray** above the board, the same "pick, then tap" as March's pieces (decision D-58; `src/boards/PieceTray.tsx`).

- **Chips:** 44 px toggle buttons, radius 12 px, 1 px `line` border on `surface`, 6 px apart, the piece in the player's colour (Numerical) or neutral (Wild).
- **Picked:** the chip fills with the player's colour, its piece turns the on-colour, and it lifts 4 px and grows 5 % with the board's shadow (the player's glow in dark). It's `aria-pressed`. Tapping it again puts it down. Nothing is ever picked at the start of a turn.
- **Nudge:** tapping an empty square with nothing picked up places nothing and shakes the live tray (320 ms); with reduced motion it gets a 2 px outline in the player's colour instead.

### SOS's board

Thirty-six tiles in the tile shape of the 3×3 board (decision D-28) at radius 6 px, 6 px apart, about 52 px on the 390 px phone (decision D-59).

- **Letters:** S and O drawn by `<GlyphPiece>` at 30 px, neutral: the text colour with no glow.
- **Strokes:** each SOS is struck through from the centre of its first square to the centre of its last, 4 px with rounded ends, at 80 % in the colour of the player who made it (+ glow in dark). It's drawn with positioned, rotated elements over the board, not an SVG. Strokes stay for the rest of the game and may cross.
- **The count:** above everything, centred: a 10 px dot in each player's colour and "2 SOS", 15 px semibold with tabular figures, the two 16 px apart. It's a polite live region, always on the page ("Player 1: 2 SOS").
- **The tray:** S and O chips (see **Piece trays**), with neutral letters at 22 px, on a panel tinted in the colour of the player to move, radius 14 px, 8 px padding. An extra turn shows as the tint staying put.
- **Placing:** pick a letter up, then tap an empty square; the empty squares have a dashed border in the mover's colour, and their labels add ", place S here". The pick clears after every move, scoring or not.

When a new variant is built, fill in its row with what was actually built, and add its board's sizes and colours here.
