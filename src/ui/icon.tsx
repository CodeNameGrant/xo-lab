import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
  Flag,
  LayoutGrid,
  List,
  Moon,
  RotateCw,
  Sun,
  X,
  type LucideIcon,
} from 'lucide-react'
import { siGithub, type SimpleIcon } from 'simple-icons'

/**
 * Every icon in the app, by what it means rather than what it looks like.
 * A new icon is a new entry here, named for its job (`newGame`, not
 * `rotate-cw`). The only other file that imports lucide-react is Mark.tsx,
 * for the game pieces. Brand logos, which Lucide lacks, come
 * from simple-icons in `BRANDS` below.
 */
const GLYPHS = {
  back: ChevronLeft,
  open: ChevronRight,
  help: CircleQuestionMark,
  newGame: RotateCw,
  close: X,
  /** After Player 2's name: the card opens a menu choosing a person or the AI. */
  chooser: ChevronDown,
  /** The current choice in a menu. */
  chosen: Check,
  /** On the player card of whoever made the first move of this game. */
  starter: Flag,
  /** The hub's view toggle shows the view it switches to. */
  gridView: LayoutGrid,
  listView: List,
  /** The theme toggle shows the theme it switches to. */
  lightTheme: Sun,
  darkTheme: Moon,
} satisfies Record<string, LucideIcon>

/**
 * Brand logos, which Lucide doesn't draw: the one exception to Lucide-only
 * icons (D-60). Each is a filled path from the `simple-icons` package, on the
 * same 24-unit box, named for its job like the glyphs above.
 */
const BRANDS = {
  /** The hub's link to the source code. */
  sourceCode: siGithub,
} satisfies Record<string, SimpleIcon>

export type IconName = keyof typeof GLYPHS | keyof typeof BRANDS

interface IconProps {
  readonly name: IconName
  /** Width and height in px. Use this, not a CSS size, so the stroke keeps its weight. */
  readonly size?: number
  /** For colour and layout only. */
  readonly className?: string
}

/** A Lucide icon in the current text colour. Always decorative: the button or link around it carries the label. */
export function Icon({ name, size = 24, className }: IconProps) {
  if (name in BRANDS) {
    const brand = BRANDS[name as keyof typeof BRANDS]
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <path d={brand.path} />
      </svg>
    )
  }
  const Glyph = GLYPHS[name as keyof typeof GLYPHS]
  return <Glyph size={size} className={className} aria-hidden="true" focusable="false" />
}
