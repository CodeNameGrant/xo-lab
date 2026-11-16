import type { VariantInfo } from '../types.ts'

export const harvestInfo: VariantInfo = {
  name: 'Harvest',
  players: 2,
  tagline: 'A 5×5 board and 12 marks each. Make the most lines of three.',
  howToPlay: [
    'Players take turns placing their mark in an empty square of the 5×5 board. Player 1 is X, Player 2 is O.',
    "A line of three doesn't end the game. Play goes on for **24 moves**, 12 each, so one square is left empty at the end.",
    'Every line of three of your marks counts, across, down or diagonally, even when lines share marks: four in a row is 2 lines, and five in a row is 3. Your lines light up as you make them, and the count sits above the board.',
    'Whoever has more lines after the last move **wins**. Equal counts are a draw. Who goes first swaps with each new game.',
  ],
  // Mid-game: a line for each player, and more to come.
  preview: ['XXX.O', '.OO.O', 'X.O..', '.X..X', 'O...X'],
}
