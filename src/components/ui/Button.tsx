import { type ReactNode, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size    = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
}

const VARIANT: Record<Variant, string> = {
  primary:
    'bg-accent-500 text-white hover:bg-accent-400 active:bg-accent-600 shadow-sm',
  secondary:
    'bg-surface-800 text-zinc-200 hover:bg-surface-700 active:bg-surface-600',
  ghost:
    'text-zinc-400 hover:text-zinc-200 hover:bg-surface-800 active:bg-surface-700',
  danger:
    'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
  outline:
    'border border-accent-500 text-accent-500 hover:bg-accent-500/10 active:bg-accent-500/20',
}

const SIZE: Record<Size, string> = {
  xs: 'h-7  px-2.5 text-xs  gap-1   rounded-lg',
  sm: 'h-9  px-3   text-sm  gap-1.5 rounded-xl',
  md: 'h-11 px-4   text-sm  gap-2   rounded-xl',
  lg: 'h-12 px-5   text-base gap-2  rounded-2xl',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold',
        'transition-colors duration-150 select-none',
        'disabled:opacity-40 disabled:pointer-events-none',
        VARIANT[variant],
        SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
