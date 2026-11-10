import { useId, useRef } from 'react'
import type { VariantInfo } from '../variants/types.ts'
import { CloseIcon, HelpIcon } from '../ui/icons.tsx'

/** The top bar's "?" button and the panel it opens, using the browser's built-in modal dialog. */
export function HowToPlay({ info }: { info: VariantInfo }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  return (
    <>
      <button
        type="button"
        className="icon-button"
        aria-label="How to play"
        onClick={() => dialog.current?.showModal()}
      >
        <HelpIcon />
      </button>
      <dialog
        ref={dialog}
        className="how-to-play"
        aria-labelledby={titleId}
        // A tap on the dimmed backdrop (outside the panel) closes it.
        onClick={(event) => event.target === dialog.current && dialog.current.close()}
      >
        <div className="how-to-play-panel">
          <div className="how-to-play-header">
            <h2 id={titleId}>How to play {info.name}</h2>
            <button type="button" className="icon-button" aria-label="Close" onClick={() => dialog.current?.close()}>
              <CloseIcon />
            </button>
          </div>
          {info.howToPlay.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </dialog>
    </>
  )
}
