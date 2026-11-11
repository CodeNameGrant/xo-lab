import { anyLineOpen, linesOfThree, type Cell } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  nextPlayer,
  type Outcome,
  type Player,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * Trio: three players on a 4×4 board, taking turns Player 1 (X) → Player 2
 * (O) → Player 3 (★). The first to get three in a row, across, down or
 * diagonally, wins. The game is a draw as soon as no line of three can be
 * won by anyone (every line holds marks of two or more players), even
 * before the board is full.
 */
export interface TrioState {
  /** The 16 squares, numbered 0–15 left to right, top to bottom. */
  readonly cells: readonly Cell[]
  readonly turn: Player
}

/** The index (0–15) of the square to mark. */
export type TrioMove = number

export interface TrioSelectors {
  cells(state: TrioState): readonly Cell[]
}

const SIZE = 4
const PLAYERS = 3
/** Every line of three on the board: 8 across, 8 down and 8 diagonal. */
const LINES = linesOfThree(SIZE)

function outcome(state: TrioState): Outcome {
  for (const line of LINES) {
    const mark = state.cells[line[0]]
    if (mark && line.every((square) => state.cells[square] === mark)) {
      return { kind: 'won', winner: mark, highlight: line }
    }
  }
  return anyLineOpen(state.cells, LINES) ? IN_PROGRESS : { kind: 'draw' }
}

export const trioRules: VariantRules<TrioState, TrioMove, TrioSelectors> = {
  initialState: (firstPlayer) => ({ cells: Array<Cell>(SIZE * SIZE).fill(null), turn: firstPlayer }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    return state.cells.flatMap((cell, square) => (cell === null ? [square] : []))
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    if (!Number.isInteger(move) || move < 0 || move >= SIZE * SIZE) throw new IllegalMoveError(`No square ${move}`)
    if (state.cells[move] !== null) throw new IllegalMoveError(`Square ${move} is taken`)
    return { cells: state.cells.with(move, state.turn), turn: nextPlayer(state.turn, PLAYERS) }
  },

  outcome,

  selectors: {
    cells: (state) => state.cells,
  },
}
