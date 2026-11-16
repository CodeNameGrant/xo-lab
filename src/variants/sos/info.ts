import type { VariantInfo } from '../types.ts'

export const sosInfo: VariantInfo = {
  name: 'SOS',
  players: 2,
  sharedMarks: { letters: ['S', 'O'], detail: 'S or O' },
  extraTurns: true,
  tagline: 'S or O, your choice. Spell SOS to score, and score to go again.',
  howToPlay: [
    'The board is 6×6. On your turn, pick up S or O from the tray above the board, then tap an empty square to write it. Either player can write either letter.',
    'Spell **S-O-S** in a line of three, across, down or diagonally, and it scores for you, even if the other player wrote the rest. One letter can spell several SOSs, and each one counts. Your SOSs are struck through in your colour.',
    'Score, and you **go again** straight away. The tray stays in your colour while it’s still your turn.',
    'When the board is full, the most SOSs wins. Equal counts are a draw. Who goes first swaps with each new game.',
  ],
  // An SOS across the top, and letters still to come.
  preview: ['sos.o.', '.o..s.', 'o.s...', '...o.s', '.s....', 'o...s.'],
}
