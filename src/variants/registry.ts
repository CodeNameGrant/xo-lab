import { classicInfo } from './classic/info.ts'
import { infiniteInfo } from './infinite/info.ts'
import { misereInfo } from './misere/info.ts'
import { notaktoInfo } from './notakto/info.ts'
import { shiftInfo } from './shift/info.ts'
import { trioInfo } from './trio/info.ts'
import type { VariantEntry } from './types.ts'
import { ultimateInfo } from './ultimate/info.ts'

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
  {
    id: 'ultimate',
    info: ultimateInfo,
    loadRules: () => import('./ultimate/rules.ts').then((m) => m.ultimateRules),
    loadBoard: () => import('./ultimate/UltimateBoard.tsx').then((m) => m.UltimateBoard),
  },
  {
    id: 'shift',
    info: shiftInfo,
    loadRules: () => import('./shift/rules.ts').then((m) => m.shiftRules),
    loadBoard: () => import('./shift/ShiftBoard.tsx').then((m) => m.ShiftBoard),
  },
  {
    id: 'trio',
    info: trioInfo,
    loadRules: () => import('./trio/rules.ts').then((m) => m.trioRules),
    loadBoard: () => import('./trio/TrioBoard.tsx').then((m) => m.TrioBoard),
  },
  {
    id: 'misere',
    info: misereInfo,
    loadRules: () => import('./misere/rules.ts').then((m) => m.misereRules),
    loadBoard: () => import('./misere/MisereBoard.tsx').then((m) => m.MisereBoard),
  },
  {
    id: 'notakto',
    info: notaktoInfo,
    loadRules: () => import('./notakto/rules.ts').then((m) => m.notaktoRules),
    loadBoard: () => import('./notakto/NotaktoBoard.tsx').then((m) => m.NotaktoBoard),
  },
]

export function findVariant(id: string | undefined): VariantEntry | undefined {
  return variants.find((variant) => variant.id === id)
}
