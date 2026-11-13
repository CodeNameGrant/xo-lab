import { Mark } from '../../ui/Mark.tsx'
import type { BoardProps } from '../types.ts'
import { BOARDS, type NotaktoMove, type NotaktoSelectors, type NotaktoState } from './rules.ts'

/**
 * Notakto's three boards: two side by side, the third centred below them, the
 * same shape as three player cards (D-44). The X's belong to nobody, so they
 * are drawn neutral. A dead board's X's fade, and its completed line keeps the
 * colour of the player who completed it, as in Misère (D-40).
 */
export function NotaktoBoard({ state, rules, onMove }: BoardProps<NotaktoState, NotaktoMove, NotaktoSelectors>) {
  const marks = rules.selectors.marks(state)
  const legal = rules.legalMoves(state)

  return (
    <div className="grid w-[min(342px,100%)] grid-cols-2 gap-3" role="group" aria-label="Boards">
      {Array.from({ length: BOARDS }, (_, board) => {
        const killer = rules.selectors.killedBy(state, board)
        const line = rules.selectors.completedLine(state, board)
        return (
          <div
            key={board}
            role="group"
            aria-label={`Board ${board + 1}${killer ? ', dead' : ''}`}
            // The third board wraps to its own row, the same width as the others and centred.
            className={`grid aspect-square grid-cols-3 grid-rows-3 gap-1 ${board === 2 ? 'col-span-2 w-[calc(50%-6px)] justify-self-center' : ''}`}
          >
            {Array.from({ length: 9 }, (_, square) => {
              const index = board * 9 + square
              const playable = legal.includes(index)
              const inLine = line.includes(square)
              return (
                <button
                  key={square}
                  type="button"
                  // A completed line's squares take its player's colour, as on the 3×3 board (D-24, D-40).
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-tile-sm border border-grid bg-surface data-[win=O]:border-player-o data-[win=X]:border-player-x motion-safe:transition-colors motion-safe:duration-300 dark:data-win:bg-win light:data-[win=O]:bg-tint-o light:data-[win=X]:bg-tint-x"
                  data-win={(inLine && killer) || undefined}
                  aria-label={`Board ${board + 1}, row ${Math.floor(square / 3) + 1}, column ${(square % 3) + 1}, ${marks[index] ? 'X' : 'empty'}`}
                  // aria-disabled (not disabled) keeps every square reachable for screen readers.
                  aria-disabled={!playable}
                  onClick={() => playable && onMove(index)}
                >
                  {marks[index] && (
                    <Mark
                      player="X"
                      tone="neutral"
                      size={32}
                      // On a dead board, every X but the completed line's fades.
                      className={`size-3/5 max-h-8 max-w-8 motion-safe:animate-place ${killer && !inLine ? 'opacity-40' : ''}`}
                    />
                  )}
                </button>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
