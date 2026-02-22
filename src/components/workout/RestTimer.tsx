import { X } from 'lucide-react'
import { ProgressRing } from '../ui/ProgressRing'

interface RestTimerProps {
  seconds:     number
  totalSeconds: number
  onSkip:      () => void
}

export function RestTimer({ seconds, totalSeconds, onSkip }: RestTimerProps) {
  const progress = seconds / totalSeconds
  const mins     = Math.floor(seconds / 60)
  const secs     = seconds % 60
  const label    = `${mins}:${String(secs).padStart(2, '0')}`

  return (
    /* Fixed bar sits above bottom nav */
    <div className="fixed bottom-20 inset-x-0 z-30 flex justify-center px-4">
      <div className="bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl p-3 flex items-center gap-4 w-full max-w-sm">
        <ProgressRing
          progress={progress}
          size={52}
          strokeWidth={5}
          color="#f97316"
        >
          <span className="text-[11px] font-bold text-zinc-200">{label}</span>
        </ProgressRing>

        <div className="flex-1">
          <p className="text-xs text-zinc-400">Rest timer</p>
          <p className="text-sm font-semibold text-zinc-100">
            {seconds > 0 ? `${label} remaining` : 'Done — next set!'}
          </p>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="w-9 h-9 rounded-xl bg-surface-800 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-surface-700 transition-colors"
          aria-label="Skip rest"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
