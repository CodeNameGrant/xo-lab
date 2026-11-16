import type { VariantInfo } from '../types.ts'

export const marchInfo: VariantInfo = {
  name: 'March',
  players: 2,
  tagline: 'Four pieces each on a 4×4 board. March three into a row.',
  howToPlay: [
    'Each player starts with four pieces, already on the board: Player 1’s X’s and Player 2’s O’s alternate along the top and bottom rows, facing each other. Nothing is ever placed.',
    'On your turn, move one of your pieces **one square up, down, left or right** into an empty square. No diagonal moves, and no jumping over pieces.',
    'Tap one of your pieces to pick it up: dots show where it can go. Tap a dot to move there, tap another of your pieces to switch, or tap anywhere else to put it down.',
    'Get **three of your pieces in a row**, across, down or diagonally, to win. If the player to move has no move at all, the game is a draw. Who goes first swaps with each new game.',
  ],
  // The starting position.
  preview: ['XOXO', '....', '....', 'OXOX'],
}
