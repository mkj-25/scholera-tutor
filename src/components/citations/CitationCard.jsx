import { FileText, ChevronRight } from 'lucide-react'
import { resolveCitation } from '../../lib/resolveCitation'
import { lectures } from '../../lib/data'

/**
 * CitationCard — renders a single citation as a clickable card.
 *
 * Displays: SOURCE eyebrow, WEEK N · SLIDE M, the slide's actual title,
 * and a "View source" affordance. Left edge gets a thin blue accent bar.
 *
 * @param {{ lecture: string, slide: number }} citation
 * @param {function} onOpenSource — called with the resolved { lecture, slide, week } data
 */
export default function CitationCard({ citation, onOpenSource }) {
  const resolved = resolveCitation(citation, lectures)

  if (!resolved) return null

  const handleClick = () => {
    if (onOpenSource) {
      onOpenSource(resolved)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  return (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className="group w-full text-left flex items-start gap-3 px-3.5 py-3 rounded-[var(--radius-card)]
                 border border-[var(--color-border)] bg-[var(--color-surface)]
                 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-tint)]
                 transition-all duration-200 cursor-pointer
                 relative overflow-hidden"
      aria-label={`View source: Week ${resolved.week}, Slide ${citation.slide} — ${resolved.slide.title}`}
    >
      {/* Blue accent bar on left edge */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[var(--radius-card)]"
        style={{ backgroundColor: 'var(--color-primary)' }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary-tint)' }}
      >
        <FileText size={16} className="text-[var(--color-primary)]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
            Source
          </span>
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
        </div>
        <div className="text-[var(--text-body-sm)] font-medium text-[var(--color-text-primary)]">
          Week {resolved.week} · Slide {citation.slide}
        </div>
        <div className="text-[var(--text-caption)] text-[var(--color-text-secondary)] truncate">
          {resolved.slide.title}
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight
        size={16}
        className="flex-shrink-0 mt-2.5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary)]
                   transition-colors duration-200"
      />
    </button>
  )
}
