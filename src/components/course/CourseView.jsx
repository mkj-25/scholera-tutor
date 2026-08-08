import { useState, useCallback } from 'react'
import { ChevronDown, ChevronRight, GraduationCap } from 'lucide-react'
import { lectures, totalSlides } from '../../lib/data'

/**
 * CourseView — shows the three weeks as a real curriculum.
 *
 * Uses actual lecture JSON data. Tracks which slides have been
 * viewed/explored via citations during this session with subtle dot markers.
 * Uses exploration language only — "explored", "viewed" — never "mastered".
 */
export default function CourseView({ exploredSlides, onOpenSlide }) {
  // Count total explored slides
  const exploredCount = exploredSlides.size

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with dot grid background */}
        <div className="rounded-2xl p-6 mb-6 bg-dot-grid border border-[var(--color-border)]"
             style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ backgroundColor: 'var(--color-primary-tint)' }}>
              <GraduationCap size={20} className="text-[var(--color-primary)]" />
            </div>
            <div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-[var(--color-text-tertiary)] mb-0.5">
                CS 4780 · Course Roadmap
              </div>
              <h2 className="text-[var(--text-h2)] font-semibold text-[var(--color-text-primary)]"
                  style={{ fontFamily: 'var(--font-serif)' }}>
                Machine Learning for Engineers
              </h2>
            </div>
          </div>
          <p className="text-[var(--text-body-sm)] text-[var(--color-text-secondary)] mt-3">
            {exploredCount} of {totalSlides} slides explored this session
          </p>
        </div>

        {/* Week cards */}
        <div className="space-y-3">
          {lectures.map((lecture) => (
            <WeekCard
              key={lecture.lecture_id}
              lecture={lecture}
              exploredSlides={exploredSlides}
              onOpenSlide={onOpenSlide}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * WeekCard — expandable card for a single lecture/week.
 */
function WeekCard({ lecture, exploredSlides, onOpenSlide }) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Count explored slides for this lecture
  const exploredInWeek = lecture.slides.filter(
    s => exploredSlides.has(`${lecture.week}:${s.slide_number}`)
  ).length

  const handleSlideClick = useCallback((slide) => {
    if (onOpenSlide) {
      onOpenSlide(lecture, slide)
    }
  }, [lecture, onOpenSlide])

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)]
                    bg-[var(--color-surface)] overflow-hidden">
      {/* Week header — clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left
                   hover:bg-[var(--color-surface-raised)] transition-colors duration-200"
        aria-expanded={isExpanded}
        aria-label={`Week ${lecture.week}: ${lecture.title}`}
      >
        {/* Week number badge */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                        text-[var(--text-body-sm)] font-bold"
             style={{
               backgroundColor: exploredInWeek > 0 ? 'var(--color-primary-tint)' : 'var(--color-surface-raised)',
               color: exploredInWeek > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
             }}>
          W{lecture.week}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[var(--text-body)] font-medium text-[var(--color-text-primary)] truncate">
            {lecture.title}
          </div>
          <div className="text-[var(--text-caption)] text-[var(--color-text-secondary)]">
            {lecture.slides.length} slides
            {exploredInWeek > 0 && ` · ${exploredInWeek} explored`}
          </div>
        </div>

        {isExpanded ? (
          <ChevronDown size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-[var(--color-text-tertiary)] flex-shrink-0" />
        )}
      </button>

      {/* Slide list */}
      {isExpanded && (
        <div className="border-t border-[var(--color-border-subtle)] px-2 py-1.5">
          {lecture.slides.map((slide) => {
            const isExplored = exploredSlides.has(`${lecture.week}:${slide.slide_number}`)
            return (
              <button
                key={slide.slide_number}
                onClick={() => handleSlideClick(slide)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left
                           hover:bg-[var(--color-surface-raised)] transition-colors duration-200"
                aria-label={`Slide ${slide.slide_number}: ${slide.title}`}
              >
                {/* Explored indicator dot */}
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isExplored
                      ? 'bg-[var(--color-primary)]'
                      : 'border border-[var(--color-border)]'
                  }`}
                  aria-hidden="true"
                />

                {/* Slide number pill */}
                <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] w-6 text-right flex-shrink-0">
                  {slide.slide_number}
                </span>

                {/* Slide title */}
                <span className="text-[var(--text-body-sm)] text-[var(--color-text-secondary)] truncate">
                  {slide.title}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
