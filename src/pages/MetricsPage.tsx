import { useState, useEffect } from 'react'
import { Footprints, Scale, Flame, Dumbbell, Check, Ruler, ChevronDown, ChevronUp, UtensilsCrossed, CalendarDays } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

import { useSettings } from '../hooks/useSettings'
import { db, upsertStepsLog, upsertBodyLog, upsertMealLog } from '../db/db'
import { todayISO, lastNDays, formatDateShort } from '../utils/dateUtils'
import { toKg, fromKg } from '../utils/units'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import { cn } from '../utils/cn'
import { getDayMeals, getWeekMeals } from '../data/programData'
import type { UserSettings, StepsLog, BodyLog, MealLog } from '../types'

// ─── Tab types ────────────────────────────────────────────────────────────────

type Tab = 'steps' | 'body' | 'nutrition'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'steps',     label: 'Steps',     icon: <Footprints size={14} /> },
  { id: 'body',      label: 'Body',      icon: <Scale      size={14} /> },
  { id: 'nutrition', label: 'Nutrition', icon: <Flame      size={14} /> },
]

// ─── Root page ────────────────────────────────────────────────────────────────

export function MetricsPage() {
  const { settings, isLoading } = useSettings()
  const [activeTab, setActiveTab] = useState<Tab>('steps')

  if (isLoading) return <PageSpinner />
  if (!settings)  return null

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ── Tab bar ── */}
      <div className="flex shrink-0 border-b border-surface-700 px-2">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold',
              'transition-colors border-b-2 -mb-px',
              activeTab === id
                ? 'text-accent-400 border-accent-500'
                : 'text-zinc-500 border-transparent',
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-4 pb-24 space-y-4">
          {activeTab === 'steps'     && <StepsTab     settings={settings} />}
          {activeTab === 'body'      && <BodyTab      settings={settings} />}
          {activeTab === 'nutrition' && <NutritionTab settings={settings} />}
        </div>
      </div>
    </div>
  )
}

// ─── Shared history wrapper ───────────────────────────────────────────────────

function HistorySection({
  label,
  children,
  empty,
}: {
  label:    string
  children: React.ReactNode
  empty:    boolean
}) {
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
        {label}
      </p>
      {empty ? (
        <p className="text-center text-zinc-600 text-sm py-6">No entries yet</p>
      ) : (
        <Card padding="none" className="divide-y divide-surface-800">
          {children}
        </Card>
      )}
    </section>
  )
}

// ─── Steps Tab ────────────────────────────────────────────────────────────────

function StepsTab({ settings }: { settings: UserSettings }) {
  const today    = todayISO()
  const goalSteps = settings.stepGoalPerDay

  const [stepsInput, setStepsInput] = useState('')
  const [saved,      setSaved]      = useState(false)

  // Today's existing log
  const todayLog = useLiveQuery(
    () => db.stepsLogs.where('date').equals(today).first(),
    [today],
  )

  // 14-day history
  const history = useLiveQuery(async () => {
    const days = lastNDays(14)
    const logs = await db.stepsLogs.where('date').anyOf(days).toArray()
    return logs.sort((a, b) => b.date.localeCompare(a.date))
  }, [])

  // Pre-populate from existing entry (only on first load)
  useEffect(() => {
    if (todayLog && stepsInput === '') setStepsInput(String(todayLog.steps))
  }, [todayLog]) // eslint-disable-line react-hooks/exhaustive-deps

  const stepsNum = parseInt(stepsInput, 10) || 0
  const progress = Math.min(stepsNum / goalSteps, 1)

  const handleSave = async () => {
    const n = parseInt(stepsInput, 10)
    if (isNaN(n) || n < 0) return
    await upsertStepsLog(today, n, goalSteps)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <Card>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Today's Steps
          </p>

          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={stepsInput}
            onChange={(e) => setStepsInput(e.target.value)}
            suffix="steps"
            prefix={<Footprints size={16} className="text-green-400" />}
          />

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{stepsNum.toLocaleString()}</span>
              <span>Goal: {goalSteps.toLocaleString()}</span>
            </div>
            <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className={cn('text-xs', progress >= 1 ? 'text-green-400' : 'text-zinc-600')}>
              {progress >= 1
                ? '✓ Goal reached!'
                : `${(goalSteps - stepsNum).toLocaleString()} to go`}
            </p>
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            icon={saved ? <Check size={16} /> : undefined}
          >
            {saved ? 'Saved!' : 'Log Steps'}
          </Button>
        </div>
      </Card>

      <HistorySection
        label="Last 14 Days"
        empty={history !== undefined && history.length === 0}
      >
        {(history ?? []).map((log) => (
          <StepsRow key={log.id ?? log.date} log={log} isToday={log.date === today} />
        ))}
      </HistorySection>
    </>
  )
}

function StepsRow({ log, isToday }: { log: StepsLog; isToday: boolean }) {
  const pct = Math.round((log.steps / log.goalSteps) * 100)
  return (
    <div className="flex items-center justify-between py-3 px-4">
      <div>
        <p className={cn('text-sm font-medium', isToday ? 'text-accent-400' : 'text-zinc-200')}>
          {isToday ? 'Today' : formatDateShort(log.date)}
        </p>
        <p className="text-xs text-zinc-500">
          {log.steps.toLocaleString()} / {log.goalSteps.toLocaleString()} steps
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-semibold tabular-nums', log.goalMet ? 'text-green-400' : 'text-zinc-500')}>
          {pct}%
        </span>
        {log.goalMet && <Check size={14} className="text-green-400" />}
      </div>
    </div>
  )
}

// ─── Body Tab ─────────────────────────────────────────────────────────────────

function BodyTab({ settings }: { settings: UserSettings }) {
  const today = todayISO()
  const unit  = settings.weightUnit

  const [weight, setWeight] = useState('')
  const [waist,  setWaist]  = useState('')
  const [saved,  setSaved]  = useState(false)

  const todayLog = useLiveQuery(
    () => db.bodyLogs.where('date').equals(today).first(),
    [today],
  )

  const history = useLiveQuery(async () => {
    const days = lastNDays(14)
    const logs = await db.bodyLogs.where('date').anyOf(days).toArray()
    return logs.sort((a, b) => b.date.localeCompare(a.date))
  }, [])

  useEffect(() => {
    if (!todayLog) return
    if (weight === '' && todayLog.weightKg != null)
      setWeight(String(fromKg(todayLog.weightKg, unit)))
    if (waist === '' && todayLog.waistCm != null)
      setWaist(String(todayLog.waistCm))
  }, [todayLog]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    const wKg = weight !== '' ? toKg(parseFloat(weight), unit) : undefined
    const wCm = waist  !== '' ? parseFloat(waist)              : undefined
    if ((wKg == null || isNaN(wKg)) && (wCm == null || isNaN(wCm))) return
    await upsertBodyLog(today, {
      ...(wKg != null && !isNaN(wKg) ? { weightKg: wKg } : {}),
      ...(wCm != null && !isNaN(wCm) ? { waistCm:  wCm } : {}),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <Card>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Today's Measurements
          </p>

          <Input
            label={`Weight (${unit})`}
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            suffix={unit}
            prefix={<Scale size={16} className="text-blue-400" />}
          />

          <Input
            label="Waist circumference"
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            suffix="cm"
            prefix={<Ruler size={16} className="text-purple-400" />}
          />

          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            icon={saved ? <Check size={16} /> : undefined}
          >
            {saved ? 'Saved!' : 'Log Measurements'}
          </Button>
        </div>
      </Card>

      <HistorySection
        label="Last 14 Days"
        empty={history !== undefined && history.length === 0}
      >
        {(history ?? []).map((log) => (
          <BodyRow key={log.id ?? log.date} log={log} unit={unit} isToday={log.date === today} />
        ))}
      </HistorySection>
    </>
  )
}

function BodyRow({
  log, unit, isToday,
}: {
  log: BodyLog; unit: UserSettings['weightUnit']; isToday: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4">
      <p className={cn('text-sm font-medium', isToday ? 'text-accent-400' : 'text-zinc-200')}>
        {isToday ? 'Today' : formatDateShort(log.date)}
      </p>
      <div className="flex items-center gap-4 text-sm tabular-nums">
        {log.weightKg != null && (
          <span className="text-zinc-300">
            {fromKg(log.weightKg, unit)} {unit}
          </span>
        )}
        {log.waistCm != null && (
          <span className="text-zinc-500">{log.waistCm} cm</span>
        )}
        {log.weightKg == null && log.waistCm == null && (
          <span className="text-zinc-600 text-xs">—</span>
        )}
      </div>
    </div>
  )
}

// ─── Nutrition Tab ────────────────────────────────────────────────────────────

type NutriSubTab = 'today' | 'week'

function MealCard({
  meal,
  index,
  date,
  mode,
  existingLog,
}: {
  meal:        { meal: string; items: string; kcalMin?: number; kcalMax?: number }
  index:       number
  date:        string
  mode:        UserSettings['mode']
  existingLog: MealLog | undefined
}) {
  const [open,      setOpen]      = useState(false)
  const [notes,     setNotes]     = useState(existingLog?.notes ?? '')
  const completed = existingLog?.completed ?? false

  const handleCheck = async (checked: boolean) => {
    await upsertMealLog(date, mode, index, { completed: checked, notes })
  }

  const handleNotes = async (val: string) => {
    setNotes(val)
    await upsertMealLog(date, mode, index, { completed, notes: val })
  }

  return (
    <div className={cn(
      'rounded-xl border transition-colors',
      completed ? 'bg-green-500/5 border-green-500/20' : 'bg-surface-900 border-surface-700',
    )}>
      <div className="flex items-start gap-3 p-3">
        <input
          type="checkbox"
          checked={completed}
          onChange={e => handleCheck(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded accent-accent-500 shrink-0 cursor-pointer"
          aria-label={`Mark ${meal.meal} as done`}
        />
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-semibold', completed ? 'text-zinc-400' : 'text-zinc-100')}>
            {meal.meal}
            {meal.kcalMin != null && (
              <span className="ml-1.5 text-[11px] font-normal text-orange-400/70">
                ~{meal.kcalMin}–{meal.kcalMax} kcal
              </span>
            )}
          </p>
          <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{meal.items}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className="p-1 text-zinc-600 hover:text-zinc-300 transition-colors shrink-0"
        >
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-surface-700 px-3 py-3 space-y-2">
          <p className="text-xs text-zinc-400 leading-relaxed">{meal.items}</p>
          <input
            type="text"
            value={notes}
            onChange={e => handleNotes(e.target.value)}
            placeholder="Notes (substitutions, cravings…)"
            className="w-full bg-surface-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none border border-surface-600 focus:border-accent-500/50"
          />
        </div>
      )}
    </div>
  )
}

function NutritionTodayView({ settings }: { settings: UserSettings }) {
  const today = todayISO()
  const meals = getDayMeals(settings.mode, today)

  const mealLogs = useLiveQuery(
    () => db.mealLogs.where('date').equals(today).toArray(),
    [today],
  )

  if (!mealLogs) return null

  const doneCount = mealLogs.filter(l => l.completed).length

  const consumedKcalMin = meals.reduce((sum, meal, i) => {
    const done = mealLogs.find(l => l.mealIndex === i)?.completed
    return done && meal.kcalMin != null ? sum + meal.kcalMin : sum
  }, 0)
  const consumedKcalMax = meals.reduce((sum, meal, i) => {
    const done = mealLogs.find(l => l.mealIndex === i)?.completed
    return done && meal.kcalMax != null ? sum + meal.kcalMax : sum
  }, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {settings.mode === 'ramadan' ? 'Ramadan' : 'Normal'} plan
        </p>
        <div className="flex items-center gap-2">
          {consumedKcalMin > 0 && (
            <span className="text-xs text-orange-400/80 flex items-center gap-1">
              <Flame size={11} />
              {consumedKcalMin}–{consumedKcalMax} kcal
            </span>
          )}
          <span className="text-xs text-zinc-500">{doneCount}/{meals.length} meals</span>
        </div>
      </div>

      {meals.length === 0 && (
        <p className="text-center text-zinc-600 text-sm py-8">No meal plan for today.</p>
      )}

      {meals.map((meal, i) => (
        <MealCard
          key={i}
          meal={meal}
          index={i}
          date={today}
          mode={settings.mode}
          existingLog={mealLogs.find(l => l.mealIndex === i)}
        />
      ))}
    </div>
  )
}

function NutritionWeekView({ settings }: { settings: UserSettings }) {
  const weekMeals = getWeekMeals(settings.mode)

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
        {settings.mode === 'ramadan' ? 'Ramadan' : 'Normal'} — full week
      </p>

      {weekMeals.map(({ day, meals }) => (
        <div key={day} className="bg-surface-900 border border-surface-700 rounded-xl overflow-hidden">
          <div className="bg-surface-800 px-3 py-2">
            <p className="text-xs font-bold text-zinc-300">{day}</p>
          </div>
          <div className="divide-y divide-surface-800">
            {meals.map((meal, i) => (
              <div key={i} className="px-3 py-2.5">
                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                  <p className="text-xs font-semibold text-zinc-400">{meal.meal}</p>
                  {meal.kcalMin != null && (
                    <span className="text-[10px] text-orange-400/60 shrink-0">
                      ~{meal.kcalMin}–{meal.kcalMax}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">{meal.items}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function NutritionTab({ settings }: { settings: UserSettings }) {
  const [subTab, setSubTab] = useState<NutriSubTab>('today')

  return (
    <>
      {/* Sub-tab bar */}
      <div className="flex rounded-xl overflow-hidden border border-surface-700 bg-surface-900">
        {([
          { id: 'today', label: 'Today',     icon: <UtensilsCrossed size={13} /> },
          { id: 'week',  label: 'Full Week',  icon: <CalendarDays   size={13} /> },
        ] as { id: NutriSubTab; label: string; icon: React.ReactNode }[]).map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors',
              subTab === id ? 'bg-accent-500/15 text-accent-400' : 'text-zinc-500',
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {subTab === 'today' && <NutritionTodayView settings={settings} />}
      {subTab === 'week'  && <NutritionWeekView  settings={settings} />}
    </>
  )
}
