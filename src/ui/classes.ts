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

/**
 * One square of a board, the tile shape of D-28: a bordered tile on `surface`. A square of the
 * completed line carries `data-win` with its player, and takes that player's colour on its border
 * and, in light, their tint (D-24); dark keeps one shared highlight. The highlight fades in, unless
 * the device asks for reduced motion. Used by the shared grid board and by Pyramid's.
 */
export const boardTile =
  'flex min-h-11 min-w-11 items-center justify-center rounded-tile border border-grid bg-surface data-[win=O]:border-player-o data-[win=S]:border-player-s data-[win=X]:border-player-x motion-safe:transition-colors motion-safe:duration-300 dark:data-win:bg-win light:data-[win=O]:bg-tint-o light:data-[win=S]:bg-tint-s light:data-[win=X]:bg-tint-x'
