import { RefreshCw } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { getExerciseById } from '../../data/exercises'
import type { ExerciseSuggestion } from '../../types'

interface ReplacementModalProps {
  open:        boolean
  onClose:     () => void
  exerciseName: string
  replacements: ExerciseSuggestion[]
  safetyNote?: string
  onSelect:    (exerciseId: string) => void
}

export function ReplacementModal({
  open,
  onClose,
  exerciseName,
  replacements,
  safetyNote,
  onSelect,
}: ReplacementModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Replace Exercise"
      description={`Swap out ${exerciseName} for a pain-safe alternative.`}
    >
      {safetyNote && (
        <div className="bg-accent-500/10 border border-accent-500/20 rounded-xl p-3 mb-4">
          <p className="text-xs text-accent-300 leading-relaxed">{safetyNote}</p>
        </div>
      )}

      {replacements.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4">
          No pre-set replacements. Ask a coach or pick a similar exercise.
        </p>
      ) : (
        <div className="space-y-2">
          {replacements.map((r) => {
            const ex = getExerciseById(r.exerciseId)
            if (!ex) return null
            return (
              <button
                key={r.exerciseId}
                type="button"
                onClick={() => { onSelect(r.exerciseId); onClose() }}
                className="w-full text-left flex items-start gap-3 p-3 rounded-xl bg-surface-800 hover:bg-surface-700 border border-surface-700 transition-colors"
              >
                <RefreshCw size={16} className="text-accent-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{ex.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{r.reason}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-4">
        <Button variant="ghost" fullWidth onClick={onClose}>
          Keep original exercise
        </Button>
      </div>
    </Modal>
  )
}
