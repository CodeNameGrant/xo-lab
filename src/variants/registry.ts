import { classicInfo } from './classic/info.ts'
import { infiniteInfo } from './infinite/info.ts'
import type { VariantEntry } from './types.ts'

/**
 * Every playable variant, in hub order. Adding a variant means adding its
 * folder under src/variants and one entry here; the hub, the routes, the
 * game screen and the contract tests all pick it up from this list.
 */
export const variants: readonly VariantEntry[] = [
  {
    id: 'classic',
    info: classicInfo,
    loadRules: () => import('./classic/rules.ts').then((m) => m.classicRules),
    loadBoard: () => import('./classic/ClassicBoard.tsx').then((m) => m.ClassicBoard),
  },
  {
    id: 'infinite',
    info: infiniteInfo,
    loadRules: () => import('./infinite/rules.ts').then((m) => m.infiniteRules),
    loadBoard: () => import('./infinite/InfiniteBoard.tsx').then((m) => m.InfiniteBoard),
  },
]

export function findVariant(id: string | undefined): VariantEntry | undefined {
  return variants.find((variant) => variant.id === id)
}
