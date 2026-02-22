import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'

type BadgeColor =
  | 'orange'
  | 'amber'
  | 'green'
  | 'blue'
  | 'red'
  | 'zinc'
  | 'purple'

interface BadgeProps {
  children: ReactNode
  color?: BadgeColor
  className?: string
  dot?: boolean
}

const COLORS: Record<BadgeColor, string> = {
  orange: 'bg-accent-500/15 text-accent-400 border-accent-500/25',
  amber:  'bg-amber-500/15  text-amber-400  border-amber-500/25',
  green:  'bg-green-500/15  text-green-400  border-green-500/25',
  blue:   'bg-blue-500/15   text-blue-400   border-blue-500/25',
  red:    'bg-red-500/15    text-red-400    border-red-500/25',
  zinc:   'bg-zinc-700/50   text-zinc-400   border-zinc-600/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
}

const DOT_COLORS: Record<BadgeColor, string> = {
  orange: 'bg-accent-400',
  amber:  'bg-amber-400',
  green:  'bg-green-400',
  blue:   'bg-blue-400',
  red:    'bg-red-400',
  zinc:   'bg-zinc-400',
  purple: 'bg-purple-400',
}

export function Badge({ children, color = 'zinc', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'text-[11px] font-semibold px-2 py-0.5 rounded-full border',
        COLORS[color],
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', DOT_COLORS[color])} />
      )}
      {children}
    </span>
  )
}
