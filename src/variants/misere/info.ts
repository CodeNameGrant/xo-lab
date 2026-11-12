import type { VariantInfo } from '../types.ts'

export const misereInfo: VariantInfo = {
  name: 'Misère',
  players: 2,
  tagline: 'Classic, but inverted. Three in a row loses.',
  howToPlay: [
    'Players take turns placing their mark in an empty square. Player 1 is X, Player 2 is O.',
    "**Don't** get three in a row. If your move makes three of your marks in a row — across, down or diagonally — **you lose**, and the other player wins.",
    'You must place a mark every turn, even when every empty square would make three in a row for you.',
    "If the board fills up and nobody has three in a row, it's a draw. Who goes first swaps with each new game.",
  ],
  // Near the end: X is about to be forced to complete a line.
  preview: ['XOX', 'OOX', 'X..'],
}
