import type { Cell, Line } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type TwoPlayer,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * Pyramid: nine squares in three centred rows, one on top, three in the
 * middle and five at the base. Squares are numbered top to bottom, left to
 * right:
 *
 *         0
 *      1  2  3
 *   4  5  6  7  8
 *
 * The first to three in a row wins, along one of the seven lines below. A
 * full board with no line is a draw.
 */
export interface PyramidState {
  readonly cells: readonly Cell[]
  readonly turn: TwoPlayer
}

/** The square (0–8) to mark. */
export type PyramidMove = number

export interface PyramidSelectors {
  cells(state: PyramidState): readonly Cell[]
}

/** The seven lines of three: four across, the centre column and the two edges (D-54). */
export const PYRAMID_LINES: readonly Line[] = [
  [1, 2, 3],
  [4, 5, 6],
  [5, 6, 7],
  [6, 7, 8],
  [0, 2, 6],
  [0, 1, 4],
  [0, 3, 8],
]

const SQUARES = 9

function outcome(state: PyramidState): Outcome {
  for (const line of PYRAMID_LINES) {
    const mark = state.cells[line[0]]
    if (mark && line.every((square) => state.cells[square] === mark)) {
      return { kind: 'won', winner: mark, highlight: line }
    }
  }
  return state.cells.every((cell) => cell !== null) ? { kind: 'draw' } : IN_PROGRESS
}

export const pyramidRules: VariantRules<PyramidState, PyramidMove, PyramidSelectors> = {
  // A two-player variant is only ever started by X or O.
  initialState: (firstPlayer) => ({
    cells: Array<Cell>(SQUARES).fill(null),
    turn: firstPlayer === 'O' ? 'O' : 'X',
  }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    return state.cells.flatMap((cell, square) => (cell === null ? [square] : []))
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    if (!Number.isInteger(move) || move < 0 || move >= SQUARES) throw new IllegalMoveError(`No square ${move}`)
    if (state.cells[move] !== null) throw new IllegalMoveError(`Square ${move} is taken`)
    return { cells: state.cells.with(move, state.turn), turn: otherPlayer(state.turn) }
  },

  outcome,

  selectors: {
    cells: (state) => state.cells,
  },
}
