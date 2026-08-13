import { useState } from 'react'
import { EXACT_PROMPTS } from '../../lib/matchScenario'
import { Beaker, ChevronDown, ChevronUp } from 'lucide-react'

/**
 * DevScenarioTrigger : developer-only panel for testing all 8 streaming scenarios.
 *
 * Only visible when the URL has ?dev=1.
 * Not visible in the polished default UI.
 */

const SCENARIOS = Object.entries(EXACT_PROMPTS).map(([prompt, id]) => ({
  id,
  prompt,
}))

export default function DevScenarioTrigger({ onTrigger }) {
  const [isOpen, setIsOpen] = useState(false)

  // Gate: only show in dev mode or when ?dev=1 is in URL
  const params = new URLSearchParams(window.location.search)
  const isDev = params.get('dev') === '1'

  if (!isDev) return null

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-surface-raised)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-2 text-[var(--text-caption)]
                   text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]
                   transition-colors duration-200"
      >
        <Beaker size={13} />
        <span className="font-medium">Dev: Scenario Trigger</span>
        {isOpen ? <ChevronUp size={13} className="ml-auto" /> : <ChevronDown size={13} className="ml-auto" />}
      </button>

      {isOpen && (
        <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {SCENARIOS.map(({ id, prompt }) => (
            <button
              key={id}
              onClick={() => onTrigger(prompt, id)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium
                         border border-[var(--color-border)]
                         hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-tint)]
                         text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]
                         transition-all duration-200 text-left truncate"
              title={prompt}
            >
              {id}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
