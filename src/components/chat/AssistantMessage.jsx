import { useState, useCallback } from 'react'
import { Bookmark, BookmarkCheck, AlertCircle } from 'lucide-react'
import MarkdownRenderer from '../ui/MarkdownRenderer'
import CitationCard from '../citations/CitationCard'

/**
 * AssistantMessage — renders a tutor response as readable prose.
 *
 * Sits directly on the page (not in a card/bubble) with strong typographic hierarchy.
 * Includes: rendered markdown content, citation cards, and a save/bookmark affordance.
 *
 * @param {object} message — from conversation.json or newly streamed
 * @param {boolean} isSaved — whether this concept is already in the notebook
 * @param {function} onSave — called to save this message's concept to notebook
 * @param {function} onOpenSource — called with resolved citation data to open source panel
 */
export default function AssistantMessage({ message, isSaved, onSave, onOpenSource }) {
  const [justSaved, setJustSaved] = useState(false)

  const handleSave = useCallback(() => {
    if (isSaved || justSaved) return
    onSave(message)
    setJustSaved(true)
    // Keep "Saved" label for a short time, then let the isSaved prop take over
    setTimeout(() => setJustSaved(false), 2000)
  }, [isSaved, justSaved, message, onSave])

  const hasCitations = message.citations?.length > 0
  const isRefusal = !hasCitations && message.content && !message.content.includes('```')

  // Detect refusal-like content (no citations, short message about not having access)
  const isLikelyRefusal = isRefusal && (
    message.content.toLowerCase().includes("don't have access") ||
    message.content.toLowerCase().includes("could not find") ||
    message.content.toLowerCase().includes("cannot")
  )

  return (
    <div className="mb-6 group">
      {/* Tutor indicator */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white"
             style={{ backgroundColor: 'var(--color-primary)' }}>
          S
        </div>
        <span className="text-[var(--text-caption)] font-medium text-[var(--color-text-secondary)]">
          Scholera Tutor
        </span>

        {/* Save button */}
        {message.content && (
          <button
            onClick={handleSave}
            className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[var(--text-caption)] font-medium
                        transition-all duration-200
                        ${(isSaved || justSaved)
                          ? 'text-[var(--color-primary)] bg-[var(--color-primary-tint)]'
                          : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary-tint)] opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
                        }
                        `}
            style={{
              // Always visible on mobile (no hover)
              ...(!(isSaved || justSaved) ? {} : {}),
            }}
            disabled={isSaved || justSaved}
            aria-label={isSaved ? 'Already saved to notebook' : 'Save to notebook'}
          >
            {(isSaved || justSaved) ? (
              <>
                <BookmarkCheck size={14} />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Bookmark size={14} />
                <span>Save</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="pl-8">
        <MarkdownRenderer content={message.content} />

        {/* Refusal indicator */}
        {isLikelyRefusal && (
          <div className="flex items-center gap-1.5 mt-2 text-[var(--text-caption)] text-[var(--color-text-tertiary)]">
            <AlertCircle size={13} />
            <span>Outside course material</span>
          </div>
        )}

        {/* Citation cards */}
        {hasCitations && (
          <div className="flex flex-col gap-2 mt-4">
            {message.citations.map((citation, i) => (
              <CitationCard
                key={`${citation.lecture}-${citation.slide}-${i}`}
                citation={citation}
                onOpenSource={onOpenSource}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
