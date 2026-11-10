import type { Cell } from '../game/lines.ts'
import type { Player } from '../game/rules.ts'
import { Mark } from '../ui/Mark.tsx'

/** A piece that has just been taken off the board, drawn once more while it fades out. */
export interface LeavingMark {
  readonly square: number
  readonly player: Player
  /** Changes with every removal, so the fade replays even on a square that faded before. */
  readonly key: number
}

interface GridBoardProps {
  readonly cells: readonly Cell[]
  /** Squares to light up, e.g. the winning line. */
  readonly highlight: readonly number[]
  /** Whether a tap on this square is a legal move. */
  readonly isPlayable: (index: number) => boolean
  readonly onPlay: (index: number) => void
  /** Infinite: the square whose piece disappears next, drawn faded and pulsing. */
  readonly disappearsNext?: number | null
  /** Infinite: the piece just removed, drawn fading out over its now-empty square. */
  readonly leaving?: LeavingMark | null
}

/** A piece's size: 64 px on the light board, 60 px on the dark tiles. */
const piece = 'size-3/4 max-h-16 max-w-16 dark:max-h-15 dark:max-w-15'

/**
 * The shared 3×3 grid used by Classic and Infinite. It only draws cells and
 * reports taps; the variant's board decides what a tap means.
 *
 * Light (artboard A) is one white panel with inner grid lines. Dark
 * (artboard B) is nine separate tiles with a gap and no panel.
 */
export function GridBoard({ cells, highlight, isPlayable, onPlay, disappearsNext, leaving }: GridBoardProps) {
  return (
    <div
      className="grid aspect-square w-[min(342px,100%)] grid-cols-3 grid-rows-3 dark:gap-2.5 light:rounded-board light:bg-surface light:p-2.5 light:shadow-board"
      role="group"
      aria-label="Board"
    >
      {cells.map((cell, index) => {
        const playable = isPlayable(index)
        const row = Math.floor(index / 3) + 1
        const column = (index % 3) + 1
        const fading = cell !== null && index === disappearsNext
        return (
          <button
            key={index}
            type="button"
            // Light: inner grid lines only (right edge of columns 1–2, bottom edge of rows 1–2).
            // Dark: every square is its own bordered tile; a winning tile's border takes the winner's colour.
            // Winning squares are tinted in the winner's colour in light; dark keeps one shared highlight.
            // The winning highlight fades in, unless the device asks for reduced motion.
            className="flex min-h-11 min-w-11 items-center justify-center border-grid motion-safe:transition-colors motion-safe:duration-300 dark:rounded-tile dark:border dark:bg-surface dark:data-win:bg-win dark:data-[win=O]:border-player-o dark:data-[win=X]:border-player-x light:not-nth-[3n]:border-r-2 light:data-[win=O]:bg-tint-o light:data-[win=X]:bg-tint-x light:nth-[-n+6]:border-b-2"
            data-win={(highlight.includes(index) && cell) || undefined}
            aria-label={`Row ${row}, column ${column}, ${cell ?? 'empty'}${fading ? ', disappears next' : ''}`}
            // aria-disabled (not disabled) keeps every square reachable for screen readers.
            aria-disabled={!playable}
            onClick={() => playable && onPlay(index)}
          >
            {cell ? (
              <Mark
                player={cell}
                size={64}
                // Pops in when placed; the piece that disappears next is faded and pulses instead.
                className={
                  fading ? `${piece} opacity-40 motion-safe:animate-fade-pulse` : `${piece} motion-safe:animate-place`
                }
              />
            ) : (
              leaving?.square === index && (
                <Mark
                  key={leaving.key}
                  player={leaving.player}
                  size={64}
                  // Invisible once the fade ends, and from the start when the device asks for reduced motion.
                  className={`${piece} opacity-0 motion-safe:animate-fade-out`}
                />
              )
            )}
          </button>
        )
      })}
    </div>
  )
}
