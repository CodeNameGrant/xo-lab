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

/** A piece's size: 60 px on a full-size tile. */
const piece = 'size-3/4 max-h-15 max-w-15'

/**
 * The shared 3×3 grid used by Classic and Infinite. It only draws cells and
 * reports taps; the variant's board decides what a tap means.
 *
 * Both themes draw nine separate tiles with a gap and no panel (decision
 * D-28); only the colours differ between them.
 */
export function GridBoard({ cells, highlight, isPlayable, onPlay, disappearsNext, leaving }: GridBoardProps) {
  return (
    <div
      className="grid aspect-square w-[min(342px,100%)] grid-cols-3 grid-rows-3 gap-2.5"
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
            // Every square is its own bordered tile; a winning tile's border takes the winner's colour.
            // Winning tiles are tinted in the winner's colour in light (D-24); dark keeps one shared highlight.
            // The winning highlight fades in, unless the device asks for reduced motion.
            className="flex min-h-11 min-w-11 items-center justify-center rounded-tile border border-grid bg-surface data-[win=O]:border-player-o data-[win=X]:border-player-x motion-safe:transition-colors motion-safe:duration-300 dark:data-win:bg-win light:data-[win=O]:bg-tint-o light:data-[win=X]:bg-tint-x"
            data-win={(highlight.includes(index) && cell) || undefined}
            aria-label={`Row ${row}, column ${column}, ${cell ?? 'empty'}${fading ? ', disappears next' : ''}`}
            // aria-disabled (not disabled) keeps every square reachable for screen readers.
            aria-disabled={!playable}
            onClick={() => playable && onPlay(index)}
          >
            {cell ? (
              <Mark
                player={cell}
                size={60}
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
                  size={60}
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
