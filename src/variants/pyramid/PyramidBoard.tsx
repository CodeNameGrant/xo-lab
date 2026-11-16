import { boardTile } from '../../ui/classes.ts'
import { Mark } from '../../ui/Mark.tsx'
import type { BoardProps } from '../types.ts'
import type { PyramidMove, PyramidSelectors, PyramidState } from './rules.ts'

/**
 * Where each square sits in a 5-wide, 3-tall grid: the apex over the middle,
 * three squares under it, five at the base. Rows and columns count from 1,
 * as the squares' labels read them.
 */
const PLACES = [
  { row: 1, column: 3 },
  { row: 2, column: 2 },
  { row: 2, column: 3 },
  { row: 2, column: 4 },
  { row: 3, column: 1 },
  { row: 3, column: 2 },
  { row: 3, column: 3 },
  { row: 3, column: 4 },
  { row: 3, column: 5 },
] as const

/** Grid placement for each row and column. Written out in full so Tailwind finds every class. */
const ROW = { 1: 'row-start-1', 2: 'row-start-2', 3: 'row-start-3' } as const
const COLUMN = { 1: 'col-start-1', 2: 'col-start-2', 3: 'col-start-3', 4: 'col-start-4', 5: 'col-start-5' } as const

/**
 * Pyramid's board: nine tiles stacked 1, 3 and 5 in a 5-wide grid, so the
 * base sets the size. On the 390 px phone each square is about 62 px, 8 px
 * apart. The completed line is highlighted as on the 3×3 board.
 */
export function PyramidBoard({ state, rules, onMove }: BoardProps<PyramidState, PyramidMove, PyramidSelectors>) {
  const cells = rules.selectors.cells(state)
  const legal = rules.legalMoves(state)
  const outcome = rules.outcome(state)
  const highlight = outcome.kind === 'won' ? outcome.highlight : []

  return (
    <div className="grid w-[min(342px,100%)] grid-cols-5 grid-rows-3 gap-2" role="group" aria-label="Board">
      {cells.map((cell, square) => {
        const { row, column } = PLACES[square]
        const playable = legal.includes(square)
        return (
          <button
            key={square}
            type="button"
            className={`aspect-square ${boardTile} ${ROW[row]} ${COLUMN[column]}`}
            data-win={(highlight.includes(square) && cell) || undefined}
            aria-label={`Row ${row}, column ${column}, ${cell ?? 'empty'}`}
            // aria-disabled (not disabled) keeps every square reachable for screen readers.
            aria-disabled={!playable}
            onClick={() => playable && onMove(square)}
          >
            {cell && <Mark player={cell} size={40} className="size-2/3 max-h-10 max-w-10 motion-safe:animate-place" />}
          </button>
        )
      })}
    </div>
  )
}
