import { lectures } from '../../lib/data'

/**
 * CourseSidebar — left column on desktop showing course navigation.
 *
 * Displays: course identity block, then compact list of weeks/lectures
 * with subtle explored indicators.
 */
export default function CourseSidebar({ course, exploredSlides, onViewChange }) {
  return (
    <div className="flex flex-col h-full border-r border-[var(--color-border)]
                    bg-[var(--color-surface)]">
      {/* Course identity */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-primary)] mb-1">
          {course?.code || 'CS 4780'}
        </div>
        <div className="text-[var(--text-body)] font-semibold text-[var(--color-text-primary)] leading-snug mb-0.5"
             style={{ fontFamily: 'var(--font-serif)' }}>
          {course?.title || 'Machine Learning for Engineers'}
        </div>
        <div className="text-[var(--text-caption)] text-[var(--color-text-secondary)]">
          {course?.instructor || 'Dr. Elena Márquez'}
        </div>
      </div>

      {/* Lecture list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] px-2 mb-2">
          Lectures
        </div>

        {lectures.map((lecture) => {
          const exploredInWeek = lecture.slides.filter(
            s => exploredSlides.has(`${lecture.week}:${s.slide_number}`)
          ).length

          return (
            <button
              key={lecture.lecture_id}
              onClick={() => onViewChange('course')}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left
                         hover:bg-[var(--color-surface-raised)] transition-colors duration-200 group"
            >
              {/* Explored indicator */}
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200 ${
                  exploredInWeek > 0 ? 'bg-[var(--color-primary)]' : 'border border-[var(--color-border)]'
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="text-[var(--text-body-sm)] font-medium text-[var(--color-text-primary)] truncate leading-snug">
                  Week {lecture.week}
                </div>
                <div className="text-[11px] text-[var(--color-text-tertiary)] truncate">
                  {lecture.title}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
