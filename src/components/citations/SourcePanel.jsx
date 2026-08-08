import { useEffect, useCallback, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, StickyNote, ImageIcon } from 'lucide-react'
import MarkdownRenderer from '../ui/MarkdownRenderer'

/**
 * SourcePanel — displays the actual lecture slide behind a citation.
 *
 * Desktop (≥640px): slides in from the right as a fixed side panel.
 * Mobile (<640px): slides up from the bottom as a bottom sheet.
 *
 * Both share the same content; only the container/transition differ.
 * Renders real data from lecture JSON — no invented content.
 */
export default function SourcePanel({ isOpen, onClose, lecture, slide, onNavigate, onSlideViewed }) {
  const panelRef = useRef(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  // Track this slide as explored when opened
  useEffect(() => {
    if (isOpen && lecture && slide && onSlideViewed) {
      onSlideViewed(lecture.week, slide.slide_number)
    }
  }, [isOpen, lecture?.week, slide?.slide_number]) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus panel on open for keyboard users
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus()
    }
  }, [isOpen])

  // goTo must be declared before any early return (Rules of Hooks)
  const goTo = useCallback((newSlide) => {
    if (onNavigate && lecture) onNavigate(lecture, newSlide)
  }, [lecture, onNavigate])

  if (!lecture || !slide) return null

  const slideIndex = lecture.slides.findIndex(s => s.slide_number === slide.slide_number)
  const totalSlides = lecture.slides.length
  const hasPrev = slideIndex > 0
  const hasNext = slideIndex < totalSlides - 1

  // Render formulas as display math
  const formulaContent = slide.formulas?.length
    ? slide.formulas.map(f => `$$${f}$$`).join('\n\n')
    : null

  const content = (
    <>
      {/* Header */}
      <div
        className="flex items-start justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="min-w-0 pr-3">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'var(--color-primary)' }}
            >
              Week {lecture.week}
            </span>
            <span style={{ color: 'var(--color-text-tertiary)' }}>·</span>
            <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
              Slide {slide.slide_number} / {totalSlides}
            </span>
          </div>
          <h2
            className="text-sm font-semibold leading-snug"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {lecture.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Close source panel"
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-raised)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Body — scrollable */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {/* Slide title */}
        <h3
          className="text-base font-semibold leading-snug"
          style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-serif)' }}
        >
          {slide.title}
        </h3>

        {/* Bullets */}
        {slide.bullets?.length > 0 && (
          <ul className="space-y-2">
            {slide.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 text-sm leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                <span
                  className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                {bullet}
              </li>
            ))}
          </ul>
        )}

        {/* Formulas */}
        {formulaContent && (
          <div
            className="p-4 rounded-xl border"
            style={{
              background: 'var(--color-surface-raised)',
              borderColor: 'var(--color-border-subtle)',
            }}
          >
            <MarkdownRenderer content={formulaContent} />
          </div>
        )}

        {/* Figure description */}
        {slide.figure?.description && (
          <div
            className="p-4 rounded-xl border"
            style={{
              background: 'var(--color-primary-tint)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <ImageIcon size={13} style={{ color: 'var(--color-primary)' }} />
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-primary)' }}
              >
                Figure
              </span>
            </div>
            <p className="text-sm italic leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {slide.figure.description}
            </p>
          </div>
        )}

        {/* Speaker notes */}
        {slide.notes && (
          <div
            className="p-4 rounded-xl border"
            style={{
              background: 'var(--color-surface-raised)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <StickyNote size={13} style={{ color: 'var(--color-accent-cyan)' }} />
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: 'var(--color-accent-cyan)' }}
              >
                Professor's Note
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {slide.notes}
            </p>
          </div>
        )}
      </div>

      {/* Slide navigation */}
      <div
        className="flex items-center justify-between px-5 py-3 border-t flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          onClick={() => hasPrev && goTo(lecture.slides[slideIndex - 1])}
          disabled={!hasPrev}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <span className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          {slide.slide_number} of {totalSlides}
        </span>
        <button
          onClick={() => hasNext && goTo(lecture.slides[slideIndex + 1])}
          disabled={!hasNext}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-label="Next slide"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-250"
        style={{
          background: 'rgba(0,0,0,0.35)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop: right panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`Source: ${slide.title}`}
        aria-modal="true"
        className="hidden sm:flex fixed top-0 right-0 h-full w-[420px] lg:w-[460px] z-50 flex-col"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderLeft: '1px solid var(--color-border)',
          boxShadow: isOpen ? 'var(--shadow-panel)' : 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {content}
      </div>

      {/* Mobile: bottom sheet */}
      <div
        role="dialog"
        aria-label={`Source: ${slide.title}`}
        aria-modal="true"
        className="sm:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          maxHeight: '85vh',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Bottom sheet drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ backgroundColor: 'var(--color-border)' }}
          />
        </div>
        {content}
      </div>
    </>
  )
}
