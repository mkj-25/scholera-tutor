import { useState } from 'react'
import { BookOpen, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react'
import scholeraLogo from '../../assets/scholera_logo.png'

/**
 * StudentSelector — entry screen shown before the main tutor interface.
 * Replaces the old AuthScreen. Lets the evaluator choose between the
 * existing-student state (conversation.json) and the new-student state
 * (conversation-empty.json).
 */
export default function StudentSelector({ onSelect, theme, onToggleTheme }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Subtle dot-grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--grid-dot-color) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Ambient glow — top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[280px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(37,99,235,0.09) 0%, transparent 70%)',
        }}
      />

      {/* Theme toggle — top right */}
      <button
        id="selector-theme-toggle"
        onClick={onToggleTheme}
        className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center transition-colors duration-200"
        style={{
          color: 'var(--color-text-tertiary)',
          border: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-surface)',
        }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Card container */}
      <div
        className="relative z-10 w-full max-w-[440px] mx-auto px-5 flex flex-col items-center"
        style={{ gap: '2rem' }}
      >
        {/* Brand */}
        <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(170, 184, 255, 0.36)',
                  border: '1.5px solid rgba(255, 255, 255, 0.24)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                }}
              >
                <img
                  src={scholeraLogo}
                  alt="Scholera"
                  className="w-7 h-7 object-contain"
                  style={{
                    filter: 'brightness(7) invert(1)',
                  }}
                />
              </div>

        {/* Option cards */}
        <div className="w-full flex flex-col gap-3">

          {/* ── Option 1: Existing student ── */}
          <button
            id="selector-existing-student"
            onClick={() => onSelect('existing')}
            onMouseEnter={() => setHovered('existing')}
            onMouseLeave={() => setHovered(null)}
            className="w-full text-left rounded-2xl p-5 transition-all duration-200 group"
            style={{
              backgroundColor: hovered === 'existing'
                ? 'var(--color-surface-hover)'
                : 'var(--glass-bg)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: hovered === 'existing'
                ? '1px solid var(--color-primary)'
                : '1px solid var(--glass-border)',
              boxShadow: hovered === 'existing'
                ? '0 0 0 3px var(--color-primary-tint), var(--shadow-card)'
                : 'var(--shadow-xs)',
              transform: hovered === 'existing' ? 'translateY(-2px)' : 'translateY(0)',
            }}
            aria-label="Continue as existing student"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: 'var(--color-primary-tint)',
                  border: '1px solid var(--color-primary)',
                }}
              >
                <BookOpen size={18} style={{ color: 'var(--color-primary)' }} />
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="text-[0.9rem] font-semibold leading-snug"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Continue existing student
                </div>
                <div
                  className="text-[0.8rem] mt-1 leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Continue a student's existing learning journey — with prior messages, citations, and progress.
                </div>
              </div>

              <ArrowRight
                size={16}
                className="flex-shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            </div>

            {/* Badge */}
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 text-[0.7rem] font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-primary-tint)',
                  color: 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
                conversation.json
              </span>
            </div>
          </button>

          {/* ── Option 2: New student ── */}
          <button
            id="selector-new-student"
            onClick={() => onSelect('new')}
            onMouseEnter={() => setHovered('new')}
            onMouseLeave={() => setHovered(null)}
            className="w-full text-left rounded-2xl p-5 transition-all duration-200 group"
            style={{
              backgroundColor: hovered === 'new'
                ? 'var(--color-surface-hover)'
                : 'var(--glass-bg)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: hovered === 'new'
                ? '1px solid var(--color-border)'
                : '1px solid var(--glass-border)',
              boxShadow: hovered === 'new'
                ? 'var(--shadow-card)'
                : 'var(--shadow-xs)',
              transform: hovered === 'new' ? 'translateY(-2px)' : 'translateY(0)',
            }}
            aria-label="Start as new student"
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Sparkles size={18} style={{ color: 'var(--color-text-secondary)' }} />
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="text-[0.9rem] font-semibold leading-snug"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Start as new student
                </div>
                <div
                  className="text-[0.8rem] mt-1 leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Start with a clean conversation and explore the course from the beginning.
                </div>
              </div>

              <ArrowRight
                size={16}
                className="flex-shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            </div>

            {/* Badge */}
            <div className="mt-3 flex items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 text-[0.7rem] font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'var(--color-surface-raised)',
                  color: 'var(--color-text-tertiary)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-text-tertiary)' }}
                />
                conversation-empty.json
              </span>
            </div>
          </button>
        </div>

        {/* Footer note */}
        <p
          className="text-center text-[0.72rem]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          CS 4780 · Machine Learning for Engineers · Demo
        </p>
      </div>
    </div>
  )
}
