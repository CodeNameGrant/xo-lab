import type { Player } from '../game/rules.ts'

interface MarkProps {
  readonly player: Player
  readonly size: number
  /** Line thickness in a 100-unit box: 8 on the board, 10 on small icons. */
  readonly stroke?: number
}

/** An X or O drawn in its player's colour. Decorative: the label lives on the button around it. */
export function Mark({ player, size, stroke = 8 }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" className={`mark mark-${player}`}>
      {player === 'X' ? (
        <path d="M24 24L76 76M76 24L24 76" stroke="var(--x)" strokeWidth={stroke} strokeLinecap="round" fill="none" />
      ) : (
        <circle cx="50" cy="50" r="28" stroke="var(--o)" strokeWidth={stroke} fill="none" />
      )}
    </svg>
  )
}
