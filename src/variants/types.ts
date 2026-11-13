import type { ComponentType } from 'react'
import type { VariantRules } from '../game/rules.ts'

/** What the hub and the game screen show about a variant, without loading its rules. */
export interface VariantInfo {
  readonly name: string
  /** How many players the variant has, always the same: 2, or 3 for a three-player variant. */
  readonly players: 2 | 3
  /** One line for the hub card. */
  readonly tagline: string
  /** The "How to play" panel, one paragraph per entry. Words marked `**like this**` are drawn in bold. */
  readonly howToPlay: readonly string[]
  /** A small static picture for the hub card: rows of "X", "O", "S" (a star) and "." (empty). */
  readonly preview: readonly string[]
  /**
   * For a variant where the marks belong to nobody (Notakto, Wild): the marks every player
   * places, drawn on each player card in that player's colour, and the card's detail line.
   * The board, and the hub picture, then draw marks in the neutral text colour (D-43).
   * Left out when each player has a mark of their own.
   */
  readonly sharedMarks?: { readonly marks: readonly ('X' | 'O')[]; readonly detail: string }
  /** False for a variant that can never end in a draw: the draws line under the cards is left out (D-43). */
  readonly canDraw?: boolean
}

/** What every variant's board component receives, and nothing else. */
export interface BoardProps<State, Move, Selectors> {
  readonly state: State
  readonly rules: VariantRules<State, Move, Selectors>
  readonly onMove: (move: Move) => void
}

/*
 * The registry holds variants with different State and Move types side by
 * side, so it has to forget them. `any` here is deliberate and stays inside
 * this file and the registry: each variant's own module is fully typed.
 */
// oxlint-disable-next-line no-explicit-any
export type AnyRules = VariantRules<any, any, any>
// oxlint-disable-next-line no-explicit-any
export type AnyBoard = ComponentType<BoardProps<any, any, any>>

export interface VariantEntry {
  /** The web-address slug: /play/<id>. */
  readonly id: string
  readonly info: VariantInfo
  /** Loaded only when the variant is opened, so each variant is its own download. */
  readonly loadRules: () => Promise<AnyRules>
  readonly loadBoard: () => Promise<AnyBoard>
}
