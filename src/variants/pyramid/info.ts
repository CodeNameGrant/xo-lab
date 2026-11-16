import type { VariantInfo } from '../types.ts'

export const pyramidInfo: VariantInfo = {
  name: 'Pyramid',
  players: 2,
  tagline: 'Nine squares stacked in a pyramid. Three in a row wins.',
  howToPlay: [
    'The board is a pyramid: one square on top, three in the middle and five at the base. Player 1 is X, Player 2 is O.',
    'Players take turns placing their mark in an empty square. Get three of your marks in a row to win.',
    'There are seven lines: across the middle row, three runs of three along the base, straight down the centre from the top, and down either sloping edge from the top to a corner of the base.',
    "If the board fills up and nobody has three in a row, it's a draw. Who goes first swaps with each new game.",
  ],
  // A space is a square that isn't there, so the picture keeps the pyramid's shape.
  preview: ['  X  ', ' OX. ', 'O.X..'],
}
