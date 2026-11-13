import { LINES } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type TwoPlayer,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * Notakto: three 3×3 boards, and both players place an X; nobody owns a
 * mark. Completing a line on a board kills it, and nobody plays there again.
 * Whoever kills the last live board loses, so the winner is their opponent.
 * There are no draws: a 3×3 board full of X's always holds a line.
 */
export interface NotaktoState {
  /** The 27 squares, board by board: board 0 is squares 0–8, board 1 is 9–17, board 2 is 18–26. True holds an X. */
  readonly marks: readonly boolean[]
  /** Who killed each board, or null while it is live. */
  readonly killedBy: readonly (TwoPlayer | null)[]
  readonly turn: TwoPlayer
}

/** The square (0–26) to put an X on: board × 9 + the square on that board (0–8). */
export type NotaktoMove = number

export interface NotaktoSelectors {
  /** Whether each of the 27 squares holds an X. */
  marks(state: NotaktoState): readonly boolean[]
  /** Who killed the board (0–2), or null while it is live. */
  killedBy(state: NotaktoState, board: number): TwoPlayer | null
  /** The squares (0–8) of the board's completed lines: empty while it is live. */
  completedLine(state: NotaktoState, board: number): readonly number[]
}

export const BOARDS = 3

/** The squares (0–8) of every completed line on one board, in order. */
function completedLine(marks: readonly boolean[], board: number): number[] {
  const on = (square: number) => marks[board * 9 + square]
  const squares = LINES.filter((line) => line.every(on)).flat()
  return [...new Set(squares)].sort((a, b) => a - b)
}

function outcome(state: NotaktoState): Outcome {
  if (state.killedBy.some((killer) => killer === null)) return IN_PROGRESS
  // Every board is dead, so the player who just moved killed the last one, and loses.
  const loser = otherPlayer(state.turn)
  const last = state.killedBy.lastIndexOf(loser)
  return {
    kind: 'won',
    winner: state.turn,
    highlight: completedLine(state.marks, last).map((square) => last * 9 + square),
  }
}

export const notaktoRules: VariantRules<NotaktoState, NotaktoMove, NotaktoSelectors> = {
  initialState: (firstPlayer) => ({
    marks: Array<boolean>(BOARDS * 9).fill(false),
    killedBy: Array<TwoPlayer | null>(BOARDS).fill(null),
    // A two-player variant is only ever started by X or O.
    turn: firstPlayer === 'O' ? 'O' : 'X',
  }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    return state.marks.flatMap((mark, square) =>
      !mark && state.killedBy[Math.floor(square / 9)] === null ? [square] : [],
    )
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    if (!Number.isInteger(move) || move < 0 || move >= BOARDS * 9) throw new IllegalMoveError(`No square ${move}`)
    const board = Math.floor(move / 9)
    if (state.killedBy[board] !== null) throw new IllegalMoveError(`Board ${board} is dead`)
    if (state.marks[move]) throw new IllegalMoveError(`Square ${move} is taken`)

    const marks = state.marks.with(move, true)
    const killed = completedLine(marks, board).length > 0
    return {
      marks,
      killedBy: killed ? state.killedBy.with(board, state.turn) : state.killedBy,
      turn: otherPlayer(state.turn),
    }
  },

  outcome,

  selectors: {
    marks: (state) => state.marks,
    killedBy: (state, board) => state.killedBy[board],
    completedLine: (state, board) => completedLine(state.marks, board),
  },
}
