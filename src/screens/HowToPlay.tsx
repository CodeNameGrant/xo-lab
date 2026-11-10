import { useId, useRef } from 'react'
import type { VariantInfo } from '../variants/types.ts'
import { iconButton } from '../ui/classes.ts'
import { Icon } from '../ui/icon.tsx'

/** The top bar's "?" button and the panel it opens, using the browser's built-in modal dialog. */
export function HowToPlay({ info }: { info: VariantInfo }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  return (
    <>
      <button type="button" className={iconButton} aria-label="How to play" onClick={() => dialog.current?.showModal()}>
        <Icon name="help" />
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(400px,calc(100%-32px))] rounded-board bg-surface text-ink shadow-board backdrop:bg-backdrop"
        aria-labelledby={titleId}
        // A tap on the dimmed backdrop (outside the panel) closes it.
        onClick={(event) => event.target === dialog.current && dialog.current.close()}
      >
        <div className="px-6 pt-4 pb-6">
          <div className="-mr-3 flex items-center justify-between gap-3">
            <h2 id={titleId} className="text-lg font-semibold">
              How to play {info.name}
            </h2>
            <button type="button" className={iconButton} aria-label="Close" onClick={() => dialog.current?.close()}>
              <Icon name="close" />
            </button>
          </div>
          {info.howToPlay.map((paragraph) => (
            <p key={paragraph} className="mt-3 text-[15px] leading-normal text-ink-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </dialog>
    </>
  )
}
