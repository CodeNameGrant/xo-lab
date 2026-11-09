import type { ComponentType } from 'react'
import type { VariantRules } from '../game/rules.ts'

/** What the hub and the game screen show about a variant, without loading its rules. */
export interface VariantInfo {
  readonly name: string
  /** One line for the hub card. */
  readonly tagline: string
  /** The "How to play" panel, one paragraph per entry. */
  readonly howToPlay: readonly string[]
  /** A small static picture for the hub card: rows of "X", "O" and "." (empty). */
  readonly preview: readonly string[]
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
