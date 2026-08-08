import { BookOpen, FileText, Trash2, ChevronRight } from 'lucide-react'
import { resolveCitation } from '../../lib/resolveCitation'
import { lectures } from '../../lib/data'

/**
 * NotebookView — the Learn tab showing saved concepts.
 *
 * Displays a list of saved concept cards, each with title, snippet,
 * and source citation link. Includes an empty state when nothing is saved.
 */
export default function NotebookView({ concepts, onRemove, onOpenSource }) {
  if (concepts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
             style={{ backgroundColor: 'var(--color-primary-tint)' }}>
          <BookOpen size={24} className="text-[var(--color-primary)]" />
        </div>
        <h2 className="text-[var(--text-h3)] font-semibold text-[var(--color-text-primary)] mb-2">
          Your Notebook
        </h2>
        <p className="text-[var(--text-body-sm)] text-[var(--color-text-secondary)] max-w-xs">
          Save concepts from tutor answers to build your personal study notes. 
          They'll appear here for quick revision.
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
               style={{ backgroundColor: 'var(--color-primary-tint)' }}>
            <BookOpen size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h2 className="text-[var(--text-h3)] font-semibold text-[var(--color-text-primary)]">
              Your Notebook
            </h2>
            <p className="text-[var(--text-caption)] text-[var(--color-text-secondary)]">
              {concepts.length} concept{concepts.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {/* Concept cards */}
        <div className="space-y-3">
          {concepts.map((concept) => (
            <SavedConceptCard
              key={concept.id}
              concept={concept}
              onRemove={onRemove}
              onOpenSource={onOpenSource}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * SavedConceptCard — a single saved concept in the notebook.
 */
function SavedConceptCard({ concept, onRemove, onOpenSource }) {
  const handleSourceClick = (citation) => {
    const resolved = resolveCitation(citation, lectures)
    if (resolved && onOpenSource) {
      onOpenSource(resolved)
    }
  }

  return (
    <div className="p-4 rounded-[var(--radius-card)] border border-[var(--color-border)]
                    bg-[var(--color-surface)] group">
      {/* Title */}
      <h3 className="text-[var(--text-body)] font-medium text-[var(--color-text-primary)] mb-1.5 leading-snug">
        {concept.title}
      </h3>

      {/* Snippet */}
      <p className="text-[var(--text-body-sm)] text-[var(--color-text-secondary)] leading-relaxed mb-3 line-clamp-3">
        {concept.snippet?.replace(/[*#`$]/g, '').replace(/\\/g, '')}
      </p>

      {/* Citations + actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {concept.citations?.map((citation, i) => {
            const resolved = resolveCitation(citation, lectures)
            if (!resolved) return null
            return (
              <button
                key={i}
                onClick={() => handleSourceClick(citation)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                           text-[11px] font-medium
                           bg-[var(--color-primary-tint)] text-[var(--color-primary)]
                           hover:bg-[var(--color-primary-tint-hover)] transition-colors duration-200"
                aria-label={`View Week ${resolved.week}, Slide ${citation.slide}`}
              >
                <FileText size={11} />
                <span>W{resolved.week} · S{citation.slide}</span>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onRemove(concept.id)}
          className="p-1.5 rounded-lg text-[var(--color-text-tertiary)]
                     hover:text-[var(--color-error)] hover:bg-[var(--color-error-tint)]
                     transition-colors duration-200 opacity-0 group-hover:opacity-100"
          aria-label="Remove from notebook"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
