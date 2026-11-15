import type { AiLevel } from '../game/ai.ts'
import type { Game } from '../game/session.ts'
import { think, type AiReply, type AiRequest } from './think.ts'

/**
 * Asks the AI for its move in `game`, searching in the Web Worker so the
 * screen never freezes (D-47). Where there are no workers (the tests' jsdom),
 * it searches on this thread instead.
 */
export function askAi(variantId: string, game: Game<unknown>, level: AiLevel): Promise<unknown> {
  // Randomness belongs here, outside the AI: the search itself only ever uses this seed.
  const request: AiRequest = { id: nextId++, variantId, game, level, seed: Math.floor(Math.random() * 2 ** 32) }
  const worker = theWorker()
  if (!worker) return think(request)
  return new Promise((resolve, reject) => {
    waiting.set(request.id, { resolve, reject })
    worker.postMessage(request)
  })
}

let nextId = 0
const waiting = new Map<number, { resolve: (move: unknown) => void; reject: (error: unknown) => void }>()
let worker: Worker | null | undefined

/** The one worker, started the first time the AI is asked, or null where workers don't exist. */
function theWorker(): Worker | null {
  if (worker !== undefined) return worker
  if (typeof Worker === 'undefined') return (worker = null)

  // `new URL(…, import.meta.url)` is how Vite finds the worker file and bundles it as its own script.
  worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent<AiReply>) => {
    waiting.get(event.data.id)?.resolve(event.data.move)
    waiting.delete(event.data.id)
  }
  worker.onerror = (event) => {
    for (const { reject } of waiting.values()) reject(event)
    waiting.clear()
  }
  return worker
}
