import { useState, useCallback } from 'react'
import { Bookmark, BookmarkCheck, AlertCircle } from 'lucide-react'
import MarkdownRenderer from '../ui/MarkdownRenderer'
import CitationCard from '../citations/CitationCard'


// renders a tutor response.
 
export default function AssistantMessage({
  message,
  isSaved,
  onSave,
  onOpenSource,
}) {
  const [justSaved, setJustSaved] = useState(false)

  const handleSave = useCallback(() => {
    if (isSaved || justSaved) return
    onSave(message)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }, [isSaved, justSaved, message, onSave])

  const hasCitations = message.citations?.length > 0

  const REFUSAL_PHRASES = [
    "don't have access",
    "could not find",
    "cannot",
    "i don't know",
    "i could not",
    "not in the course",
    "outside the course",
    "can only see the course",
  ]
  const isLikelyRefusal =
    !hasCitations &&
    message.content &&
    REFUSAL_PHRASES.some(phrase =>
      message.content.toLowerCase().includes(phrase)
    )

  return (
    <div className="group w-full py-4">
      {/* Tutor label row */}
      <div className="flex items-center gap-2 mb-2.5">
        {/* Avatar */}
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center
                     text-[10px] font-bold text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          S
        </div>

        <span
          className="text-[11px] font-semibold tracking-wide uppercase"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Tutor
        </span>

        {/* Save button */}
        {message.content && (
          <button
            onClick={handleSave}
            className={`
              ml-auto flex items-center gap-1 px-2 py-1 rounded-md
              text-[11px] font-medium
              transition-all duration-150
              ${
                isSaved || justSaved
                  ? 'text-[var(--accent-saved)] bg-[var(--accent-saved-tint)]'
                  : 'text-[var(--color-text-tertiary)] opacity-40 hover:opacity-100 hover:text-[var(--accent-saved)] hover:bg-[var(--accent-saved-tint)]'
              }
            `}
            disabled={isSaved || justSaved}
            aria-label={
              isSaved
                ? 'Already saved to notebook'
                : 'Save to notebook'
            }
          >
            {isSaved || justSaved ? (
              <>
                <BookmarkCheck size={13} />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark size={13} />
                <span>Save</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content  */}
      <div className="pl-7">
        <MarkdownRenderer content={message.content} />

        {/* Refusal indicator */}
        {isLikelyRefusal && (
          <div
            className="flex items-center gap-1.5 mt-2 text-[11px]"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <AlertCircle size={12} />
            <span>Outside course material</span>
          </div>
        )}

        {/* Course citations */}
        {hasCitations && (
          <div className="mt-5">
            <div
              className="mb-2 text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Course sources · {message.citations.length}
            </div>

            <div className="flex flex-col gap-2">
              {message.citations.map((citation, i) => (
                <CitationCard
                  key={`${citation.lecture}-${citation.slide}-${i}`}
                  citation={citation}
                  onOpenSource={onOpenSource}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}