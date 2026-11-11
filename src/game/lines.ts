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

/** A line of three squares, by index. */
export type Line = readonly [number, number, number]

/**
 * Every line of three on a square grid `size` squares across, squares numbered
 * left to right, top to bottom: rows, then columns, then both diagonals.
 * A 5×5 grid has 48. On a 3×3 grid it gives the same lines as `LINES`.
 */
export function linesOfThree(size: number): readonly Line[] {
  const at = (row: number, column: number) => row * size + column
  const lines: Line[] = []
  const steps = [
    [0, 1], // across
    [1, 0], // down
    [1, 1], // diagonal, down-right
    [1, -1], // diagonal, down-left
  ] as const
  for (const [down, across] of steps) {
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        const endRow = row + 2 * down
        const endColumn = column + 2 * across
        if (endRow >= size || endColumn < 0 || endColumn >= size) continue
        lines.push([at(row, column), at(row + down, column + across), at(endRow, endColumn)])
      }
    }
  }
  return lines
}

/**
 * Whether any of `lines` could still be completed: it holds marks of at most
 * one player. When none can, nobody can ever win, so the game is a draw.
 */
export function anyLineOpen(cells: readonly Cell[], lines: readonly Line[]): boolean {
  return lines.some((line) => new Set(line.map((square) => cells[square]).filter((cell) => cell !== null)).size <= 1)
}

/** The first completed line on a 3×3 grid, if any. */
export function findLine(cells: readonly Cell[]): { winner: Player; line: readonly number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line
    const mark = cells[a]
    if (mark && mark === cells[b] && mark === cells[c]) return { winner: mark, line }
  }
  return null
}
