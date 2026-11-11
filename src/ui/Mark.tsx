import { CircleSmall, Star, X } from 'lucide-react'
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
 *
 * Player 3's `Star` has no small twin: it is 20 units across. So the star
 * is drawn at 60 % (`scale-60`, which leaves the other transforms such as
 * the pop-in alone) to fill the same 12-unit box, with its stroke widened by
 * the same factor so its lines come out as heavy as the X's and the O's.
 */
const GLYPHS = { X, O: CircleSmall, S: Star } as const

/** How much the star is shrunk to match the X/O box. */
const STAR_SCALE = 0.6

/** Lucide draws in currentColor, so the player's colour is a text colour. */
const COLOUR = { X: 'text-player-x', O: 'text-player-o', S: 'text-player-s scale-60' } as const

/** The neon glow in the dark theme: 6 px on the board, 4 px on small pieces (artboard B). */
const GLOW = { X: 'dark:drop-shadow-glow-x', O: 'dark:drop-shadow-glow-o', S: 'dark:drop-shadow-glow-s' } as const
const SMALL_GLOW = {
  X: 'dark:drop-shadow-glow-x-sm',
  O: 'dark:drop-shadow-glow-o-sm',
  S: 'dark:drop-shadow-glow-s-sm',
} as const

/** At or below this size a piece counts as small. */
const SMALL = 28

/** An X, O or star drawn in its player's colour. Decorative: the label lives on the button around it. */
export function Mark({ player, size, stroke = 2, className }: MarkProps) {
  const Glyph = GLYPHS[player]
  const glow = size <= SMALL ? SMALL_GLOW[player] : GLOW[player]
  return (
    <Glyph
      size={size}
      strokeWidth={player === 'S' ? stroke / STAR_SCALE : stroke}
      className={`${COLOUR[player]} ${glow} ${className ?? ''}`}
      aria-hidden="true"
      focusable="false"
    />
  )
}
