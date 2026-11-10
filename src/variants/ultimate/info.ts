import type { VariantInfo } from '../types.ts'

export const ultimateInfo: VariantInfo = {
  name: 'Ultimate',
  tagline: 'Nine boards in one. Where you play decides where your opponent plays next.',
  howToPlay: [
    'The board is nine small tic-tac-toe boards, set out in a 3×3 grid. Player 1 is X, Player 2 is O.',
    'The first move can go in any square. After that, the square you play in sends your opponent to the matching small board: play the top-right square of any small board, and they must play in the top-right board. The boards you can play in are outlined in your colour.',
    "Get three in a row inside a small board to win it. A won board shows the winner's mark and takes no more moves. A board that fills up with no winner counts for nobody.",
    'If you are sent to a board that is already won or full, you can play in any open board.',
    'Win three small boards in a row — across, down or diagonally — to win the game. If no moves are left and nobody has, the game is a draw.',
    'Who goes first swaps with each new game.',
  ],
  // The big board: two small boards won by each player, the rest still open.
  preview: ['X.O', '.X.', 'O..'],
}
