import { findLine, type Cell } from '../../game/lines.ts'
import {
  IllegalMoveError,
  IN_PROGRESS,
  otherPlayer,
  type Outcome,
  type Player,
  type VariantRules,
} from '../../game/rules.ts'

/**
 * Ultimate tic-tac-toe: a 3×3 grid of small 3×3 boards. The square you play
 * in sends your opponent to the matching small board. Win a small board with
 * three in a row; win the game with three small boards in a row.
 *
 * Small boards and the squares inside them are both numbered 0–8, left to
 * right, top to bottom, like every 3×3 grid in the app.
 */
export interface UltimateState {
  /** All 81 squares, small board by small board: square `s` of board `b` is `cells[b * 9 + s]`. */
  readonly cells: readonly Cell[]
  readonly turn: Player
  /**
   * The small board the last move sent the player to move to, or null on the
   * first move. If that board is won or full, they may play in any open board.
   */
  readonly sentTo: number | null
}

/** One square: which small board (0–8), and which square inside it (0–8). */
export interface UltimateMove {
  readonly board: number
  readonly square: number
}

/** How a small board stands: won by a player, full with no winner, or still open. */
export type SmallBoardResult = Player | 'draw' | null

export interface UltimateSelectors {
  /** The nine squares of small board `board`. */
  smallBoard(state: UltimateState, board: number): readonly Cell[]
  /** Who won small board `board`, 'draw' if it filled with no winner, null while it is open. */
  smallBoardResult(state: UltimateState, board: number): SmallBoardResult
  /** The small boards the player to move may play in. Empty once the game is over. */
  allowedBoards(state: UltimateState): readonly number[]
}

const BOARDS: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8]

function smallBoard(state: UltimateState, board: number): readonly Cell[] {
  return state.cells.slice(board * 9, board * 9 + 9)
}

function smallBoardResult(state: UltimateState, board: number): SmallBoardResult {
  const cells = smallBoard(state, board)
  const found = findLine(cells)
  if (found) return found.winner
  return cells.includes(null) ? null : 'draw'
}

/** The big board as a 3×3 grid: each small board counts as its winner's mark, or as empty. */
function bigBoard(state: UltimateState): readonly Cell[] {
  return BOARDS.map((board) => {
    const result = smallBoardResult(state, board)
    return result === 'draw' ? null : result
  })
}

/** The boards open to the player to move, ignoring whether the game is over. */
function openBoards(state: UltimateState): readonly number[] {
  const open = BOARDS.filter((board) => smallBoardResult(state, board) === null)
  return state.sentTo !== null && open.includes(state.sentTo) ? [state.sentTo] : open
}

function outcome(state: UltimateState): Outcome {
  const found = findLine(bigBoard(state))
  if (found) return { kind: 'won', winner: found.winner, highlight: found.line }
  // Nobody has three boards in a row and every small board is won or full: no legal move remains.
  return openBoards(state).length === 0 ? { kind: 'draw' } : IN_PROGRESS
}

function allowedBoards(state: UltimateState): readonly number[] {
  return outcome(state).kind === 'in-progress' ? openBoards(state) : []
}

const isIndex = (n: number) => Number.isInteger(n) && n >= 0 && n <= 8

export const ultimateRules: VariantRules<UltimateState, UltimateMove, UltimateSelectors> = {
  initialState: (firstPlayer) => ({ cells: Array<Cell>(81).fill(null), turn: firstPlayer, sentTo: null }),

  currentPlayer: (state) => state.turn,

  legalMoves(state) {
    return allowedBoards(state).flatMap((board) =>
      smallBoard(state, board).flatMap((cell, square) => (cell === null ? [{ board, square }] : [])),
    )
  },

  applyMove(state, move) {
    if (outcome(state).kind !== 'in-progress') throw new IllegalMoveError('The game is over')
    const { board, square } = move
    if (!isIndex(board) || !isIndex(square)) throw new IllegalMoveError(`No square ${square} on board ${board}`)
    if (!openBoards(state).includes(board)) throw new IllegalMoveError(`Board ${board} can't be played in now`)
    const index = board * 9 + square
    if (state.cells[index] !== null) throw new IllegalMoveError(`Square ${square} on board ${board} is taken`)

    const cells = state.cells.with(index, state.turn)
    return { cells, turn: otherPlayer(state.turn), sentTo: square }
  },

  outcome,

  selectors: { smallBoard, smallBoardResult, allowedBoards },
}
