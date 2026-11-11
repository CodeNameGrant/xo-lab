import type { VariantInfo } from '../types.ts'

export const shiftInfo: VariantInfo = {
  name: 'Shift',
  tagline: 'A 3×3 board that slides over a 5×5 field. Place a mark, or move the board.',
  howToPlay: [
    'The game is a 3×3 board laid over a bigger 5×5 field. Player 1 is X, Player 2 is O.',
    'On your turn, do one of two things: place your mark on an empty square inside the 3×3 board, or move the board one step in any direction, diagonals included. To move it, drag its grid lines. The board always stays on the field.',
    'Marks stay where they were placed. Only marks inside the board count; marks left outside are faded, and count again when the board moves back over them.',
    'Get three of your marks in a row inside the board to win. Moving the board onto three in a row wins too.',
    'If moving the board makes three in a row for both players at once, the game is a draw. It is also a draw once every line on the field holds marks of both players, because nobody can win. Who goes first swaps with each new game.',
  ],
  // The field with the board in the centre: a few marks inside, one left outside.
  preview: ['X....', '.O...', '..X..', '...O.', '.....'],
}
