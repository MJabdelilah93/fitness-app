import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, ChevronRight, Dumbbell, Footprints, Scale } from 'lucide-react'
import { db } from '../db/db'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { cn } from '../utils/cn'
import { todayISO } from '../utils/dateUtils'
import type { TrainingMode, WeightUnit } from '../types'

// Ramadan 2026: Feb 18 → Mar 20
const RAMADAN_END_2026 = '2026-03-20'

/** Returns 'ramadan' if today is on or before the end date, otherwise 'normal'. */
function detectDefaultMode(): TrainingMode {
  return todayISO() <= RAMADAN_END_2026 ? 'ramadan' : 'normal'
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            i === current ? 'w-6 bg-accent-500' : 'w-1.5 bg-surface-700',
          )}
        />
      ))}
    </div>
  )
}

// ─── Mode card ────────────────────────────────────────────────────────────────

interface ModeCardProps {
  selected:    boolean
  icon:        React.ReactNode
  title:       string
  bullets:     string[]
  accent:      string
  onClick:     () => void
}

function ModeCard({ selected, icon, title, bullets, accent, onClick }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col gap-3 p-4 rounded-2xl border text-left transition-all',
        selected
          ? `${accent} border-2`
          : 'bg-surface-900 border-surface-700',
      )}
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className={cn('font-bold text-base', selected ? 'text-zinc-100' : 'text-zinc-400')}>
          {title}
        </span>
      </div>
      <ul className="space-y-1">
        {bullets.map((b) => (
          <li key={b} className="text-xs text-zinc-500 flex gap-1.5">
            <span className="shrink-0">·</span>
            {b}
          </li>
        ))}
      </ul>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const TOTAL_STEPS = 3

export function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep]         = useState(0)
  const [mode, setMode]         = useState<TrainingMode>(detectDefaultMode)
  const [name, setName]         = useState('')
  const [ramadanEnd, setRamadanEnd] = useState(RAMADAN_END_2026)
  const [stepGoal, setStepGoal] = useState('10000')
  const [unit, setUnit]         = useState<WeightUnit>('kg')
  const [saving, setSaving]     = useState(false)

  const handleFinish = async () => {
    setSaving(true)
    const now = new Date().toISOString()
    await db.settings.add({
      displayName:          name.trim(),
      mode,
      ramadanEndDate:       ramadanEnd,
      stepGoalPerDay:       Math.max(1000, parseInt(stepGoal, 10) || 10_000),
      weightUnit:           unit,
      waistUnit:            'cm',
      notificationsEnabled: false,
      onboardingComplete:   true,
      createdAt:            now,
      updatedAt:            now,
    })
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-dvh bg-surface-950 flex flex-col px-5 pt-safe-top pb-8">
      {/* ── Logo ── */}
      <div className="flex items-center gap-2 py-6">
        <Dumbbell size={22} className="text-accent-500" />
        <span className="font-extrabold text-lg tracking-tight">FitTrack</span>
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 flex flex-col gap-6 animate-fade-in">

        {/* STEP 0 — Mode selection */}
        {step === 0 && (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-100 leading-tight">
                Choose your training mode
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                You can change this any time in Settings.
              </p>
            </div>

            <div className="flex gap-3">
              <ModeCard
                selected={mode === 'normal'}
                accent="bg-accent-500/10 border-accent-500/60"
                icon={<Sun size={18} className={mode === 'normal' ? 'text-accent-400' : 'text-zinc-600'} />}
                title="Normal"
                bullets={[
                  'Push / Pull / Legs — 3× / week',
                  'Steps on off days',
                  '~55 min sessions',
                  'Progressive overload focus',
                ]}
                onClick={() => setMode('normal')}
              />
              <ModeCard
                selected={mode === 'ramadan'}
                accent="bg-amber-500/10 border-amber-500/60"
                icon={<Moon size={18} className={mode === 'ramadan' ? 'text-amber-400' : 'text-zinc-600'} />}
                title="Ramadan"
                bullets={[
                  'Upper / Lower — 3× / week',
                  'Shorter ~40 min sessions',
                  'Conservative RIR (+1)',
                  'Maintenance focus',
                ]}
                onClick={() => setMode('ramadan')}
              />
            </div>
          </>
        )}

        {/* STEP 1 — Personalisation */}
        {step === 1 && (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-100 leading-tight">
                Personalise
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                All optional — you can edit these later.
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Your name (optional)"
                placeholder="e.g. Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
              />

              <Input
                label="Daily step goal"
                type="number"
                inputMode="numeric"
                suffix="steps"
                prefix={<Footprints size={16} className="text-green-400" />}
                value={stepGoal}
                onChange={(e) => setStepGoal(e.target.value)}
                hint="Recommended: 8,000 – 12,000"
              />

              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                  Weight unit
                </p>
                <div className="flex gap-3">
                  {(['kg', 'lbs'] as WeightUnit[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={cn(
                        'flex-1 h-11 flex items-center justify-center gap-2 rounded-xl border font-semibold text-sm transition-colors',
                        unit === u
                          ? 'bg-accent-500/15 border-accent-500/50 text-accent-400'
                          : 'bg-surface-900 border-surface-700 text-zinc-400',
                      )}
                    >
                      <Scale size={15} />
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 2 — Ramadan date (shown for both, but highlighted if Ramadan mode) */}
        {step === 2 && (
          <>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-100 leading-tight">
                {mode === 'ramadan' ? 'Ramadan End Date' : 'Almost done!'}
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                {mode === 'ramadan'
                  ? 'Set the expected last day of Ramadan. Typically 19 or 20 March — check your local announcement.'
                  : 'Set Ramadan end date in case you switch modes later.'}
              </p>
            </div>

            <div className="space-y-4">
              <Input
                label="Ramadan end date"
                type="date"
                prefix={<Moon size={16} className="text-amber-400" />}
                value={ramadanEnd}
                onChange={(e) => setRamadanEnd(e.target.value)}
              />

              {/* Safety reminder */}
              <div className="bg-surface-900 border border-surface-700 rounded-2xl p-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  <span className="text-accent-400 font-semibold">Safety rule: </span>
                  Pain &gt; 3/10 on any exercise? Switch to the listed replacement shown on
                  the exercise card. Pain &gt; 6/10? Skip the movement entirely.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <div className="pt-6 space-y-4">
        <StepDots current={step} total={TOTAL_STEPS} />

        <div className="flex gap-3">
          {step > 0 && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2)}
              className="w-20 shrink-0"
            >
              Back
            </Button>
          )}

          {step < TOTAL_STEPS - 1 ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<ChevronRight size={18} />}
              onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2)}
            >
              {step === 0 ? `Start with ${mode === 'normal' ? 'Normal' : 'Ramadan'} mode` : 'Next'}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={saving}
              onClick={handleFinish}
            >
              Let's go!
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
