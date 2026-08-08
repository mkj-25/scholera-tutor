import {
  useEffect,
  useCallback,
  useRef,
} from 'react'

import {
  X,
  ChevronLeft,
  ChevronRight,
  StickyNote,
  ImageIcon,
} from 'lucide-react'

import MarkdownRenderer from '../ui/MarkdownRenderer'

export default function SourcePanel({
  isOpen,
  onClose,
  lecture,
  slide,
  onNavigate,
  onSlideViewed,
}) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener(
      'keydown',
      onKeyDown
    )

    return () => {
      document.removeEventListener(
        'keydown',
        onKeyDown
      )
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (
      isOpen &&
      lecture &&
      slide &&
      onSlideViewed
    ) {
      onSlideViewed(
        lecture.week,
        slide.slide_number
      )
    }
  }, [
    isOpen,
    lecture?.week,
    slide?.slide_number,
    onSlideViewed,
  ])

  useEffect(() => {
    if (
      isOpen &&
      panelRef.current
    ) {
      panelRef.current.focus()
    }
  }, [isOpen])

  const goTo = useCallback(
    (newSlide) => {
      if (onNavigate && lecture) {
        onNavigate(
          lecture,
          newSlide
        )
      }
    },
    [lecture, onNavigate]
  )

  if (!lecture || !slide) {
    return null
  }

  const slideIndex =
    lecture.slides.findIndex(
      (s) =>
        s.slide_number ===
        slide.slide_number
    )

  const totalSlides =
    lecture.slides.length

  const hasPrev =
    slideIndex > 0

  const hasNext =
    slideIndex <
    totalSlides - 1

  const formulaContent =
    slide.formulas?.length
      ? slide.formulas
          .map((f) => `$$${f}$$`)
          .join('\n\n')
      : null

  const content = (
    <>
      {/* Header */}
      <div
        className="
          px-6 py-5
          border-b
          flex-shrink-0
        "
        style={{
          borderColor:
            'var(--color-border)',
        }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div
              className="
                flex items-center gap-2
                text-[10px]
                font-semibold
                tracking-widest
                uppercase
                mb-2
              "
              style={{
                color:
                  'var(--color-primary)',
              }}
            >
              <span>
                Week {lecture.week}
              </span>

              <span
                style={{
                  color:
                    'var(--color-text-tertiary)',
                }}
              >
                ·
              </span>

              <span
                style={{
                  color:
                    'var(--color-text-secondary)',
                }}
              >
                Slide {slide.slide_number}
              </span>
            </div>

            <h2
              className="
                text-sm
                font-semibold
                leading-snug
              "
              style={{
                color:
                  'var(--color-text-primary)',
              }}
            >
              {lecture.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
              w-8 h-8
              rounded-lg
              flex items-center justify-center
              flex-shrink-0
              transition-colors
              hover:bg-[var(--color-surface-raised)]
            "
            style={{
              color:
                'var(--color-text-secondary)',
            }}
            aria-label="Close source panel"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className="
          flex-1
          overflow-y-auto
          px-6 py-6
          space-y-6
        "
      >
        {/* Slide title */}
        <div>
          <div
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-widest
              mb-2
            "
            style={{
              color:
                'var(--color-text-tertiary)',
            }}
          >
            Lecture slide
          </div>

          <h3
            className="
              text-xl
              font-semibold
              leading-snug
            "
            style={{
              color:
                'var(--color-text-primary)',
              fontFamily:
                'var(--font-serif)',
            }}
          >
            {slide.title}
          </h3>
        </div>

        {/* Bullets */}
        {slide.bullets?.length > 0 && (
          <div>
            <ul className="space-y-3">
              {slide.bullets.map(
                (bullet, i) => (
                  <li
                    key={i}
                    className="
                      flex items-start gap-3
                      text-sm
                      leading-relaxed
                    "
                    style={{
                      color:
                        'var(--color-text-secondary)',
                    }}
                  >
                    <span
                      className="
                        mt-[9px]
                        w-1.5 h-1.5
                        rounded-full
                        flex-shrink-0
                      "
                      style={{
                        backgroundColor:
                          'var(--color-primary)',
                      }}
                    />

                    <span>
                      {bullet}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        {/* Formula */}
        {formulaContent && (
          <section>
            <div
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-widest
                mb-2
              "
              style={{
                color:
                  'var(--color-text-tertiary)',
              }}
            >
              Formula
            </div>

            <div
              className="
                p-4
                rounded-xl
                border
                overflow-x-auto
              "
              style={{
                backgroundColor:
                  'var(--color-surface-raised)',
                borderColor:
                  'var(--color-border-subtle)',
              }}
            >
              <MarkdownRenderer
                content={formulaContent}
              />
            </div>
          </section>
        )}

        {/* Figure */}
        {slide.figure?.description && (
          <section>
            <div
              className="
                flex items-center gap-2
                text-[10px]
                font-semibold
                uppercase
                tracking-widest
                mb-2
              "
              style={{
                color:
                  'var(--color-text-tertiary)',
              }}
            >
              <ImageIcon size={13} />
              Figure
            </div>

            <div
              className="
                p-4
                rounded-xl
                border
              "
              style={{
                backgroundColor:
                  'var(--color-primary-tint)',
                borderColor:
                  'var(--color-border)',
              }}
            >
              <p
                className="
                  text-sm
                  italic
                  leading-relaxed
                  m-0
                "
                style={{
                  color:
                    'var(--color-text-secondary)',
                }}
              >
                {slide.figure.description}
              </p>
            </div>
          </section>
        )}

        {/* Professor note */}
        {slide.notes && (
          <section>
            <div
              className="
                flex items-center gap-2
                text-[10px]
                font-semibold
                uppercase
                tracking-widest
                mb-2
              "
              style={{
                color:
                  'var(--color-accent-cyan)',
              }}
            >
              <StickyNote size={13} />
              Professor's Note
            </div>

            <div
              className="
                p-4
                rounded-xl
                border
              "
              style={{
                backgroundColor:
                  'var(--color-surface-raised)',
                borderColor:
                  'var(--color-border-subtle)',
              }}
            >
              <p
                className="
                  text-sm
                  leading-relaxed
                  m-0
                "
                style={{
                  color:
                    'var(--color-text-secondary)',
                }}
              >
                {slide.notes}
              </p>
            </div>
          </section>
        )}
      </div>

      {/* Navigation */}
      <div
        className="
          flex items-center
          justify-between
          px-6 py-3.5
          border-t
          flex-shrink-0
        "
        style={{
          borderColor:
            'var(--color-border)',
        }}
      >
        <button
          onClick={() =>
            hasPrev &&
            goTo(
              lecture.slides[
                slideIndex - 1
              ]
            )
          }
          disabled={!hasPrev}
          className="
            flex items-center gap-1.5
            px-2.5 py-1.5
            rounded-lg
            text-xs
            font-medium
            disabled:opacity-30
            disabled:cursor-not-allowed
            hover:bg-[var(--color-surface-raised)]
          "
          style={{
            color:
              'var(--color-text-secondary)',
          }}
        >
          <ChevronLeft size={15} />
          Previous
        </button>

        <span
          className="text-[11px]"
          style={{
            color:
              'var(--color-text-tertiary)',
          }}
        >
          {slide.slide_number} of {totalSlides}
        </span>

        <button
          onClick={() =>
            hasNext &&
            goTo(
              lecture.slides[
                slideIndex + 1
              ]
            )
          }
          disabled={!hasNext}
          className="
            flex items-center gap-1.5
            px-2.5 py-1.5
            rounded-lg
            text-xs
            font-medium
            disabled:opacity-30
            disabled:cursor-not-allowed
            hover:bg-[var(--color-surface-raised)]
          "
          style={{
            color:
              'var(--color-text-secondary)',
          }}
        >
          Next
          <ChevronRight size={15} />
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Backdrop */}
      <div
        className="
          fixed inset-0
          z-40
          transition-opacity duration-250
        "
        style={{
          background:
            'rgba(15, 23, 42, 0.28)',
          opacity: isOpen ? 1 : 0,
          pointerEvents:
            isOpen ? 'auto' : 'none',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Desktop */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label={`Source: ${slide.title}`}
        aria-modal="true"
        className="
          hidden sm:flex
          fixed
          top-0 right-0
          h-full
          w-[440px]
          lg:w-[480px]
          z-50
          flex-col
        "
        style={{
          backgroundColor:
            'var(--color-surface)',
          borderLeft:
            '1px solid var(--color-border)',
          boxShadow:
            'var(--shadow-panel)',

          transform: isOpen
            ? 'translateX(0)'
            : 'translateX(100%)',

          transition:
            'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {content}
      </div>

      {/* Mobile */}
      <div
        role="dialog"
        aria-label={`Source: ${slide.title}`}
        aria-modal="true"
        className="
          sm:hidden
          fixed
          inset-x-0
          bottom-0
          z-50
          flex flex-col
          rounded-t-2xl
          overflow-hidden
        "
        style={{
          backgroundColor:
            'var(--color-surface)',
          maxHeight: '88vh',

          transform: isOpen
            ? 'translateY(0)'
            : 'translateY(100%)',

          transition:
            'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{
              backgroundColor:
                'var(--color-border)',
            }}
          />
        </div>

        {content}
      </div>
    </>
  )
}