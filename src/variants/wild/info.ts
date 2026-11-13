import type { VariantInfo } from '../types.ts'

export const wildInfo: VariantInfo = {
  name: 'Wild',
  players: 2,
  sharedMarks: { marks: ['X', 'O'], detail: 'X or O' },
  tagline: 'A 4×4 board. Play X or O, your choice. Any three in a row wins.',
  howToPlay: [
    'The board is 4×4. On your turn, tap an empty square, then choose X or O. Either player can place either symbol, every turn.',
    'Complete a line of three matching symbols, **XXX or OOO**, across, down or diagonally, and **you win**, even if the other player placed most of them.',
    'So watch both symbols: two matching symbols in a line with the third square empty are a win for whoever moves next. Try not to leave one behind.',
    "If the board fills up with no line, it's a draw. Who goes first swaps with each new game.",
  ],
  // X's and O's in one colour: nobody owns a symbol.
  preview: ['XO..', '.OX.', 'X..O', '..X.'],
}
