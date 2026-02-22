import { useState } from 'react'
import {
  ChevronDown, ChevronUp, ExternalLink,
  RefreshCw, AlertTriangle, Plus,
} from 'lucide-react'
import { SetRow, type SetInput } from './SetRow'
import { ReplacementModal } from './ReplacementModal'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'
import type { Exercise, ProgramExercise, WeightUnit } from '../../types'

export interface ExerciseState {
  exerciseId:           string
  exercise:             Exercise
  programExercise:      ProgramExercise
  isReplacement:        boolean
  originalExerciseId?:  string
  sets:                 SetInput[]
  isExpanded:           boolean
}

interface ExerciseCardProps {
  exState:     ExerciseState
  weightUnit:  WeightUnit
  onUpdate:    (next: ExerciseState) => void
  onSetComplete: (setIdx: number, restSeconds: number) => void
}

export function ExerciseCard({
  exState,
  weightUnit,
  onUpdate,
  onSetComplete,
}: ExerciseCardProps) {
  const [showReplacement, setShowReplacement] = useState(false)

  const { exercise: ex, programExercise: pe, sets, isExpanded } = exState
  const scheme = pe.setScheme
  const targetReps = `${scheme.repsMin}-${scheme.repsMax}`
  const completedCount = sets.filter((s) => s.completed).length

  const update = (patch: Partial<ExerciseState>) =>
    onUpdate({ ...exState, ...patch })

  const updateSet = (idx: number, patch: Partial<SetInput>) => {
    const next = [...sets]
    next[idx] = { ...next[idx], ...patch }
    update({ sets: next })
  }

  const handleSetComplete = (idx: number) => {
    const next = [...sets]
    next[idx] = { ...next[idx], completed: true }
    update({ sets: next })
    onSetComplete(idx, scheme.restSeconds)
  }

  const addSet = () => {
    const last = sets[sets.length - 1]
    update({
      sets: [
        ...sets,
        { weight: last?.weight ?? '', reps: String(scheme.repsMin), rir: scheme.rirTarget, completed: false },
      ],
    })
  }

  const handleReplacement = (newId: string) => {
    // Swap exercise in this slot — keep the same set scheme
    import('../../data/exercises').then(({ exerciseOrStub }) => {
      update({
        exerciseId:          newId,
        exercise:            exerciseOrStub(newId),
        isReplacement:       true,
        originalExerciseId:  exState.isReplacement
          ? exState.originalExerciseId
          : exState.exerciseId,
      })
    })
  }

  return (
    <div className="bg-surface-900 border border-surface-700 rounded-2xl overflow-hidden">
      {/* ── Card header ──────────────────────────────────── */}
      <button
        type="button"
        onClick={() => update({ isExpanded: !isExpanded })}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        {/* Progress indicator */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5',
            completedCount === sets.length && sets.length > 0
              ? 'bg-green-600/20 text-green-400'
              : 'bg-accent-500/15 text-accent-400',
          )}
        >
          {completedCount}/{sets.length}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-zinc-100 text-sm leading-snug">{ex.name}</span>
            {exState.isReplacement && (
              <Badge color="amber" dot>Swap</Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            {scheme.sets} × {targetReps} reps · RIR {scheme.rirTarget} · {scheme.restSeconds}s rest
          </p>
          {ex.muscles.primary.length > 0 && (
            <p className="text-[10px] text-zinc-600 mt-0.5">
              {ex.muscles.primary.join(', ')}
            </p>
          )}
        </div>

        {isExpanded ? (
          <ChevronUp size={16} className="text-zinc-500 shrink-0 mt-1" />
        ) : (
          <ChevronDown size={16} className="text-zinc-500 shrink-0 mt-1" />
        )}
      </button>

      {/* ── Expanded detail ───────────────────────────────── */}
      {isExpanded && (
        <div className="border-t border-surface-800 px-4 py-3 space-y-4">
          {/* How-to link */}
          {ex.videoUrl && (
            <a
              href={ex.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-accent-400 hover:text-accent-300 transition-colors"
            >
              <ExternalLink size={13} />
              Watch how-to tutorial
            </a>
          )}

          {/* Warm-up cues */}
          {ex.warmupCues.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Warm-up
              </p>
              <ul className="space-y-0.5">
                {ex.warmupCues.map((c) => (
                  <li key={c} className="text-xs text-zinc-400 flex gap-2">
                    <span className="text-accent-500 shrink-0">·</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form cues */}
          {ex.formCues.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-1">
                Form cues
              </p>
              <ul className="space-y-0.5">
                {ex.formCues.map((c) => (
                  <li key={c} className="text-xs text-zinc-400 flex gap-2">
                    <span className="text-green-500 shrink-0">·</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Coach note from program */}
          {pe.notes && (
            <div className="bg-surface-800 rounded-lg px-3 py-2">
              <p className="text-xs text-zinc-400 italic">💡 {pe.notes}</p>
            </div>
          )}

          {/* Safety note */}
          {ex.safetyNote && (
            <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300 leading-relaxed">{ex.safetyNote}</p>
            </div>
          )}

          {/* Replacement button */}
          {ex.replacements.length > 0 && (
            <button
              type="button"
              onClick={() => setShowReplacement(true)}
              className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 bg-surface-800 hover:bg-surface-700 transition-colors rounded-xl px-3 py-2 w-full"
            >
              <RefreshCw size={13} className="shrink-0" />
              Pain &gt; 3/10? Swap exercise
            </button>
          )}
        </div>
      )}

      {/* ── Set rows ──────────────────────────────────────── */}
      <div className={cn('px-4', isExpanded ? 'border-t border-surface-800 pt-3' : 'pt-0')}>
        {sets.map((s, idx) => (
          <SetRow
            key={idx}
            setNumber={idx + 1}
            input={s}
            targetReps={targetReps}
            weightUnit={weightUnit}
            onChange={(patch) => updateSet(idx, patch)}
            onComplete={() => handleSetComplete(idx)}
          />
        ))}

        {/* Add set */}
        <button
          type="button"
          onClick={addSet}
          className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-400 py-2 transition-colors"
        >
          <Plus size={13} />
          Add set
        </button>
      </div>

      {/* Replacement modal */}
      <ReplacementModal
        open={showReplacement}
        onClose={() => setShowReplacement(false)}
        exerciseName={ex.name}
        replacements={ex.replacements}
        safetyNote={ex.safetyNote}
        onSelect={handleReplacement}
      />
    </div>
  )
}
