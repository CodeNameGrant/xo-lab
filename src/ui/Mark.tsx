import { CircleSmall, X } from 'lucide-react'
import type { Player } from '../game/rules.ts'

interface MarkProps {
  readonly player: Player
  readonly size: number
  /** Line thickness in Lucide's 24-unit box: 2 on the board, thicker on small marks so they stay legible. */
  readonly stroke?: number
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

/** An X or O drawn in its player's colour. Decorative: the label lives on the button around it. */
export function Mark({ player, size, stroke = 2 }: MarkProps) {
  const Glyph = GLYPHS[player]
  return (
    <Glyph
      size={size}
      strokeWidth={stroke}
      color={player === 'X' ? 'var(--x)' : 'var(--o)'}
      className={`mark mark-${player}`}
      aria-hidden="true"
      focusable="false"
    />
  )
}
