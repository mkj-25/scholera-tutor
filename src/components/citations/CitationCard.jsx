import { FileText, ChevronRight } from 'lucide-react'
import { resolveCitation } from '../../lib/resolveCitation'
import { lectures } from '../../lib/data'

export default function CitationCard({
  citation,
  onOpenSource,
}) {
  const resolved = resolveCitation(citation, lectures)

  if (!resolved) return null

  const handleClick = () => {
    onOpenSource?.(resolved)
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
      className="
        group
        w-full
        text-left
        flex items-center gap-3
        px-3.5 py-3
        rounded-xl
        border
        relative
        overflow-hidden
        cursor-pointer

        transition-all duration-200

        hover:-translate-y-[1px]
        hover:shadow-[var(--shadow-card)]
      "
      style={{
        backgroundColor: 'var(--surface-deep)',
        borderColor: 'var(--surface-deep-border, var(--color-border-subtle))',
      }}
      aria-label={`View source: Week ${resolved.week}, Slide ${citation.slide} — ${resolved.slide.title}`}
    >
      {/* Accent */}
      <div
        className="
          absolute
          left-0 top-0 bottom-0
          w-[3px]
        "
        style={{
          backgroundColor: 'var(--color-primary)',
        }}
        aria-hidden="true"
      />

      {/* Icon */}
      <div
        className="
          w-8 h-8
          rounded-lg
          flex items-center justify-center
          flex-shrink-0
        "
        style={{
          backgroundColor: 'var(--color-primary-tint)',
        }}
      >
        <FileText
          size={15}
          className="text-[var(--color-primary)]"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span
            className="
              text-[10px]
              font-semibold
              tracking-wider
              uppercase
            "
            style={{
              color: 'var(--color-primary)',
            }}
          >
            Course source
          </span>

          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
            aria-hidden="true"
          />
        </div>

        <div
          className="
            text-[var(--text-body-sm)]
            font-medium
          "
          style={{
            color: 'var(--color-text-primary)',
          }}
        >
          Week {resolved.week} · Slide {citation.slide}
        </div>

        <div
          className="
            text-[var(--text-caption)]
            truncate
          "
          style={{
            color: 'var(--color-text-secondary)',
          }}
        >
          {resolved.slide.title}
        </div>
      </div>

      {/* View */}
      <div
        className="
          flex-shrink-0
          self-center
          flex items-center gap-1
          text-[10px]
          font-medium
          transition-colors
        "
        style={{
          color: 'var(--color-text-tertiary)',
        }}
      >
        <span className="hidden sm:inline">
          View
        </span>

        <ChevronRight size={14} />
      </div>
    </button>
  )
}