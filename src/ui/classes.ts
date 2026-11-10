/**
 * Class lists shared by more than one component. Anything used in one
 * place stays inline on its element; a list moves here only once a second
 * file needs it.
 */

/**
 * A 44 px square button or link holding one icon: the top bar's back and
 * help, the panel's close, the theme toggle. Dark (artboard B) gives
 * it a border and draws its icon at 22 px; the artboard scales the 24-unit
 * icon down, stroke and all, so a CSS size matches it exactly here.
 */
export const iconButton =
  'flex size-11 items-center justify-center rounded-xl text-ink hover:text-ink dark:border dark:border-line dark:[&>svg]:size-[22px]'
