import { linesOfThree, type Cell, type Line } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type TwoPlayer,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * Harvest: a 5×5 board where a line of three doesn't end the game. Players
 * take 24 turns, 12 each, so one square is left empty, and whoever has made
 * more lines of three wins; equal counts are a draw. Every distinct line of
 * three counts, even when lines share marks: a run of four scores 2 and a run
 * of five scores 3.
 */
export interface HarvestState {
  /** The 25 squares, numbered 0–24 left to right, top to bottom. */
  readonly cells: readonly Cell[]
  readonly turn: TwoPlayer
}

/** The square (0–24) to mark. */
export type HarvestMove = number

export interface HarvestSelectors {
  cells(state: HarvestState): readonly Cell[]
  /** How many lines of three each player has made so far. */
  lineCounts(state: HarvestState): { readonly X: number; readonly O: number }
  /** Every square that is part of a line, in order: what lights up as lines are made. */
  lineSquares(state: HarvestState): readonly number[]
}

const SIZE = 5
/** The game ends after this many moves, 12 each, leaving one square empty. */
export const MOVES = 24
/** Every line of three on the board: 48 of them (D-55). */
const LINES = linesOfThree(SIZE)

/** Every line made so far, by either player. */
function madeLines(cells: readonly Cell[]): Line[] {
  return LINES.filter(([a, b, c]) => cells[a] !== null && cells[a] === cells[b] && cells[a] === cells[c])
}

function lineCounts(state: HarvestState) {
  const lines = madeLines(state.cells)
  return {
    X: lines.filter(([a]) => state.cells[a] === 'X').length,
    O: lines.filter(([a]) => state.cells[a] === 'O').length,
  }
}

function lineSquares(state: HarvestState): number[] {
  return [...new Set(madeLines(state.cells).flat())].sort((a, b) => a - b)
}

function outcome(state: HarvestState): Outcome {
  if (state.cells.filter((cell) => cell !== null).length < MOVES) return IN_PROGRESS
  const { X, O } = lineCounts(state)
  if (X === O) return { kind: 'draw' }
  return { kind: 'won', winner: X > O ? 'X' : 'O', highlight: lineSquares(state) }
}

export const harvestRules: VariantRules<HarvestState, HarvestMove, HarvestSelectors> = {
  // A two-player variant is only ever started by X or O.
  initialState: (firstPlayer) => ({
    cells: Array<Cell>(SIZE * SIZE).fill(null),
    turn: firstPlayer === 'O' ? 'O' : 'X',
  }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    return state.cells.flatMap((cell, square) => (cell === null ? [square] : []))
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    if (!Number.isInteger(move) || move < 0 || move >= SIZE * SIZE) throw new IllegalMoveError(`No square ${move}`)
    if (state.cells[move] !== null) throw new IllegalMoveError(`Square ${move} is taken`)
    return { cells: state.cells.with(move, state.turn), turn: otherPlayer(state.turn) }
  },

  outcome,

  selectors: {
    cells: (state) => state.cells,
    lineCounts,
    lineSquares,
  },
}
