import { Lightbulb, BookOpen, ChevronRight, PanelRightClose, PanelRightOpen } from 'lucide-react'
import { lectures } from '../../lib/data'
import { citationKey } from '../../lib/resolveCitation'

/**
 * LearningSidebar — the right column on desktop showing learning summary.
 *
 * Shows:
 * - "Your Learning" summary with count of concepts explored (unique citation slides)
 * - Recent concepts from citations seen this session
 * - Saved count / link to notebook
 * - Collapsible via a toggle button
 */
export default function LearningSidebar({
  exploredSlides,
  savedCount,
  recentCitations,
  isCollapsed,
  onToggleCollapse,
  onViewChange,
}) {
  const exploredCount = exploredSlides.size

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center pt-4 px-1">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-[var(--color-surface-raised)]
                     text-[var(--color-text-tertiary)] transition-colors duration-200"
          aria-label="Expand learning sidebar"
        >
          <PanelRightOpen size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full border-l border-[var(--color-border)]
                    bg-[var(--color-surface)]">
      {/* Header with collapse button */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)]">
          Your Learning
        </span>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-[var(--color-surface-raised)]
                     text-[var(--color-text-tertiary)] transition-colors duration-200"
          aria-label="Collapse learning sidebar"
        >
          <PanelRightClose size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-5">
        {/* Progress summary */}
          <div className="pb-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {exploredCount}
                </div>

                <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
                  slides explored
                </div>
              </div>

              <button
                onClick={() => onViewChange('learn')}
                className="text-left group"
                aria-label="Open notebook"
              >
                <div className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                  {savedCount}
                </div>

                <div className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)] group-hover:text-[var(--color-primary)] transition-colors">
                  concepts saved
                </div>
              </button>
            </div>
          </div>

        {/* Recent concepts from citations */}
        {recentCitations.length > 0 && (
          <div>
            <h3 className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2">
              Recently Explored
            </h3>
            <div className="space-y-1">
              {recentCitations.slice(0, 5).map((item, i) => (
                <div
                  key={i}
                  className="group px-2 py-2 rounded-lg
                            hover:bg-[var(--color-surface-raised)]
                            transition-colors duration-200"
                >
                  <div className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[var(--color-primary)] flex-shrink-0" />

                    <div className="min-w-0">
                      <div className="text-[var(--text-caption)] text-[var(--color-text-secondary)] truncate">
                        {item.title}
                      </div>

                      <div className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                        Week {item.week} · Slide {item.slideNumber}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course nav */}
        <div>
          <h3 className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-2">
            Course
          </h3>
          <div className="space-y-1">
            {lectures.map((lecture) => {
              const exploredInWeek = lecture.slides.filter(
                s => exploredSlides.has(`${lecture.week}:${s.slide_number}`)
              ).length

              return (
                <button
                  key={lecture.lecture_id}
                  onClick={() => onViewChange('course')}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left
                             hover:bg-[var(--color-surface-raised)] transition-colors duration-200"
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      exploredInWeek > 0 ? 'bg-[var(--color-primary)]' : 'border border-[var(--color-border)]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[var(--text-caption)] font-medium text-[var(--color-text-secondary)] truncate">
                      Week {lecture.week}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
