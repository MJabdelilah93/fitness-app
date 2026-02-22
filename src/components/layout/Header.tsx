import { useLocation } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { useSettings } from '../../hooks/useSettings'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Today',
  '/workout': 'Workout',
  '/metrics': 'Metrics',
  '/dashboard': 'Progress',
  '/settings': 'Settings',
}

export function Header() {
  const { pathname } = useLocation()
  const { settings } = useSettings()

  const title = PAGE_TITLES[pathname] ?? 'FitTrack'
  const modeLabel = settings?.mode === 'ramadan' ? 'Ramadan' : 'Normal'
  const modeColors =
    settings?.mode === 'ramadan'
      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      : 'bg-accent-500/15 text-accent-400 border-accent-500/30'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-surface-950/95 backdrop-blur border-b border-surface-700">
      {/* Left: logo + title */}
      <div className="flex items-center gap-2">
        <Dumbbell className="text-accent-500 shrink-0" size={20} strokeWidth={2.5} />
        <span className="font-bold text-base tracking-tight">{title}</span>
      </div>

      {/* Right: mode badge */}
      {settings && (
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${modeColors}`}
        >
          {modeLabel}
        </span>
      )}
    </header>
  )
}
