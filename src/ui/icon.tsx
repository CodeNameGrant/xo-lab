import { ChevronLeft, ChevronRight, CircleQuestionMark, RotateCw, Undo2, X, type LucideIcon } from 'lucide-react'

/**
 * Every icon in the app, by what it means rather than what it looks like.
 * A new icon is a new entry here, named for its job (`newGame`, not
 * `rotate-cw`). The only other file that imports lucide-react is Mark.tsx,
 * for the X and O game pieces.
 */
const GLYPHS = {
  back: ChevronLeft,
  open: ChevronRight,
  help: CircleQuestionMark,
  undo: Undo2,
  newGame: RotateCw,
  close: X,
} satisfies Record<string, LucideIcon>

export type IconName = keyof typeof GLYPHS

interface IconProps {
  readonly name: IconName
  /** Width and height in px. Use this, not a CSS size, so the stroke keeps its weight. */
  readonly size?: number
  /** For colour and layout only. */
  readonly className?: string
}

/** A Lucide icon in the current text colour. Always decorative: the button or link around it carries the label. */
export function Icon({ name, size = 24, className }: IconProps) {
  const Glyph = GLYPHS[name]
  return <Glyph size={size} className={className} aria-hidden="true" focusable="false" />
}
