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
 * Numerical tic-tac-toe, Ronald Graham's game: a 3×3 board and the numbers 1
 * to 9, each used once. The starter plays the odd numbers (1, 3, 5, 7, 9) and
 * the other player the even ones (2, 4, 6, 8), so odd and even swap with
 * each new game, as the starter does (D-57). When a line of three is full and
 * adds up to exactly 15, whoever completed it wins, whoever placed the rest.
 * A full board with no line of 15 is a draw.
 */
export interface NumericalState {
  /** The numbers on the 9 squares, numbered 0–8 left to right, top to bottom. */
  readonly cells: readonly (number | null)[]
  /** Who plays the odd numbers this game: the starter. */
  readonly odd: TwoPlayer
  readonly turn: TwoPlayer
}

/** Place `number` (1–9, one of your own) on `square` (0–8). */
export interface NumericalMove {
  readonly square: number
  readonly number: number
}

export interface NumericalSelectors {
  cells(state: NumericalState): readonly (number | null)[]
  /** The player who owns `number` this game: the odd player for an odd number. */
  owner(state: NumericalState, number: number): TwoPlayer
  /** A player's numbers for this game, in order. */
  numbersOf(state: NumericalState, player: TwoPlayer): readonly number[]
  /** A player's numbers that haven't been placed yet, in order. */
  numbersLeft(state: NumericalState, player: TwoPlayer): readonly number[]
}

/** What a full line must add up to. */
export const TARGET = 15
const ODDS = [1, 3, 5, 7, 9]
const EVENS = [2, 4, 6, 8]

function owner(state: NumericalState, number: number): TwoPlayer {
  return number % 2 === 1 ? state.odd : otherPlayer(state.odd)
}

function numbersOf(state: NumericalState, player: TwoPlayer): number[] {
  return player === state.odd ? ODDS : EVENS
}

function numbersLeft(state: NumericalState, player: TwoPlayer): number[] {
  return numbersOf(state, player).filter((number) => !state.cells.includes(number))
}

function outcome(state: NumericalState): Outcome {
  const line = LINES.find((squares) => {
    const numbers = squares.map((square) => state.cells[square])
    return (
      numbers.every((number) => number !== null) && numbers.reduce<number>((sum, n) => sum + (n ?? 0), 0) === TARGET
    )
  })
  // Only the player who just moved can have completed a line, whoever placed the rest of it.
  if (line) return { kind: 'won', winner: otherPlayer(state.turn), highlight: line }
  return state.cells.every((cell) => cell !== null) ? { kind: 'draw' } : IN_PROGRESS
}

export const numericalRules: VariantRules<NumericalState, NumericalMove, NumericalSelectors> = {
  initialState: (firstPlayer) => {
    // A two-player variant is only ever started by X or O. The starter plays the odd numbers.
    const starter = firstPlayer === 'O' ? 'O' : 'X'
    return { cells: Array<number | null>(9).fill(null), odd: starter, turn: starter }
  },

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    if (outcome(state).kind !== 'in-progress') return []
    const numbers = numbersLeft(state, state.turn)
    return state.cells.flatMap((cell, square) => (cell === null ? numbers.map((number) => ({ square, number })) : []))
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    const { square, number } = move
    if (!Number.isInteger(square) || square < 0 || square > 8) throw new IllegalMoveError(`No square ${square}`)
    if (state.cells[square] !== null) throw new IllegalMoveError(`Square ${square} is taken`)
    if (!numbersOf(state, state.turn).includes(number)) {
      throw new IllegalMoveError(`${String(number)} isn't one of the numbers of the player to move`)
    }
    if (state.cells.includes(number)) throw new IllegalMoveError(`${number} has already been placed`)
    return { ...state, cells: state.cells.with(square, number), turn: otherPlayer(state.turn) }
  },

  outcome,

  selectors: {
    cells: (state) => state.cells,
    owner,
    numbersOf,
    numbersLeft,
  },
}
