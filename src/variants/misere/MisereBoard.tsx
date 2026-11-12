import { GridBoard } from '../../boards/GridBoard.tsx'
import type { BoardProps } from '../types.ts'
import type { MisereMove, MisereSelectors, MisereState } from './rules.ts'

/**
 * Misère's board: the shared 3×3 grid. The completed line keeps the colour
 * of the player who made it, the loser: it marks "this player completed a
 * line", and in Misère that loses (D-40).
 */
export function MisereBoard({ state, rules, onMove }: BoardProps<MisereState, MisereMove, MisereSelectors>) {
  const legal = rules.legalMoves(state)
  const outcome = rules.outcome(state)
  return (
    <GridBoard
      cells={rules.selectors.cells(state)}
      highlight={outcome.kind === 'won' ? outcome.highlight : []}
      isPlayable={(index) => legal.includes(index)}
      onPlay={onMove}
    />
  )
}
