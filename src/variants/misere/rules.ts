import { LINES, type Cell } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type TwoPlayer,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * Misère: Classic's 3×3 board and turns, upside down. Whoever makes a
 * completed line (three of their own marks in a row) loses, so the winner
 * is their opponent. A full board with no completed line is a draw.
 */
export interface MisereState {
  readonly cells: readonly Cell[]
  readonly turn: TwoPlayer
}

/** The index (0–8) of the square to mark. */
export type MisereMove = number

export interface MisereSelectors {
  cells(state: MisereState): readonly Cell[]
}

function outcome(state: MisereState): Outcome {
  // Every square of every completed line: one move can complete two lines at once.
  const completed = LINES.filter(
    ([a, b, c]) => state.cells[a] && state.cells[a] === state.cells[b] && state.cells[a] === state.cells[c],
  )
  // Only the player who just moved can have completed a line, so every completed line is theirs.
  const loser = completed.length > 0 ? state.cells[completed[0][0]] : null
  if (loser) {
    const squares = [...new Set(completed.flat())].sort((a, b) => a - b)
    return { kind: 'won', winner: otherPlayer(loser), highlight: squares }
  }
  if (state.cells.every((cell) => cell !== null)) return { kind: 'draw' }
  return IN_PROGRESS
}

export const misereRules: VariantRules<MisereState, MisereMove, MisereSelectors> = {
  // A two-player variant is only ever started by X or O.
  initialState: (firstPlayer) => ({ cells: Array<Cell>(9).fill(null), turn: firstPlayer === 'O' ? 'O' : 'X' }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    return state.cells.flatMap((cell, square) => (cell === null ? [square] : []))
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    if (!Number.isInteger(move) || move < 0 || move > 8) throw new IllegalMoveError(`No square ${move}`)
    if (state.cells[move] !== null) throw new IllegalMoveError(`Square ${move} is taken`)
    return { cells: state.cells.with(move, state.turn), turn: otherPlayer(state.turn) }
  },

  outcome,

  selectors: {
    cells: (state) => state.cells,
  },
}
