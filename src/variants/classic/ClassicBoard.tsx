import { GridBoard } from '../../boards/GridBoard.tsx'
import type { BoardProps } from '../types.ts'
import type { ClassicMove, ClassicSelectors, ClassicState } from './rules.ts'

export function ClassicBoard({ state, rules, onMove }: BoardProps<ClassicState, ClassicMove, ClassicSelectors>) {
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
