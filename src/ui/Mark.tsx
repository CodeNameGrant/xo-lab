import { CircleSmall, X } from 'lucide-react'
import type { Player } from '../game/rules.ts'

interface MarkProps {
  readonly player: Player
  readonly size: number
  /** Line thickness in Lucide's 24-unit box: 2 on the board, thicker on small marks so they stay legible. */
  readonly stroke?: number
  /** For layout only, e.g. letting the board scale its pieces. */
  readonly className?: string
}

/*
 * The X and O game pieces. They are Lucide glyphs like every other icon,
 * but live here rather than in icon.tsx because they are pieces, not
 * controls: each takes its player's colour and a stroke weight that
 * changes with where it is shown.
 *
 * `X` and `CircleSmall` are chosen as a pair: the cross spans 12 of the
 * 24 units and the small circle is 12 units across, so X and O fill the
 * same box. Plain `Circle` is 20 across and would dwarf the X.
 */
const GLYPHS = { X, O: CircleSmall } as const

/** Lucide draws in currentColor, so the player's colour is a text colour. */
const COLOUR = { X: 'text-player-x', O: 'text-player-o' } as const

/** The neon glow in the dark theme: 6 px on the board, 4 px on small pieces (artboard B). */
const GLOW = { X: 'dark:drop-shadow-glow-x', O: 'dark:drop-shadow-glow-o' } as const
const SMALL_GLOW = { X: 'dark:drop-shadow-glow-x-sm', O: 'dark:drop-shadow-glow-o-sm' } as const

/** At or below this size a piece counts as small. */
const SMALL = 28

/** An X or O drawn in its player's colour. Decorative: the label lives on the button around it. */
export function Mark({ player, size, stroke = 2, className }: MarkProps) {
  const Glyph = GLYPHS[player]
  const glow = size <= SMALL ? SMALL_GLOW[player] : GLOW[player]
  return (
    <Glyph
      size={size}
      strokeWidth={stroke}
      className={`${COLOUR[player]} ${glow} ${className ?? ''}`}
      aria-hidden="true"
      focusable="false"
    />
  )
}
