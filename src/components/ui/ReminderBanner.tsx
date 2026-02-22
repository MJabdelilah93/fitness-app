import { Dumbbell, Footprints, Scale, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'
import type { ReminderBanner as ReminderBannerType } from '../../hooks/useReminderBanners'

interface Props {
  banner:    ReminderBannerType
  onDismiss: () => void
}

const CONFIG = {
  workout: {
    icon:       <Dumbbell size={16} />,
    colorClass: 'bg-accent-500/10 border-accent-500/30 text-accent-300',
    iconClass:  'text-accent-400',
    btnClass:   'bg-accent-500/20 hover:bg-accent-500/30 text-accent-300',
  },
  steps: {
    icon:       <Footprints size={16} />,
    colorClass: 'bg-green-500/10 border-green-500/30 text-green-300',
    iconClass:  'text-green-400',
    btnClass:   'bg-green-500/20 hover:bg-green-500/30 text-green-300',
  },
  'weigh-in': {
    icon:       <Scale size={16} />,
    colorClass: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    iconClass:  'text-blue-400',
    btnClass:   'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300',
  },
} as const

export function ReminderBanner({ banner, onDismiss }: Props) {
  const navigate = useNavigate()
  const cfg = CONFIG[banner.type]

  const handleAction = () => {
    onDismiss()
    navigate(banner.action.to)
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border px-3 py-2.5',
        cfg.colorClass,
      )}
    >
      {/* Icon */}
      <span className={cn('mt-0.5 shrink-0', cfg.iconClass)}>
        {cfg.icon}
      </span>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold leading-snug">{banner.title}</p>
        <p className="text-[11px] opacity-75 mt-0.5 leading-snug">{banner.message}</p>
      </div>

      {/* Action + dismiss */}
      <div className="flex items-center gap-1 shrink-0 ml-1">
        <button
          type="button"
          onClick={handleAction}
          className={cn(
            'text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors',
            cfg.btnClass,
          )}
        >
          {banner.action.label}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 opacity-50 hover:opacity-90 transition-opacity"
          aria-label="Dismiss"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
