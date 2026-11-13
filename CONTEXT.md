# XO Lab

A hub of tic-tac-toe variants played on one device. This is the glossary: the words the code, UI, issues and tests use for the game.

## Language

### Games

**Variant**:
One game in the hub (Classic, Infinite, Ultimate, Shift, Trio, Misère), with its own rules, board and fixed number of players.
_Avoid_: mode, game type

**Player**:
One of the people at the device: Player 1 (X), Player 2 (O), or, in a three-player variant, Player 3 (the star).
_Avoid_: you, red, blue, a typed name

**Starter**:
The player who makes the first move of a game; it passes one place along the turn order with each new game.
_Avoid_: first player (in prose), host

**Shared marks**:
Marks that belong to nobody: in Notakto every player places an X, and in Wild either player places an X or an O. Whatever was placed, a completed line counts for the player who completed it.
_Avoid_: neutral pieces, common marks

### Boards

**Live board**:
In Notakto, a board that can still be played on.
_Avoid_: open board, active board

**Dead board**:
In Notakto, a board with a completed line; nobody can play on it again.
_Avoid_: closed board, finished board

**Kill**:
To complete a line on a live board in Notakto, making it a dead board.
_Avoid_: close, finish

### Results

**Completed line**:
Three matching marks in a row, across, down or diagonally, belonging to the player who placed the third. What it does is the variant's rule: by default that player wins; in Misère they lose; in Notakto it kills a board.
_Avoid_: winning line (it doesn't always win)

**Winner**:
The player a finished game goes to, whatever the reason: in Misère, the opponent of the player who made the completed line; in Notakto, the opponent of the player who killed the last live board.
_Avoid_: victor

**Draw**:
A finished game that goes to nobody: the board is full, or no line can be completed any more.
_Avoid_: tie, stalemate

**Score**:
How many games each player has won, and how many were draws, since the variant's game screen was opened. Only finished games count; a game abandoned with New game doesn't.
_Avoid_: tally, record, match, session
