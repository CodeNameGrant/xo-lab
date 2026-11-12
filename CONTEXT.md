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

### Results

**Completed line**:
Three of one player's marks in a row, across, down or diagonally, that ends the game. Which result it gives is the variant's rule: by default its player wins; in Misère its player loses.
_Avoid_: winning line (it doesn't always win)

**Winner**:
The player a finished game goes to, whatever the reason: in Misère, the opponent of the player who made the completed line.
_Avoid_: victor

**Draw**:
A finished game that goes to nobody: the board is full, or no line can be completed any more.
_Avoid_: tie, stalemate
