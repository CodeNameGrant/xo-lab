import { linesOfThree, type Cell } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type TwoPlayer,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * Wild: a 4×4 board where, on every turn, the player to move chooses whether
 * to place an X or an O. Whoever completes a line of three matching marks,
 * XXX or OOO, wins, whoever placed the rest of it. A full board with no line
 * is a draw.
 */
export interface WildState {
  /** The marks on the 16 squares, numbered 0–15 left to right, top to bottom. An X or O here says nothing about who placed it. */
  readonly cells: readonly Cell[]
  readonly turn: TwoPlayer
}

/** Which square (0–15) to mark, and with which mark. */
export interface WildMove {
  readonly square: number
  readonly mark: 'X' | 'O'
}

export interface WildSelectors {
  cells(state: WildState): readonly Cell[]
}

const MARKS = ['X', 'O'] as const
const SIZE = 4
/** Every line of three on the board: 8 across, 8 down and 8 diagonal. */
const LINES = linesOfThree(SIZE)

function outcome(state: WildState): Outcome {
  const found = LINES.find(
    ([a, b, c]) => state.cells[a] && state.cells[a] === state.cells[b] && state.cells[a] === state.cells[c],
  )
  // Only the player who just moved can have completed a line, whichever mark it is.
  if (found) return { kind: 'won', winner: otherPlayer(state.turn), highlight: found }
  if (state.cells.every((cell) => cell !== null)) return { kind: 'draw' }
  return IN_PROGRESS
}

export const wildRules: VariantRules<WildState, WildMove, WildSelectors> = {
  // A two-player variant is only ever started by X or O.
  initialState: (firstPlayer) => ({
    cells: Array<Cell>(SIZE * SIZE).fill(null),
    turn: firstPlayer === 'O' ? 'O' : 'X',
  }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    return state.cells.flatMap((cell, square) => (cell === null ? MARKS.map((mark) => ({ square, mark })) : []))
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    const { square, mark } = move
    if (!Number.isInteger(square) || square < 0 || square >= SIZE * SIZE)
      throw new IllegalMoveError(`No square ${square}`)
    if (mark !== 'X' && mark !== 'O') throw new IllegalMoveError(`No mark ${String(mark)}`)
    if (state.cells[square] !== null) throw new IllegalMoveError(`Square ${square} is taken`)
    return { cells: state.cells.with(square, mark), turn: otherPlayer(state.turn) }
  },

  outcome,

  selectors: {
    cells: (state) => state.cells,
  },
}
