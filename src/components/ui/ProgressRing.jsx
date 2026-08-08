import { totalSlides } from '../../lib/data'

/**
 * ProgressRing — circular SVG progress indicator.
 *
 * @param {Set} exploredSlides — Set of "week:slideNumber" keys
 * @param {number} savedCount — number of saved concepts
 * @param {string} size — 'sm' | 'md' | 'lg'
 */
export default function ProgressRing({ exploredSlides, savedCount = 0, size = 'md' }) {
  const exploredCount = exploredSlides.size

  const pct = totalSlides > 0 ? Math.round((exploredCount / totalSlides) * 100) : 0

  // SVG ring parameters
  const configs = {
    sm: { r: 14, stroke: 3, viewBox: 36, fontSize: '10px' },
    md: { r: 38, stroke: 5, viewBox: 96, fontSize: '18px' },
    lg: { r: 54, stroke: 6, viewBox: 128, fontSize: '24px' },
  }

  const cfg = configs[size] || configs.md
  const { r, stroke } = cfg
  const cx = cfg.viewBox / 2
  const cy = cfg.viewBox / 2
  const circumference = 2 * Math.PI * r
  const strokeDashoffset = circumference - (pct / 100) * circumference

  if (size === 'sm') {
    return (
      <SmallRing
        r={r} stroke={stroke} cx={cx} cy={cy}
        viewBox={cfg.viewBox} circumference={circumference}
        strokeDashoffset={strokeDashoffset} pct={pct}
      />
    )
  }

  return (
    <FullRing
      r={r} stroke={stroke} cx={cx} cy={cy}
      viewBox={cfg.viewBox} circumference={circumference}
      strokeDashoffset={strokeDashoffset} pct={pct}
      exploredCount={exploredCount} savedCount={savedCount}
      fontSize={cfg.fontSize}
    />
  )
}

function SmallRing({ r, stroke, cx, cy, viewBox, circumference, strokeDashoffset, pct }) {
  return (
    <svg width={viewBox} height={viewBox} viewBox={`0 0 ${viewBox} ${viewBox}`} aria-label={`${pct}% explored`}>
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={stroke}
      />
      {/* Progress arc */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)' }}
      />
    </svg>
  )
}

function FullRing({ r, stroke, cx, cy, viewBox, circumference, strokeDashoffset, pct,
                    exploredCount, savedCount, fontSize }) {
  return (
    <div className="flex flex-col items-center">
      {/* Ring */}
      <div className="relative">
        <svg
          width={viewBox} height={viewBox}
          viewBox={`0 0 ${viewBox} ${viewBox}`}
          aria-label={`Course progress: ${pct}%`}
        >
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          {/* Background subtle glow ring */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={stroke}
            strokeOpacity={0.08}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          {/* Progress arc */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)' }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="font-bold tracking-tight leading-none"
            style={{ fontSize, color: 'var(--color-text-primary)' }}
          >
            {pct}%
          </div>
          <div className="text-[10px] mt-1 font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            explored
          </div>
        </div>
      </div>

      {/* Stats below ring */}
      <div className="flex items-center gap-5 mt-4">
        <div className="text-center">
          <div className="text-lg font-semibold leading-none" style={{ color: 'var(--color-text-primary)' }}>
            {exploredCount}
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            slides
          </div>
        </div>
        <div
          className="w-px h-6"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <div className="text-center">
          <div className="text-lg font-semibold leading-none" style={{ color: 'var(--color-text-primary)' }}>
            {savedCount}
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            saved
          </div>
        </div>
        <div
          className="w-px h-6"
          style={{ backgroundColor: 'var(--color-border)' }}
        />
        <div className="text-center">
          <div className="text-lg font-semibold leading-none" style={{ color: 'var(--color-text-primary)' }}>
            {totalSlides}
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--color-text-tertiary)' }}>
            total
          </div>
        </div>
      </div>
    </div>
  )
}
