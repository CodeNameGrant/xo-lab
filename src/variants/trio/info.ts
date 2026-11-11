import type { VariantInfo } from '../types.ts'

export const trioInfo: VariantInfo = {
  name: 'Trio',
  players: 3,
  tagline: 'Three players, one 4×4 board. First to three in a row wins.',
  howToPlay: [
    'Three players share a 4×4 board. Player 1 is X, Player 2 is O and Player 3 is the star. Turns go 1, 2, 3, then back to 1.',
    'On your turn, place your mark in any empty square. Get three of your marks in a row — across, down or diagonally — to win.',
    'With two opponents, every threat you make gets two chances to be blocked before you play again, so look for a move that makes two threats at once.',
    'Once every line of three holds marks from two different players, nobody can win and the game is a draw, even if squares are still empty.',
    'Who goes first moves one place along with each new game: Player 1, then 2, then 3.',
  ],
  // A game under way: each player has a few marks.
  preview: ['X..O', '.SX.', '.O..', 'S..S'],
}
