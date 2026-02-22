import { Check } from 'lucide-react'
import { cn } from '../../utils/cn'
import type { WeightUnit } from '../../types'

export interface SetInput {
  weight:    string   // controlled string for <input>
  reps:      string
  rir:       number
  completed: boolean
}

interface SetRowProps {
  setNumber:  number
  input:      SetInput
  targetReps: string     // e.g. "8-12"
  weightUnit: WeightUnit
  onChange:   (patch: Partial<SetInput>) => void
  onComplete: () => void
}

const RIR_OPTIONS = [0, 1, 2, 3, 4] as const

export function SetRow({
  setNumber,
  input,
  targetReps,
  weightUnit,
  onChange,
  onComplete,
}: SetRowProps) {
  const done = input.completed

  return (
    <div
      className={cn(
        'flex items-center gap-2 py-2 border-b border-surface-800 last:border-0 transition-colors',
        done && 'opacity-60',
      )}
    >
      {/* Set number */}
      <span className="text-xs text-zinc-600 w-5 shrink-0 text-center font-mono">
        {setNumber}
      </span>

      {/* Weight */}
      <div className="flex items-center bg-surface-800 rounded-lg px-2 h-9 gap-1 w-20 shrink-0">
        <input
          type="number"
          inputMode="decimal"
          value={input.weight}
          onChange={(e) => onChange({ weight: e.target.value })}
          placeholder="0"
          disabled={done}
          className="w-full bg-transparent text-center text-sm text-zinc-100 focus:outline-none disabled:opacity-50"
        />
        <span className="text-[10px] text-zinc-600 shrink-0">{weightUnit}</span>
      </div>

      {/* × */}
      <span className="text-zinc-600 text-xs shrink-0">×</span>

      {/* Reps */}
      <div className="flex items-center bg-surface-800 rounded-lg px-2 h-9 w-14 shrink-0">
        <input
          type="number"
          inputMode="numeric"
          value={input.reps}
          onChange={(e) => onChange({ reps: e.target.value })}
          placeholder={targetReps.split('-')[0]}
          disabled={done}
          className="w-full bg-transparent text-center text-sm text-zinc-100 focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* RIR pills */}
      <div className="flex gap-0.5 flex-1">
        {RIR_OPTIONS.map((r) => (
          <button
            key={r}
            type="button"
            disabled={done}
            onClick={() => onChange({ rir: r })}
            className={cn(
              'flex-1 h-7 rounded text-[10px] font-bold transition-colors disabled:pointer-events-none',
              input.rir === r
                ? 'bg-accent-500 text-white'
                : 'bg-surface-800 text-zinc-500 hover:bg-surface-700',
            )}
          >
            {r === 4 ? '4+' : r}
          </button>
        ))}
      </div>

      {/* Check */}
      <button
        type="button"
        onClick={onComplete}
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors',
          done
            ? 'bg-green-600/30 text-green-400'
            : 'bg-surface-800 text-zinc-500 hover:bg-accent-500/20 hover:text-accent-400',
        )}
      >
        <Check size={16} strokeWidth={2.5} />
      </button>
    </div>
  )
}
