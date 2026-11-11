import { GridBoard } from '../../boards/GridBoard.tsx'
import type { BoardProps } from '../types.ts'
import type { TrioMove, TrioSelectors, TrioState } from './rules.ts'

/** Trio's board: the shared grid at 4×4. Player 3's star and gold tint come from the shared pieces and theme. */
export function TrioBoard({ state, rules, onMove }: BoardProps<TrioState, TrioMove, TrioSelectors>) {
  const outcome = rules.outcome(state)
  const legal = rules.legalMoves(state)
  return (
    <GridBoard
      size={4}
      cells={rules.selectors.cells(state)}
      highlight={outcome.kind === 'won' ? outcome.highlight : []}
      isPlayable={(index) => legal.includes(index)}
      onPlay={onMove}
    />
  )
}
