import type { Player } from '../game/rules.ts'

interface NumberPieceProps {
  /** The number to draw, 1–9. */
  readonly value: number
  /** Whose colour to draw it in, 'neutral' for the text colour, or 'inherit' for the colour around it; the last two with no glow. */
  readonly tone: Player | 'neutral' | 'inherit'
  /** The digit's height in pixels: 60 on the 3×3 board, as a mark is. */
  readonly size: number
  /** For layout only. */
  readonly className?: string
}

/** The player colours, as text colours. */
const COLOUR = { X: 'text-player-x', O: 'text-player-o', S: 'text-player-s' } as const

/** The neon glow in the dark theme, as on the marks: 6 px on the board, 4 px on small pieces. */
const GLOW = { X: 'dark:drop-shadow-glow-x', O: 'dark:drop-shadow-glow-o', S: 'dark:drop-shadow-glow-s' } as const
const SMALL_GLOW = {
  X: 'dark:drop-shadow-glow-x-sm',
  O: 'dark:drop-shadow-glow-o-sm',
  S: 'dark:drop-shadow-glow-s-sm',
} as const

/** At or below this size a piece counts as small, as for marks. */
const SMALL = 28

/**
 * A number used as a game piece, in Numerical (D-57): the second kind of piece beside
 * `<Mark>`. Lucide has no digit glyphs, so a number is real text in the theme's font,
 * semibold with tabular figures so every digit is as wide as the next, coloured like a mark.
 * Decorative: the square's button carries the label.
 */
export function NumberPiece({ value, tone, size, className }: NumberPieceProps) {
  const colour = tone === 'inherit' ? '' : tone === 'neutral' ? 'text-ink' : COLOUR[tone]
  const glow = tone === 'neutral' || tone === 'inherit' ? '' : size <= SMALL ? SMALL_GLOW[tone] : GLOW[tone]
  return (
    <span
      className={`leading-none font-semibold tabular-nums ${colour} ${glow} ${className ?? ''}`}
      // The size is a number in pixels, like a mark's, so it can't be a fixed Tailwind class.
      style={{ fontSize: size }}
      aria-hidden="true"
    >
      {value}
    </span>
  )
}
