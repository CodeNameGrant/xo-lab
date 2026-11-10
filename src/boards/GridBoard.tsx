import type { Cell } from '../game/lines.ts'
import { Mark } from '../ui/Mark.tsx'

interface GridBoardProps {
  readonly cells: readonly Cell[]
  /** Squares to light up, e.g. the winning line. */
  readonly highlight: readonly number[]
  /** Whether a tap on this square is a legal move. */
  readonly isPlayable: (index: number) => boolean
  readonly onPlay: (index: number) => void
}

/**
 * The shared 3×3 grid used by Classic and (from #5) Infinite. It only draws
 * cells and reports taps; the variant's board decides what a tap means.
 */
export function GridBoard({ cells, highlight, isPlayable, onPlay }: GridBoardProps) {
  return (
    <div
      className="grid aspect-square w-[min(342px,100%)] grid-cols-3 grid-rows-3 rounded-board bg-surface p-2.5 shadow-board"
      role="group"
      aria-label="Board"
    >
      {cells.map((cell, index) => {
        const playable = isPlayable(index)
        const row = Math.floor(index / 3) + 1
        const column = (index % 3) + 1
        return (
          <button
            key={index}
            type="button"
            // Inner grid lines only: right edge of columns 1–2, bottom edge of rows 1–2.
            className="flex min-h-11 min-w-11 items-center justify-center border-grid not-nth-[3n]:border-r-2 data-win:bg-win nth-[-n+6]:border-b-2"
            data-win={highlight.includes(index) || undefined}
            aria-label={`Row ${row}, column ${column}, ${cell ?? 'empty'}`}
            // aria-disabled (not disabled) keeps every square reachable for screen readers.
            aria-disabled={!playable}
            onClick={() => playable && onPlay(index)}
          >
            {cell && <Mark player={cell} size={64} className="size-3/4 max-h-16 max-w-16" />}
          </button>
        )
      })}
    </div>
  )
}
