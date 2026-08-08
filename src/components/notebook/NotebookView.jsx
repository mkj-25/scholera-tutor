import { BookOpen, FileText, Trash2, Lightbulb } from 'lucide-react'
import { resolveCitation } from '../../lib/resolveCitation'
import { lectures } from '../../lib/data'

/**
 * NotebookView — the Learn tab showing saved concepts as clean cards.
 */
export default function NotebookView({ concepts, onRemove, onOpenSource }) {
  if (concepts.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ backgroundColor: 'var(--color-primary-tint)' }}
        >
          <BookOpen size={26} style={{ color: 'var(--color-primary)' }} />
        </div>
        <h2
          className="font-semibold mb-2"
          style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)' }}
        >
          My Notebook
        </h2>
        <p
          className="max-w-xs leading-relaxed"
          style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}
        >
          Save tutor answers using the bookmark icon to build your personal study notes.
          They'll appear here for quick revision.
        </p>
        <div
          className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium"
          style={{
            color: 'var(--color-text-tertiary)',
            borderColor: 'var(--color-border-subtle)',
            backgroundColor: 'var(--color-surface-raised)',
          }}
        >
          <Lightbulb size={13} />
          Tip: hover any tutor answer and click Save
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--color-primary-tint)' }}
          >
            <BookOpen size={20} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2
              className="font-semibold leading-snug"
              style={{ fontSize: 'var(--text-h3)', color: 'var(--color-text-primary)' }}
            >
              My Notebook
            </h2>
            <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-text-secondary)' }}>
              {concepts.length} concept{concepts.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>

        {/* Cards */}
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

function SavedConceptCard({ concept, onRemove, onOpenSource }) {
  const handleSourceClick = (citation) => {
    const resolved = resolveCitation(citation, lectures)
    if (resolved && onOpenSource) {
      onOpenSource(resolved)
    }
  }

  // Format date
  const savedDate = concept.savedAt
    ? new Date(concept.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div
      className="p-4 rounded-[var(--radius-card)] border group transition-shadow duration-200 hover:shadow-[var(--shadow-card)]"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className="font-medium leading-snug"
          style={{ fontSize: 'var(--text-body)', color: 'var(--color-text-primary)' }}
        >
          {concept.title}
        </h3>
        <button
          onClick={() => onRemove(concept.id)}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors duration-200
                     opacity-0 group-hover:opacity-100
                     hover:bg-[var(--color-error-tint)]"
          style={{ color: 'var(--color-text-tertiary)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-error)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-tertiary)' }}
          aria-label="Remove from notebook"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Snippet */}
      <p
        className="leading-relaxed mb-3 line-clamp-3"
        style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-text-secondary)' }}
      >
        {concept.snippet?.replace(/[*#`$]/g, '').replace(/\\/g, '').trim()}
      </p>

      {/* Footer: citations + date */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex flex-wrap gap-1.5">
          {concept.citations?.map((citation, i) => {
            const resolved = resolveCitation(citation, lectures)
            if (!resolved) return null
            return (
              <button
                key={i}
                onClick={() => handleSourceClick(citation)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium
                           transition-colors duration-150
                           hover:bg-[var(--color-primary-tint-hover)]"
                style={{
                  backgroundColor: 'var(--color-primary-tint)',
                  color: 'var(--color-primary)',
                }}
                aria-label={`View Week ${resolved.week}, Slide ${citation.slide}`}
              >
                <FileText size={11} />
                W{resolved.week} · S{citation.slide}
              </button>
            )
          })}
        </div>

        {savedDate && (
          <span className="text-[10px]" style={{ color: 'var(--color-text-tertiary)' }}>
            Saved {savedDate}
          </span>
        )}
      </div>
    </div>
  )
}
