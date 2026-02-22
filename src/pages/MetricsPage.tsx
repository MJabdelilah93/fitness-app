import { useState, useEffect } from 'react'
import { Footprints, Scale, Flame, Dumbbell, Check, Ruler, ChevronDown, ChevronUp } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

import { useSettings } from '../hooks/useSettings'
import { db, upsertStepsLog, upsertBodyLog, upsertNutritionLog } from '../db/db'
import { todayISO, lastNDays, formatDateShort } from '../utils/dateUtils'
import { toKg, fromKg } from '../utils/units'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import { cn } from '../utils/cn'
import { getNutritionTarget } from '../data/nutritionTargets'
import type { MealTemplate } from '../data/nutritionTargets'
import type { UserSettings, StepsLog, BodyLog, NutritionLog } from '../types'

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

// ─── Nutrition Targets Card ───────────────────────────────────────────────────

function MealRow({ meal }: { meal: MealTemplate }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-surface-800 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between py-3 px-4 text-left"
      >
        <div>
          <p className="text-sm font-medium text-zinc-200">{meal.name}</p>
          <p className="text-xs text-zinc-500">{meal.timing}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-2">
          <span className="text-xs tabular-nums text-zinc-400">
            {meal.caloriesMin}–{meal.caloriesMax} kcal · {meal.proteinG}g P
          </span>
          {open
            ? <ChevronUp size={14} className="text-zinc-500" />
            : <ChevronDown size={14} className="text-zinc-500" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2">
          <ul className="space-y-1">
            {meal.suggestions.map((s) => (
              <li key={s} className="text-xs text-zinc-400 flex gap-2">
                <span className="text-accent-500 shrink-0">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
          {meal.note && (
            <p className="text-xs text-amber-300/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mt-2">
              {meal.note}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function NutritionTargetsCard({ mode }: { mode: UserSettings['mode'] }) {
  const [showMeals, setShowMeals] = useState(false)
  const target = getNutritionTarget(mode)

  return (
    <Card padding="none">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-surface-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Daily Targets
        </p>
        <p className="text-xs text-accent-400 font-medium mb-3">{target.topRule}</p>

        {/* Macro summary row */}
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Calories', value: `${target.caloriesMin}–${target.caloriesMax}`, unit: 'kcal', color: 'text-orange-400' },
            { label: 'Protein',  value: `${target.proteinG}`,                          unit: 'g',    color: 'text-blue-400'   },
            { label: 'Carbs',    value: `${target.carbsGMin}–${target.carbsGMax}`,     unit: 'g',    color: 'text-yellow-400' },
            { label: 'Fat',      value: `${target.fatGMin}–${target.fatGMax}`,         unit: 'g',    color: 'text-pink-400'   },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-surface-800 rounded-xl py-2 px-1">
              <p className={cn('text-sm font-bold tabular-nums', color)}>{value}</p>
              <p className="text-[10px] text-zinc-500">{unit}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-zinc-600 mt-2 text-center">
          Water: {(target.waterMlMin / 1000).toFixed(1)} L minimum
        </p>
      </div>

      {/* Meal templates toggle */}
      <button
        type="button"
        onClick={() => setShowMeals((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-zinc-300 hover:text-zinc-100 transition-colors"
      >
        <span>Meal Templates ({target.meals.length})</span>
        {showMeals
          ? <ChevronUp size={16} className="text-zinc-500" />
          : <ChevronDown size={16} className="text-zinc-500" />}
      </button>

      {showMeals && (
        <div>
          {target.meals.map((meal) => (
            <MealRow key={meal.id} meal={meal} />
          ))}
        </div>
      )}
    </Card>
  )
}

// ─── Nutrition Tab ────────────────────────────────────────────────────────────

function NutritionTab({ settings }: { settings: UserSettings }) {
  const today    = todayISO()
  const isRamadan = settings.mode === 'ramadan'

  const [calories, setCalories] = useState('')
  const [protein,  setProtein]  = useState('')
  const [saved,    setSaved]    = useState(false)

  const todayLog = useLiveQuery(
    () => db.nutritionLogs.where('date').equals(today).first(),
    [today],
  )

  const history = useLiveQuery(async () => {
    const days = lastNDays(14)
    const logs = await db.nutritionLogs.where('date').anyOf(days).toArray()
    return logs.sort((a, b) => b.date.localeCompare(a.date))
  }, [])

  useEffect(() => {
    if (!todayLog) return
    if (calories === '' && todayLog.calories > 0) setCalories(String(todayLog.calories))
    if (protein  === '' && todayLog.proteinG > 0) setProtein(String(todayLog.proteinG))
  }, [todayLog]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    const cal = parseFloat(calories)
    const pro = parseFloat(protein)
    if (isNaN(cal) && isNaN(pro)) return
    await upsertNutritionLog(today, {
      ...(!isNaN(cal) ? { calories: cal } : {}),
      ...(!isNaN(pro) ? { proteinG: pro } : {}),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <NutritionTargetsCard mode={settings.mode} />

      <Card>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Today's Log
          </p>

          {isRamadan && (
            <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
              Ramadan mode: log combined Suhoor + Iftar daily totals
            </div>
          )}

          <Input
            label="Calories"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            suffix="kcal"
            prefix={<Flame size={16} className="text-orange-400" />}
          />

          <Input
            label="Protein"
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            suffix="g"
            prefix={<Dumbbell size={16} className="text-blue-400" />}
          />

          <Button
            variant="primary"
            fullWidth
            onClick={handleSave}
            icon={saved ? <Check size={16} /> : undefined}
          >
            {saved ? 'Saved!' : 'Log Nutrition'}
          </Button>
        </div>
      </Card>

      <HistorySection
        label="Last 14 Days"
        empty={history !== undefined && history.length === 0}
      >
        {(history ?? []).map((log) => (
          <NutritionRow key={log.id ?? log.date} log={log} isToday={log.date === today} />
        ))}
      </HistorySection>
    </>
  )
}

function NutritionRow({ log, isToday }: { log: NutritionLog; isToday: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 px-4">
      <p className={cn('text-sm font-medium', isToday ? 'text-accent-400' : 'text-zinc-200')}>
        {isToday ? 'Today' : formatDateShort(log.date)}
      </p>
      <div className="flex items-center gap-4 text-sm tabular-nums">
        <span className="text-zinc-300">
          {log.calories.toLocaleString()} kcal
        </span>
        <span className="text-zinc-500">
          {log.proteinG}g prot
        </span>
      </div>
    </div>
  )
}
