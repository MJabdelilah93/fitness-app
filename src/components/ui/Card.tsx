import { type ReactNode, type MouseEventHandler } from 'react'
import { cn } from '../../utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  /** Visual style variant */
  variant?: 'default' | 'raised' | 'accent' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  as?: 'div' | 'section' | 'article'
}

const PADDING = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
}

const VARIANT = {
  default: 'bg-surface-900 border border-surface-700',
  raised:  'bg-surface-800 border border-surface-700',
  accent:  'bg-accent-500/10 border border-accent-500/30',
  ghost:   'border border-surface-700 border-dashed',
}

export function Card({
  children,
  className,
  onClick,
  variant = 'default',
  padding = 'md',
  as: Tag = 'div',
}: CardProps) {
  return (
    <Tag
      className={cn(
        'rounded-2xl',
        VARIANT[variant],
        PADDING[padding],
        onClick && 'cursor-pointer active:opacity-80 transition-opacity',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </Tag>
  )
}
