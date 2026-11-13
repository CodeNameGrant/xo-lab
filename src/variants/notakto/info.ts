import type { VariantInfo } from '../types.ts'

export const notaktoInfo: VariantInfo = {
  name: 'Notakto',
  players: 2,
  sharedMarks: { marks: ['X'], detail: 'Crosses' },
  // A board full of X's always holds a line, so someone always kills the last board.
  canDraw: false,
  tagline: "Three boards, and everyone plays X. Don't make the last line.",
  howToPlay: [
    "There are three boards, and both players place an X. There are no O's: every X counts for both of you.",
    'On your turn, place an X in an empty square on any live board.',
    'When three X’s line up on a board, across, down or diagonally, that board is dead and nobody can play on it again. The line shows in the colour of the player who made it.',
    "Whoever kills the **last** live board **loses**, and the other player wins. Killing an earlier board doesn't lose; it just takes that board out of play.",
    'A board full of X’s always has a line, so there are no draws. Who goes first swaps with each new game.',
  ],
  // One board of X's only: nobody owns a mark.
  preview: ['X.X', '.X.', 'X..'],
}
