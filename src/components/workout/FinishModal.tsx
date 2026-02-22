import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { cn } from '../../utils/cn'
import type { MoodRating } from '../../types'

interface FinishModalProps {
  open:       boolean
  onClose:    () => void
  onSave:     (data: FinishData) => Promise<void>
  durationSec: number
}

export interface FinishData {
  painScore:         number
  perceivedExertion: number
  mood:              MoodRating
  notes:             string
}

const MOODS: { id: MoodRating; emoji: string; label: string }[] = [
  { id: 'great',   emoji: '💪', label: 'Great'   },
  { id: 'good',    emoji: '😊', label: 'Good'    },
  { id: 'neutral', emoji: '😐', label: 'Meh'     },
  { id: 'tired',   emoji: '😴', label: 'Tired'   },
  { id: 'bad',     emoji: '😣', label: 'Bad'     },
]

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export function FinishModal({ open, onClose, onSave, durationSec }: FinishModalProps) {
  const [painScore, setPainScore]   = useState(0)
  const [rpe, setRpe]               = useState(7)
  const [mood, setMood]             = useState<MoodRating>('good')
  const [notes, setNotes]           = useState('')
  const [saving, setSaving]         = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ painScore, perceivedExertion: rpe, mood, notes })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Finish Workout"
      description={`Session time: ${formatDuration(durationSec)}`}
    >
      <div className="space-y-5">
        {/* Overall pain */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Overall Pain
            </p>
            <span
              className={cn(
                'text-sm font-bold',
                painScore <= 3 ? 'text-green-400' : painScore <= 6 ? 'text-amber-400' : 'text-red-400',
              )}
            >
              {painScore}/10
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={painScore}
            onChange={(e) => setPainScore(Number(e.target.value))}
            className="w-full accent-accent-500"
          />
          {painScore > 3 && (
            <p className="text-xs text-amber-400">
              Pain &gt; 3/10 — consider using replacement exercises next session.
            </p>
          )}
        </div>

        {/* RPE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              Effort (RPE)
            </p>
            <span className="text-sm font-bold text-accent-400">{rpe}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={rpe}
            onChange={(e) => setRpe(Number(e.target.value))}
            className="w-full accent-accent-500"
          />
          <p className="text-[10px] text-zinc-600">
            {rpe <= 5 ? 'Very easy' : rpe <= 7 ? 'Moderate' : rpe <= 9 ? 'Hard' : 'Max effort'}
          </p>
        </div>

        {/* Mood */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Mood</p>
          <div className="flex gap-2">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMood(m.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border text-center transition-colors',
                  mood === m.id
                    ? 'bg-accent-500/15 border-accent-500/50'
                    : 'bg-surface-800 border-surface-700',
                )}
              >
                <span className="text-lg">{m.emoji}</span>
                <span className="text-[9px] text-zinc-500">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Notes</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="PRs, technique notes, how you felt..."
            rows={2}
            className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-accent-500 placeholder:text-zinc-600 resize-none"
          />
        </div>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          loading={saving}
          onClick={handleSave}
        >
          Save Workout
        </Button>
      </div>
    </Modal>
  )
}
