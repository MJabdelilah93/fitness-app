import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-6 gap-3',
        className,
      )}
    >
      {icon && (
        <div className="text-surface-600 mb-1">
          {icon}
        </div>
      )}
      <h3 className="text-zinc-300 font-semibold text-base">{title}</h3>
      {description && (
        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
