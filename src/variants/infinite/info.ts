import type { VariantInfo } from '../types.ts'

export const infiniteInfo: VariantInfo = {
  name: 'Infinite',
  tagline: 'Three marks each. Place a fourth and your oldest disappears.',
  howToPlay: [
    'Players take turns placing their mark in an empty square. Player 1 is X, Player 2 is O.',
    'Get three of your marks in a row — across, down or diagonally — to win.',
    'Each player can have only three marks on the board. When you place your fourth, your oldest mark disappears. It fades during your turn, so you can see which one will go.',
    'A move that makes three in a row wins straight away, even if it uses the mark that was about to disappear.',
    'A square that has just been freed can be played by either player, on the very next move.',
    'There are no draws: the game goes on until someone wins. Who goes first swaps with each new game.',
  ],
  preview: ['XO.', '.X.', 'O.O'],
}
