import { useState } from 'react'
import { BookOpen, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react'
import scholeraLogo from '../../assets/scholera_logo.png'

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
        {theme === 'dark' ? <Sun size={16} color="#fffc97" /> : <Moon size={16} />}
      </button>

      {/* Card container */}
      <div
        className="relative z-10 w-full max-w-[440px] mx-auto px-5 flex flex-col items-center"
        style={{ gap: '2rem' }}
      >
        {/* Brand */}
        <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'rgb(252, 253, 253)',
                  border: '1.5px solid rgba(255, 255, 255, 0.24)',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                }}
              >
                <img
                  src={scholeraLogo}
                  alt="Scholera"
                  className="w-15 h-15 object-contain"
                  style={{
                    filter: 'brightness(10) invert(1)',
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
                
              </div>

              <ArrowRight
                size={16}
                className="flex-shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
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
                
              </div>

              <ArrowRight
                size={16}
                className="flex-shrink-0 mt-1 transition-transform duration-200 group-hover:translate-x-1"
                style={{ color: 'var(--color-text-tertiary)' }}
              />
            </div>

            
          </button>
        </div>

        {/* Footer note */}
        <p
          className="text-center text-[0.72rem]"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          CS 4780 · Machine Learning for Engineers
        </p>
      </div>
    </div>
  )
}
