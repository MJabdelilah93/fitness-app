import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dumbbell, Play, CheckCircle, Clock, Footprints,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

import { useSettings }    from '../hooks/useSettings'
import { useTodayPlan }   from '../hooks/useTodayPlan'
import { db }             from '../db/db'
import { exerciseOrStub } from '../data/exercises'
import { todayISO, toISODate, formatDayFull, formatDuration } from '../utils/dateUtils'
import { fromKg }         from '../utils/units'

import { ExerciseCard, type ExerciseState } from '../components/workout/ExerciseCard'
import { RestTimer }      from '../components/workout/RestTimer'
import { FinishModal, type FinishData } from '../components/workout/FinishModal'
import { Button }         from '../components/ui/Button'
import { Badge }          from '../components/ui/Badge'
import { PageSpinner }    from '../components/ui/Spinner'
import { EmptyState }     from '../components/ui/EmptyState'
import type { SetInput }  from '../components/workout/SetRow'
import type { WorkoutSession, SessionTemplate } from '../types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildInitialExerciseStates(
  session: SessionTemplate,
  weightUnit: 'kg' | 'lbs',
): ExerciseState[] {
  return session.exercises.map((pe) => {
    const ex = exerciseOrStub(pe.exerciseId)
    const defaultWeight = weightUnit === 'lbs' ? '135' : '60'
    return {
      exerciseId:      pe.exerciseId,
      exercise:        ex,
      programExercise: pe,
      isReplacement:   false,
      isExpanded:      false,
      sets: Array.from({ length: pe.setScheme.sets }, () => ({
        weight:    defaultWeight,
        reps:      String(pe.setScheme.repsMin),
        rir:       pe.setScheme.rirTarget,
        completed: false,
      } satisfies SetInput)),
    }
  })
}

// ─── Date navigation bar ──────────────────────────────────────────────────────

function DateNav({
  offset,
  onChange,
}: {
  offset: number
  onChange: (n: number) => void
}) {
  const label = useMemo(() => {
    if (offset === 0) return 'Today'
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return formatDayFull(toISODate(d))
  }, [offset])

  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={() => onChange(offset - 1)}
        className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-surface-800 transition-colors"
        aria-label="Previous day"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${offset === 0 ? 'text-accent-400' : 'text-zinc-200'}`}>
          {label}
        </span>
        {offset !== 0 && (
          <button
            type="button"
            onClick={() => onChange(0)}
            className="text-xs px-2 py-0.5 rounded-full bg-accent-500/15 text-accent-400 hover:bg-accent-500/25 transition-colors"
          >
            Today
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onChange(offset + 1)}
        disabled={offset >= 6}
        className="p-2 -mr-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-surface-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next day"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

type Phase = 'preview' | 'active' | 'done'

interface RestState { seconds: number; total: number }

export function WorkoutPage() {
  const { settings, isLoading } = useSettings()
  const navigate    = useNavigate()
  const today       = todayISO()

  // Date navigation
  const [dateOffset, setDateOffset] = useState(0)
  const selectedDate = useMemo(() => {
    if (dateOffset === 0) return today
    const d = new Date()
    d.setDate(d.getDate() + dateOffset)
    return toISODate(d)
  }, [dateOffset, today])

  const isViewingToday = selectedDate === today

  const plan = useTodayPlan(settings, selectedDate)

  // Check for an existing session on the selected day.
  // Wrapped in an object so useLiveQuery's `undefined` (loading) stays
  // distinguishable from a resolved-but-empty result { session: undefined }.
  const existingSessionResult = useLiveQuery(
    (): Promise<{ session: WorkoutSession | undefined }> =>
      plan
        ? db.workoutSessions
            .where('date')
            .equals(selectedDate)
            .filter((s) => s.sessionTemplateId === plan.session.id)
            .first()
            .then((session) => ({ session }))
        : Promise.resolve({ session: undefined }),
    [selectedDate, plan?.session.id],
  )

  const [phase,            setPhase]            = useState<Phase>('preview')
  const [workoutSessionId, setWorkoutSessionId] = useState<number | null>(null)
  const [startedAt,        setStartedAt]        = useState(0)
  const [elapsed,          setElapsed]          = useState(0)
  const [exerciseStates,   setExerciseStates]   = useState<ExerciseState[]>([])
  const [rest,             setRest]             = useState<RestState | null>(null)
  const [showFinish,       setShowFinish]        = useState(false)

  // Initialise exercise states when plan loads
  useEffect(() => {
    if (!plan?.isGymDay || exerciseStates.length > 0) return
    setExerciseStates(buildInitialExerciseStates(plan.session, settings?.weightUnit ?? 'kg'))
  }, [plan, settings?.weightUnit]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset exercise states when browsing a different day
  useEffect(() => {
    setExerciseStates([])
  }, [selectedDate])

  // Elapsed time ticker
  useEffect(() => {
    if (phase !== 'active') return
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(id)
  }, [phase, startedAt])

  // Rest timer countdown
  useEffect(() => {
    if (!rest || rest.seconds <= 0) return
    const id = setInterval(() => {
      setRest((prev) => prev && prev.seconds > 0 ? { ...prev, seconds: prev.seconds - 1 } : null)
    }, 1000)
    return () => clearInterval(id)
  }, [rest])

  const handleStart = useCallback(async () => {
    if (!plan) return
    const id = await db.workoutSessions.add({
      date:              today,
      programId:         plan.programId,
      sessionTemplateId: plan.session.id,
      sessionName:       plan.session.name,
      status:            'in-progress',
      startedAt:         Date.now(),
      overallPainScore:  0,
      perceivedExertion: 7,
      mood:              'good',
    })
    setWorkoutSessionId(id)
    setStartedAt(Date.now())
    setPhase('active')
  }, [plan, today])

  const handleSetComplete = useCallback((exIdx: number, restSeconds: number) => {
    setRest({ seconds: restSeconds, total: restSeconds })
    setExerciseStates((prev) => {
      const next = [...prev]
      const allDone = next[exIdx].sets.every((s) => s.completed)
      if (allDone && exIdx + 1 < next.length) {
        next[exIdx + 1] = { ...next[exIdx + 1], isExpanded: true }
      }
      return next
    })
  }, [])

  const handleSaveWorkout = useCallback(
    async (data: FinishData) => {
      if (!workoutSessionId) return
      const now     = Date.now()
      const durSec  = Math.floor((now - startedAt) / 1000)
      const wUnit   = settings?.weightUnit ?? 'kg'

      await db.workoutSessions.update(workoutSessionId, {
        status:            'completed',
        completedAt:       now,
        durationSeconds:   durSec,
        overallPainScore:  data.painScore,
        perceivedExertion: data.perceivedExertion,
        mood:              data.mood,
        notes:             data.notes,
      })

      for (const es of exerciseStates) {
        const completedSets = es.sets
          .map((s, i) => ({ s, i }))
          .filter(({ s }) => s.completed)
        if (completedSets.length === 0) continue

        await db.exerciseLogs.add({
          workoutSessionId,
          exerciseId:         es.exerciseId,
          exerciseName:       es.exercise.name,
          isReplacement:      es.isReplacement,
          originalExerciseId: es.originalExerciseId,
          sets: completedSets.map(({ s, i }) => ({
            setNumber:   i + 1,
            targetReps:  es.programExercise.setScheme.repsMin,
            actualReps:  parseInt(s.reps, 10)  || 0,
            weightKg:    fromKg(parseFloat(s.weight) || 0, wUnit),
            rir:         s.rir,
            completed:   true,
            timestamp:   now,
          })),
        })
      }

      setShowFinish(false)
      setPhase('done')
    },
    [workoutSessionId, startedAt, exerciseStates, settings?.weightUnit],
  )

  // ── Loading ──────────────────────────────────────────────────────

  if (isLoading || existingSessionResult === undefined) return <PageSpinner />
  const existingSession = existingSessionResult.session

  // ── Browse mode (any day other than today) ───────────────────────

  if (!isViewingToday) {
    const isPast = selectedDate < today
    return (
      <div className="px-4 pt-4 space-y-4 animate-fade-in">
        <DateNav offset={dateOffset} onChange={setDateOffset} />

        {!plan || !plan.isGymDay ? (
          <EmptyState
            icon={<Footprints size={40} className="text-green-400" />}
            title="Steps day"
            description={plan?.session.name ?? 'Rest or steps day'}
          />
        ) : (
          <>
            {/* Session header */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0">
                <Dumbbell size={22} className="text-accent-400" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold text-zinc-100 leading-tight">
                  {plan.session.name}
                </h1>
                <p className="text-sm text-zinc-500">{plan.session.description}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  <Badge color="orange">{plan.session.exercises.length} exercises</Badge>
                  <Badge color="zinc">~{plan.session.estimatedMinutes} min</Badge>
                  {isPast
                    ? existingSession?.status === 'completed'
                      ? <Badge color="green">Completed ✓</Badge>
                      : <Badge color="zinc">Not logged</Badge>
                    : <Badge color="blue">Upcoming</Badge>
                  }
                </div>
              </div>
            </div>

            {/* Warm-up */}
            {plan.session.warmupProtocol && (
              <div className="bg-surface-900 border border-surface-700 rounded-2xl p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                  Warm-up Protocol
                </p>
                <p className="text-sm text-zinc-300">{plan.session.warmupProtocol}</p>
              </div>
            )}

            {/* Exercise list */}
            <div className="bg-surface-900 border border-surface-700 rounded-2xl divide-y divide-surface-800">
              {plan.session.exercises.map((pe, i) => {
                const ex = exerciseOrStub(pe.exerciseId)
                return (
                  <div key={pe.exerciseId} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-xs text-zinc-600 w-4 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{ex.name}</p>
                      <p className="text-[11px] text-zinc-600">
                        {pe.setScheme.sets} × {pe.setScheme.repsMin}-{pe.setScheme.repsMax} · RIR {pe.setScheme.rirTarget}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Today: no gym day ────────────────────────────────────────────

  if (!plan || !plan.isGymDay) {
    return (
      <div className="px-4 pt-4 space-y-4">
        <DateNav offset={dateOffset} onChange={setDateOffset} />
        <EmptyState
          icon={<Footprints size={40} className="text-green-400" />}
          title="Steps day today"
          description={`Today is ${plan?.session.name ?? 'a rest or steps day'}. Log your steps in the Metrics tab.`}
          action={
            <Button variant="secondary" onClick={() => navigate('/metrics')}>
              Go to Metrics
            </Button>
          }
        />
      </div>
    )
  }

  // ── Today: already completed ─────────────────────────────────────

  if (existingSession?.status === 'completed' && phase === 'preview') {
    return (
      <div className="px-4 pt-4 space-y-4">
        <DateNav offset={dateOffset} onChange={setDateOffset} />
        <EmptyState
          icon={<CheckCircle size={40} className="text-green-400" />}
          title="Workout done today!"
          description={`${plan.session.name} completed. Rest up and come back tomorrow.`}
          action={
            <Button variant="secondary" onClick={() => navigate('/')}>
              Back to Today
            </Button>
          }
        />
      </div>
    )
  }

  // ── Today: just finished ─────────────────────────────────────────

  if (phase === 'done') {
    return (
      <div className="px-4 pt-6">
        <EmptyState
          icon={<CheckCircle size={40} className="text-green-400" />}
          title="Workout saved!"
          description={`Great work! ${plan.session.name} logged in ${formatDuration(elapsed)}.`}
          action={
            <Button variant="primary" onClick={() => navigate('/')}>
              Back to Today
            </Button>
          }
        />
      </div>
    )
  }

  // ── Today: preview (start screen) ───────────────────────────────

  if (phase === 'preview') {
    return (
      <div className="px-4 pt-4 space-y-4 animate-fade-in">
        <DateNav offset={dateOffset} onChange={setDateOffset} />

        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-accent-500/15 flex items-center justify-center shrink-0">
            <Dumbbell size={22} className="text-accent-400" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-zinc-100 leading-tight">
              {plan.session.name}
            </h1>
            <p className="text-sm text-zinc-500">{plan.session.description}</p>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge color="orange">{plan.session.exercises.length} exercises</Badge>
              <Badge color="zinc">~{plan.session.estimatedMinutes} min</Badge>
            </div>
          </div>
        </div>

        {/* Warm-up */}
        {plan.session.warmupProtocol && (
          <div className="bg-surface-900 border border-surface-700 rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
              Warm-up Protocol
            </p>
            <p className="text-sm text-zinc-300">{plan.session.warmupProtocol}</p>
          </div>
        )}

        {/* Exercise list preview */}
        <div className="bg-surface-900 border border-surface-700 rounded-2xl divide-y divide-surface-800">
          {plan.session.exercises.map((pe, i) => {
            const ex = exerciseOrStub(pe.exerciseId)
            return (
              <div key={pe.exerciseId} className="flex items-center gap-3 px-4 py-3">
                <span className="text-xs text-zinc-600 w-4 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{ex.name}</p>
                  <p className="text-[11px] text-zinc-600">
                    {pe.setScheme.sets} × {pe.setScheme.repsMin}-{pe.setScheme.repsMax} · RIR {pe.setScheme.rirTarget}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <Button
          variant="primary"
          fullWidth
          size="lg"
          icon={<Play size={18} />}
          onClick={handleStart}
        >
          Start Workout
        </Button>
      </div>
    )
  }

  // ── Today: active workout ────────────────────────────────────────

  const totalSets     = exerciseStates.reduce((a, e) => a + e.sets.length, 0)
  const completedSets = exerciseStates.reduce((a, e) => a + e.sets.filter((s) => s.completed).length, 0)
  const progress      = totalSets > 0 ? completedSets / totalSets : 0

  return (
    <div className="px-4 pt-4 pb-4 space-y-3 animate-fade-in">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-extrabold text-zinc-100 text-base leading-tight">
            {plan.session.name}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Clock size={12} className="text-zinc-600" />
            <span className="text-xs text-zinc-500">{formatDuration(elapsed)}</span>
            <span className="text-xs text-zinc-600">·</span>
            <span className="text-xs text-zinc-500">{completedSets}/{totalSets} sets</span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFinish(true)}
        >
          Finish
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-surface-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-500 rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Exercise cards */}
      <div className="space-y-3">
        {exerciseStates.map((es, idx) => (
          <ExerciseCard
            key={`${es.exerciseId}-${idx}`}
            exState={es}
            weightUnit={settings?.weightUnit ?? 'kg'}
            onUpdate={(next) =>
              setExerciseStates((prev) => {
                const arr = [...prev]
                arr[idx] = next
                return arr
              })
            }
            onSetComplete={(setIdx, restSec) => {
              handleSetComplete(idx, restSec)
              setExerciseStates((prev) => {
                const arr = [...prev]
                const sets = [...arr[idx].sets]
                sets[setIdx] = { ...sets[setIdx], completed: true }
                arr[idx] = { ...arr[idx], sets }
                return arr
              })
            }}
          />
        ))}
      </div>

      {/* Finish button at bottom */}
      <Button
        variant="primary"
        fullWidth
        size="lg"
        onClick={() => setShowFinish(true)}
      >
        Finish Workout
      </Button>

      {/* Rest timer overlay */}
      {rest && rest.seconds > 0 && (
        <RestTimer
          seconds={rest.seconds}
          totalSeconds={rest.total}
          onSkip={() => setRest(null)}
        />
      )}

      {/* Finish modal */}
      <FinishModal
        open={showFinish}
        onClose={() => setShowFinish(false)}
        onSave={handleSaveWorkout}
        durationSec={elapsed}
      />
    </div>
  )
}
