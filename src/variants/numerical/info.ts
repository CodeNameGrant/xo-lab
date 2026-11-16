import type { VariantInfo } from '../types.ts'

export const numericalInfo: VariantInfo = {
  name: 'Numerical',
  players: 2,
  numberSides: {
    starter: { sample: [1, 3], detail: 'Odd numbers' },
    other: { sample: [2, 4], detail: 'Even numbers' },
  },
  tagline: 'Odds against evens. Make a line add up to 15.',
  howToPlay: [
    'The board is 3×3, and the pieces are the numbers 1 to 9, each used once. Whoever starts plays the odd numbers, 1, 3, 5, 7 and 9; the other player plays the even ones, 2, 4, 6 and 8. Odd and even swap with each new game, as the first move does.',
    'On your turn, tap an empty square, then choose one of your numbers left.',
    'When a line of three, across, down or diagonally, is full and adds up to **exactly 15**, whoever placed its last number **wins**, even if most of it is the other player’s numbers. A full line with any other total counts for nothing.',
    "If the board fills up with no line of 15, it's a draw.",
  ],
  // A game under way: 8 + 1 + 6 already makes 15 down the left side.
  preview: ['8.4', '1.3', '6..'],
}
