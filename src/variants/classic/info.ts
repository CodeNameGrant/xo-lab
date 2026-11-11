import type { VariantInfo } from '../types.ts'

export const classicInfo: VariantInfo = {
  name: 'Classic',
  players: 2,
  tagline: 'The original 3×3 game. Three in a row wins.',
  howToPlay: [
    'Players take turns placing their mark in an empty square. Player 1 is X, Player 2 is O.',
    'Get three of your marks in a row — across, down or diagonally — to win.',
    'If all nine squares fill up and nobody has three in a row, the game is a draw.',
    'Who goes first swaps with each new game.',
  ],
  preview: ['X.O', '.X.', 'O.X'],
}
