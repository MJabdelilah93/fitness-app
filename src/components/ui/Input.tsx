import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

// Omit 'prefix': HTMLInputElement already defines prefix as string | undefined,
// which conflicts with our ReactNode variant.
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?:  string
  error?:  string
  hint?:   string
  prefix?: ReactNode   // icon or node shown left of the input
  suffix?: string      // unit text shown right of the input
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, prefix, suffix, className, id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-widest text-zinc-500"
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            'flex items-center h-11 px-3 gap-2 rounded-xl',
            'bg-surface-800 border transition-colors',
            error
              ? 'border-red-500/70 focus-within:border-red-500'
              : 'border-surface-700 focus-within:border-accent-500',
          )}
        >
          {prefix && (
            <span className="text-zinc-500 shrink-0">{prefix}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex-1 min-w-0 bg-transparent text-sm text-zinc-100',
              'focus:outline-none placeholder:text-zinc-600',
              className,
            )}
            {...rest}
          />
          {suffix && (
            <span className="text-zinc-500 text-sm shrink-0 select-none">{suffix}</span>
          )}
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-zinc-600">{hint}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
