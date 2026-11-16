import { GridBoard } from '../../boards/GridBoard.tsx'
import { Mark } from '../../ui/Mark.tsx'
import type { BoardProps } from '../types.ts'
import type { HarvestMove, HarvestSelectors, HarvestState } from './rules.ts'

/**
 * Harvest's board: the shared grid at 5×5, with every line lighting up in its
 * player's colour as soon as it's made, and the running line count above it
 * (D-55). The player cards keep the session's score, so the count of lines in
 * this game lives here, in the board.
 */
export function HarvestBoard({ state, rules, onMove }: BoardProps<HarvestState, HarvestMove, HarvestSelectors>) {
  const legal = rules.legalMoves(state)
  const lines = rules.selectors.lineCounts(state)
  const count = (n: number) => (n === 1 ? '1 line' : `${n} lines`)

  return (
    <div className="flex w-[min(342px,100%)] flex-col items-center gap-3">
      {/* Polite, and always on the page, so screen readers hear each new line as it's made. */}
      <p className="flex items-center gap-4 text-[15px] font-semibold tabular-nums" aria-live="polite">
        <span className="flex items-center gap-1.5">
          <Mark player="X" size={16} stroke={3} />
          <span className="sr-only">Player 1: </span>
          {count(lines.X)}
        </span>
        <span className="flex items-center gap-1.5">
          <Mark player="O" size={16} stroke={3} />
          <span className="sr-only">Player 2: </span>
          {count(lines.O)}
        </span>
      </p>
      <GridBoard
        size={5}
        cells={rules.selectors.cells(state)}
        highlight={rules.selectors.lineSquares(state)}
        isPlayable={(index) => legal.includes(index)}
        onPlay={onMove}
      />
    </div>
  )
}
