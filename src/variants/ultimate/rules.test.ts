import { describe, expect, it } from 'vitest'
import { IllegalMoveError } from '../../game/rules.ts'
import { ultimateRules as rules, type UltimateMove } from './rules.ts'

/** A move written as [small board, square], both numbered 0–8 left to right, top to bottom. */
type Step = readonly [board: number, square: number]

const move = ([board, square]: Step): UltimateMove => ({ board, square })

/** Plays `steps` from a fresh game where X (Player 1) moves first. */
function play(...steps: Step[]) {
  return steps.map(move).reduce(rules.applyMove, rules.initialState('X'))
}

/** One small board's contents as three rows, e.g. "XO.", "...", "..X". */
function smallBoard(steps: Step[], board: number) {
  const text = rules.selectors
    .smallBoard(play(...steps), board)
    .map((cell) => cell ?? '.')
    .join('')
  return [text.slice(0, 3), text.slice(3, 6), text.slice(6, 9)]
}

const results = (steps: Step[]) =>
  [0, 1, 2, 3, 4, 5, 6, 7, 8].map((board) => rules.selectors.smallBoardResult(play(...steps), board))

const ALL_BOARDS = [0, 1, 2, 3, 4, 5, 6, 7, 8]

/**
 * X wins the top-left board (0) with its top row. Each X move there sends O to
 * board 1 or 2, and O answers in that board's square 0, which sends X back to board 0.
 */
const X_WINS_TOP_LEFT: Step[] = [
  [0, 1],
  [1, 0],
  [0, 2],
  [2, 0],
  [0, 0],
]

/**
 * The centre board (4) fills up with no winner:
 *   X O X
 *   X O O
 *   O X X
 * Between moves in the centre, the players trade moves through the other boards' centre
 * squares, which send play back to board 4. X's last move there sends O to board 8, and
 * O plays its centre square, sending X to the full board 4.
 */
const CENTRE_FILLS: Step[] = [
  [4, 0], [0, 0], [0, 4],
  [4, 1], [1, 7], [7, 4],
  [4, 2], [2, 6], [6, 4],
  [4, 4],
  [4, 3], [3, 5], [5, 4],
  [4, 5], [5, 3], [3, 4],
  [4, 7], [7, 2], [2, 4],
  [4, 6], [6, 1], [1, 4],
  [4, 8], [8, 4],
] // prettier-ignore

describe('Ultimate', () => {
  it('starts empty, with the chosen player to move', () => {
    expect(rules.currentPlayer(rules.initialState('O'))).toBe('O')
    expect(rules.outcome(rules.initialState('X'))).toEqual({ kind: 'in-progress' })
    expect(results([])).toEqual([null, null, null, null, null, null, null, null, null])
  })

  it('the first move may go in any of the 81 squares', () => {
    const start = rules.initialState('X')
    expect(rules.selectors.allowedBoards(start)).toEqual(ALL_BOARDS)
    expect(rules.legalMoves(start)).toHaveLength(81)
  })

  it('the square played sends the opponent to the matching small board', () => {
    // X plays the top-right square (2) of the centre board, so O must play in the top-right board.
    const state = play([4, 2])
    expect(rules.currentPlayer(state)).toBe('O')
    expect(rules.selectors.allowedBoards(state)).toEqual([2])
    expect(rules.legalMoves(state)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8].map((square) => ({ board: 2, square })))
    expect(() => rules.applyMove(state, { board: 5, square: 0 })).toThrow(IllegalMoveError)
    // O plays the centre square of board 2, which sends X back to the centre board.
    expect(rules.selectors.allowedBoards(play([4, 2], [2, 4]))).toEqual([4])
  })

  it('a centre square sends the opponent to the same board it was played in', () => {
    expect(rules.selectors.allowedBoards(play([4, 4]))).toEqual([4])
  })

  it('a taken square, or one off the board, is rejected', () => {
    expect(() => rules.applyMove(play([4, 4]), { board: 4, square: 4 })).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(rules.initialState('X'), { board: 9, square: 0 })).toThrow(IllegalMoveError)
    expect(() => rules.applyMove(rules.initialState('X'), { board: 0, square: -1 })).toThrow(IllegalMoveError)
  })

  it('three in a row inside a small board wins it for that player', () => {
    expect(smallBoard(X_WINS_TOP_LEFT, 0)).toEqual(['XXX', '...', '...'])
    expect(results(X_WINS_TOP_LEFT)).toEqual(['X', null, null, null, null, null, null, null, null])
    expect(rules.outcome(play(...X_WINS_TOP_LEFT))).toEqual({ kind: 'in-progress' })
  })

  it('sent to a won board, the player may play in any open board', () => {
    // X's winning square (0) sends O to board 0, which X has just won.
    const state = play(...X_WINS_TOP_LEFT)
    expect(rules.selectors.allowedBoards(state)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    // Every empty square outside board 0: 8 boards × 9 squares, less O's two marks in boards 1 and 2.
    expect(rules.legalMoves(state)).toHaveLength(70)
  })

  it('a won small board accepts no more moves', () => {
    const state = play(...X_WINS_TOP_LEFT)
    expect(rules.legalMoves(state).filter((m) => m.board === 0)).toEqual([])
    expect(() => rules.applyMove(state, { board: 0, square: 4 })).toThrow(IllegalMoveError)
  })

  it('a small board that fills with no winner counts for nobody', () => {
    expect(smallBoard(CENTRE_FILLS, 4)).toEqual(['XOX', 'XOO', 'OXX'])
    expect(results(CENTRE_FILLS)).toEqual([null, null, null, null, 'draw', null, null, null, null])
  })

  it('sent to a full board, the player may play in any open board', () => {
    const state = play(...CENTRE_FILLS)
    expect(rules.currentPlayer(state)).toBe('X')
    expect(rules.selectors.allowedBoards(state)).toEqual([0, 1, 2, 3, 5, 6, 7, 8])
  })

  it.each([
    {
      line: 'the top row',
      highlight: [0, 1, 2],
      // prettier-ignore
      steps: [[1, 5], [5, 2], [2, 8], [8, 1], [1, 3], [3, 1], [1, 4], [4, 1], [0, 6], [6, 1], [2, 7], [7, 1], [2, 6], [6, 2], [0, 4], [4, 2], [0, 2]],
    },
    {
      line: 'the left column',
      highlight: [0, 3, 6],
      // prettier-ignore
      steps: [[6, 7], [7, 6], [6, 4], [4, 0], [0, 7], [7, 0], [0, 4], [4, 3], [3, 8], [8, 0], [0, 1], [1, 0], [6, 1], [1, 6], [3, 5], [5, 6], [3, 2]],
    },
    {
      line: 'a diagonal',
      highlight: [2, 4, 6],
      // prettier-ignore
      steps: [[4, 8], [8, 6], [6, 7], [7, 4], [4, 7], [7, 6], [6, 8], [8, 4], [4, 6], [6, 4], [6, 6], [5, 4], [2, 4], [1, 4], [2, 0], [0, 6], [2, 8]],
    },
  ] as { line: string; highlight: number[]; steps: Step[] }[])(
    'winning three small boards in $line wins the game',
    ({ highlight, steps }) => {
      const state = play(...steps)
      expect(rules.outcome(state)).toEqual({ kind: 'won', winner: 'X', highlight })
      expect(results(steps).flatMap((result, board) => (result === 'X' ? [board] : []))).toEqual(highlight)
      expect(rules.legalMoves(state)).toEqual([])
      expect(rules.selectors.allowedBoards(state)).toEqual([])
    },
  )

  it('the one move before a winning line does not win', () => {
    // The top-row game, one move short: X has boards 0 and 1, not yet 2.
    const steps: Step[] = [[1, 5], [5, 2], [2, 8], [8, 1], [1, 3], [3, 1], [1, 4], [4, 1], [0, 6], [6, 1], [2, 7], [7, 1], [2, 6], [6, 2], [0, 4], [4, 2]] // prettier-ignore
    expect(rules.outcome(play(...steps))).toEqual({ kind: 'in-progress' })
  })

  it('the game is a draw when no legal move remains and nobody has three boards in a row', () => {
    // prettier-ignore
    const steps: Step[] = [
      [8, 4], [4, 5], [5, 0], [0, 5], [5, 2], [2, 6], [6, 3], [3, 0], [0, 2], [2, 8],
      [8, 2], [2, 0], [0, 4], [4, 2], [2, 7], [7, 5], [5, 4], [4, 8], [8, 0], [0, 6],
      [6, 0], [0, 8], [8, 7], [7, 3], [3, 1], [1, 1], [1, 4], [8, 5], [5, 1], [1, 2],
      [2, 2], [2, 3], [3, 6], [6, 1], [1, 8], [8, 1], [1, 5], [7, 4], [3, 4], [8, 6],
      [6, 6], [0, 7], [3, 2], [1, 6], [1, 0], [8, 8], [8, 3],
    ]
    const state = play(...steps)
    // O holds boards 0 and 4, but board 8 filled with no winner, so the diagonal counts for nobody.
    expect(results(steps)).toEqual(['O', 'X', 'O', 'X', 'O', 'X', 'X', 'O', 'draw'])
    expect(rules.outcome(state)).toEqual({ kind: 'draw' })
    expect(rules.legalMoves(state)).toEqual([])
    expect(rules.selectors.allowedBoards(state)).toEqual([])
  })
})
