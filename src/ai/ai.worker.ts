/**
 * The AI's Web Worker: a second thread where the search runs, so the screen
 * keeps responding while the AI thinks (D-47). It answers one request at a
 * time, in the order they arrive. askAi.ts is the only code that talks to it.
 */
import { think, type AiReply, type AiRequest } from './think.ts'

self.onmessage = async (event: MessageEvent<AiRequest>) => {
  const reply: AiReply = { id: event.data.id, move: await think(event.data) }
  self.postMessage(reply)
}
