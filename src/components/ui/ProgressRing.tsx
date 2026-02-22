import { type ReactNode } from 'react'

interface ProgressRingProps {
  /** 0 – 1 (clamped internally). Values > 1 show a full ring. */
  progress:    number
  size?:       number
  strokeWidth?: number
  /** Tailwind-compatible hex or CSS colour string */
  color?:      string
  trackColor?: string
  children?:   ReactNode
  className?:  string
}

export function ProgressRing({
  progress,
  size        = 80,
  strokeWidth = 7,
  color       = '#f97316',   // accent-500
  trackColor  = '#27272a',   // surface-800
  children,
  className,
}: ProgressRingProps) {
  const r      = (size - strokeWidth) / 2
  const circ   = 2 * Math.PI * r
  const clamped = Math.min(Math.max(progress, 0), 1)
  const offset  = circ - clamped * circ

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>

      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
