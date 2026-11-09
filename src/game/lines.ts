import type { Player } from './rules.ts'

/** A 3×3 grid's cells, numbered 0–8 left to right, top to bottom. */
export type Cell = Player | null

/** The 8 lines of three on a 3×3 grid: 3 rows, 3 columns, 2 diagonals. */
export const LINES: readonly (readonly [number, number, number])[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

/** The first completed line on a 3×3 grid, if any. */
export function findLine(cells: readonly Cell[]): { winner: Player; line: readonly number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line
    const mark = cells[a]
    if (mark && mark === cells[b] && mark === cells[c]) return { winner: mark, line }
  }
  return null
}
