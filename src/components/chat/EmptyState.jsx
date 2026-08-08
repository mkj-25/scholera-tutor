import { Sparkles, ArrowRight } from 'lucide-react'
import { STARTER_PROMPTS } from '../../lib/matchScenario'
import { totalSlides, lectures } from '../../lib/data'

/**
 * EmptyState — the hero screen shown when a student has no messages yet.
 *
 * Renders: course identity (CS 4780 eyebrow, serif headline, instructor byline),
 * an inviting subtitle, 4 starter prompt cards that trigger real scenarios,
 * and a factual course stats footer.
 */
export default function EmptyState({ course, onSendPrompt }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 sm:py-16 bg-dot-grid">
      <div className="max-w-lg w-full text-center">
        {/* Course eyebrow */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5
                        border border-[var(--color-border)] bg-[var(--color-surface)]">
          <Sparkles size={13} className="text-[var(--color-primary)]" />
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[var(--color-text-secondary)]">
            {course?.code || 'CS 4780'}
          </span>
        </div>

        {/* Headline — serif treatment */}
        <h1 className="font-serif text-[var(--text-display)] sm:text-[2.75rem] font-semibold
                       leading-tight text-[var(--color-text-primary)] mb-3"
            style={{ fontFamily: 'var(--font-serif)' }}>
          {course?.title || 'Machine Learning for Engineers'}
        </h1>

        {/* Instructor byline */}
        <p className="text-[var(--text-body)] text-[var(--color-text-secondary)] mb-8">
          {course?.instructor || 'Dr. Elena Márquez'}
        </p>

        {/* Course context */}
        <p className="text-[var(--text-body-sm)] text-[var(--color-text-tertiary)] mb-8">
          {lectures.length} lectures · {totalSlides} slides · grounded in your course materials
        </p>

        {/* Starter prompt cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-10 text-left">
          {STARTER_PROMPTS.map((item) => (
            <button
              key={item.scenario}
              onClick={() => onSendPrompt(item.prompt)}
              className="group flex items-start gap-3 px-4 py-3.5 rounded-[var(--radius-card)]
                         border border-[var(--color-border)] bg-[var(--color-surface)]
                         hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-tint)]
                         transition-all duration-200 text-left"
              aria-label={`Ask: ${item.prompt}`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-primary)] mb-1.5">
                  Week {item.week}
                </div>
                <div className="text-[var(--text-body-sm)] font-medium text-[var(--color-text-primary)] leading-snug">
                  {item.label}
                </div>
              </div>
              <ArrowRight
                size={15}
                className="flex-shrink-0 mt-1 text-[var(--color-text-tertiary)]
                           group-hover:text-[var(--color-primary)] transition-colors duration-200"
              />
            </button>
          ))}
        </div>

        {/* Stats footer */}
        <p className="text-[var(--text-caption)] text-[var(--color-text-tertiary)]">
          {lectures.length} lectures · {totalSlides} slides
        </p>
      </div>
    </div>
  )
}
