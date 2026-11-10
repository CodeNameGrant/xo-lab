import type { Player } from '../../game/rules.ts'
import { Mark } from '../../ui/Mark.tsx'
import type { BoardProps } from '../types.ts'
import type { SmallBoardResult, UltimateMove, UltimateSelectors, UltimateState } from './rules.ts'

/** Small boards (and squares) are numbered 0–8, left to right, top to bottom. */
const BOARD_NAMES = [
  'Top-left',
  'Top',
  'Top-right',
  'Left',
  'Centre',
  'Right',
  'Bottom-left',
  'Bottom',
  'Bottom-right',
] as const

/**
 * The ring around a small board: the boards the player to move may play in,
 * in their colour, or the winning line of boards in the winner's colour.
 * Dark adds the player's glow.
 */
const RING = {
  X: 'ring-2 ring-player-x dark:shadow-glow-x',
  O: 'ring-2 ring-player-o dark:shadow-glow-o',
} as const

/** A won small board's squares take the winner's tint. */
const WON_TILE = { X: 'bg-tint-x', O: 'bg-tint-o' } as const

/**
 * Ultimate's nested board: nine small boards of nine tiles each, the same
 * tile shape as the 3×3 board in both themes (D-28). The boards the player
 * may play in are ringed in their colour; a won small board shows its
 * winner's large mark over faded pieces.
 *
 * It is wider than the column: it reaches 18 px into the 24 px side padding
 * on each side, to 6 px from the screen edge on a phone (D-31). That leaves
 * room for the 5 px ring around an edge board. `shrink-0` stops the column
 * squeezing it back; centred in the column, it overflows evenly both ways.
 */
export function UltimateBoard({ state, rules, onMove }: BoardProps<UltimateState, UltimateMove, UltimateSelectors>) {
  const { smallBoard, smallBoardResult, allowedBoards } = rules.selectors
  const legal = new Set(rules.legalMoves(state).map(({ board, square }) => board * 9 + square))
  const allowed = allowedBoards(state)
  const outcome = rules.outcome(state)
  const turn = rules.currentPlayer(state)

  return (
    <div
      className="grid aspect-square w-[min(calc(100%+36px),400px)] shrink-0 grid-cols-3 grid-rows-3 gap-2.5"
      role="group"
      aria-label="Board"
    >
      {BOARD_NAMES.map((name, board) => {
        const result = smallBoardResult(state, board)
        const ringed: Player | null =
          outcome.kind === 'won'
            ? outcome.highlight.includes(board)
              ? outcome.winner
              : null
            : allowed.includes(board)
              ? turn
              : null
        return (
          <div
            key={board}
            role="group"
            aria-label={`${name} board${boardStatus(result, ringed !== null && outcome.kind === 'in-progress')}`}
            // The ring sits 3 px outside the tiles, in the page colour's gap between boards.
            className={`relative grid grid-cols-3 grid-rows-3 gap-0.75 rounded-board-sm ring-offset-3 ring-offset-page motion-safe:transition-shadow motion-safe:duration-200 ${ringed ? RING[ringed] : ''}`}
          >
            {smallBoard(state, board).map((cell, square) => {
              const playable = legal.has(board * 9 + square)
              return (
                <button
                  key={square}
                  type="button"
                  className={`flex min-w-0 items-center justify-center rounded-tile-sm border border-grid motion-safe:transition-colors motion-safe:duration-300 ${result === 'X' || result === 'O' ? WON_TILE[result] : 'bg-surface'}`}
                  aria-label={`${name} board, row ${Math.floor(square / 3) + 1}, column ${(square % 3) + 1}, ${cell ?? 'empty'}`}
                  // aria-disabled (not disabled) keeps every square reachable for screen readers.
                  aria-disabled={!playable}
                  onClick={() => playable && onMove({ board, square })}
                >
                  {cell && (
                    <Mark
                      player={cell}
                      size={22}
                      stroke={2.75}
                      // A closed board's pieces fade: under the winner's mark, or because the board counts for nobody.
                      className={`motion-safe:animate-place ${result === null ? '' : result === 'draw' ? 'opacity-40' : 'opacity-25'}`}
                    />
                  )}
                </button>
              )
            })}
            {(result === 'X' || result === 'O') && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <Mark player={result} size={96} stroke={2.25} className="size-full motion-safe:animate-place" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/** The end of a small board's label: who won it, that it filled with no winner, or that it can be played now. */
function boardStatus(result: SmallBoardResult, playHere: boolean): string {
  if (result === 'X') return ', won by Player 1'
  if (result === 'O') return ', won by Player 2'
  if (result === 'draw') return ', full, no winner'
  return playHere ? ', play here' : ''
}
