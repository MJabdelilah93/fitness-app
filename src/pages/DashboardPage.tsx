import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Flame, Award, Footprints, Scale, Ruler } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

import { useSettings } from '../hooks/useSettings'
import { db } from '../db/db'
import { getProgram } from '../data/programs'
import {
  todayISO, lastNDays, formatDateShort,
  toISODate, fromISODate, getDayOfWeek,
} from '../utils/dateUtils'
import { fromKg } from '../utils/units'
import { Card } from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import { cn } from '../utils/cn'
import type { DayOfWeek, TrainingMode, WorkoutSession, StepsLog } from '../types'

// ─── DOW mapping ──────────────────────────────────────────────────────────────

const JS_TO_DOW: Record<number, DayOfWeek> = {
  0: 'SUN', 1: 'MON', 2: 'TUE',
  3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT',
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function shiftDay(iso: string, delta: number): string {
  const d = fromISODate(iso)
  d.setDate(d.getDate() + delta)
  return toISODate(d)
}

function computeStreak(
  sessions:  WorkoutSession[],
  stepsLogs: StepsLog[],
): { current: number; longest: number } {
  const active = new Set<string>()
  sessions .filter((s) => s.status === 'completed').forEach((s) => active.add(s.date))
  stepsLogs.filter((s) => s.goalMet).forEach((s) => active.add(s.date))

  if (active.size === 0) return { current: 0, longest: 0 }

  // Current streak — start from today or yesterday
  const today     = todayISO()
  const yesterday = shiftDay(today, -1)
  let current = 0
  let check: string | null = active.has(today)
    ? today
    : active.has(yesterday)
    ? yesterday
    : null

  while (check && active.has(check)) {
    current++
    check = shiftDay(check, -1)
  }

  // Longest streak — walk sorted dates
  const sorted = Array.from(active).sort()
  let longest = 0, run = 0, prev: string | null = null
  for (const iso of sorted) {
    run = prev !== null && shiftDay(prev, 1) === iso ? run + 1 : 1
    if (run > longest) longest = run
    prev = iso
  }

  return { current, longest }
}

function computeAdherence(
  sessions:    WorkoutSession[],
  stepsLogs:   StepsLog[],
  mode:        TrainingMode,
  lookback = 7,
): {
  gymCompleted:  number
  gymScheduled:  number
  stepsGoalMet:  number
  stepsDays:     number
  pct:           number
} {
  const program = getProgram(mode)
  if (!program) return { gymCompleted: 0, gymScheduled: 0, stepsGoalMet: 0, stepsDays: 0, pct: 0 }

  const completedDates = new Set(sessions .filter((s) => s.status === 'completed').map((s) => s.date))
  const stepsMetDates  = new Set(stepsLogs.filter((s) => s.goalMet).map((s) => s.date))

  let gymScheduled = 0, gymCompleted = 0, stepsDays = 0, stepsGoalMet = 0

  for (const day of lastNDays(lookback)) {
    const dow       = JS_TO_DOW[getDayOfWeek(day)]
    if (!dow) continue
    const schedule  = program.weeklySchedule as Record<string, string>
    const sessionId = schedule[dow]
    const session   = program.sessions.find((s) => s.id === sessionId)
    if (!session || session.type === 'rest') continue

    if (session.gymDay) {
      gymScheduled++
      if (completedDates.has(day)) gymCompleted++
    } else if (session.type === 'steps') {
      stepsDays++
      if (stepsMetDates.has(day)) stepsGoalMet++
    }
  }

  const total = gymScheduled + stepsDays
  const done  = gymCompleted + stepsGoalMet
  return {
    gymCompleted, gymScheduled, stepsGoalMet, stepsDays,
    pct: total > 0 ? Math.round((done / total) * 100) : 0,
  }
}

// ─── Chart theme ──────────────────────────────────────────────────────────────

const GRID_COLOR    = '#27272a' // zinc-800
const AXIS_COLOR    = '#71717a' // zinc-500
const TICK_COLOR    = '#71717a'
const BORDER_COLOR  = '#3f3f46' // zinc-700
const TOOLTIP_BG    = '#18181b' // zinc-900
const FONT_SIZE     = 9

const tooltipStyle: React.CSSProperties = {
  backgroundColor: TOOLTIP_BG,
  border:          `1px solid ${BORDER_COLOR}`,
  borderRadius:    '8px',
  fontSize:        '12px',
  color:           '#f4f4f5',
}

function ChartXAxis() {
  return (
    <XAxis
      dataKey="date"
      tick={{ fill: TICK_COLOR, fontSize: FONT_SIZE }}
      axisLine={{ stroke: AXIS_COLOR }}
      tickLine={false}
      interval="preserveStartEnd"
    />
  )
}

function ChartYAxis({ fmt }: { fmt?: (v: number) => string }) {
  return (
    <YAxis
      tick={{ fill: TICK_COLOR, fontSize: FONT_SIZE }}
      axisLine={false}
      tickLine={false}
      width={38}
      tickFormatter={fmt}
    />
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DashboardPage() {
  const { settings, isLoading } = useSettings()

  const sessions  = useLiveQuery(() => db.workoutSessions.toArray(), [])
  const stepsLogs = useLiveQuery(() => db.stepsLogs.toArray(),       [])
  const bodyLogs  = useLiveQuery(async () => {
    const days = lastNDays(30)
    const logs = await db.bodyLogs.where('date').anyOf(days).toArray()
    return logs.sort((a, b) => a.date.localeCompare(b.date))
  }, [])

  if (isLoading || sessions === undefined || stepsLogs === undefined || bodyLogs === undefined) {
    return <PageSpinner />
  }
  if (!settings) return null

  const wUnit = settings.weightUnit

  // ── Derived stats ──────────────────────────────────────────────

  const streak    = computeStreak(sessions, stepsLogs)
  const adherence = computeAdherence(sessions, stepsLogs, settings.mode, 7)

  // ── Chart data ────────────────────────────────────────────────

  const weightData = bodyLogs
    .filter((l) => l.weightKg != null)
    .map((l) => ({
      date:  formatDateShort(l.date),
      value: parseFloat(fromKg(l.weightKg!, wUnit).toFixed(1)),
    }))

  const waistData = bodyLogs
    .filter((l) => l.waistCm != null)
    .map((l) => ({ date: formatDateShort(l.date), value: l.waistCm! }))

  const stepsData = lastNDays(14).map((day) => {
    const log = stepsLogs.find((l) => l.date === day)
    return {
      date:  formatDateShort(day),
      steps: log?.steps ?? 0,
    }
  })

  const hasAnyData = sessions.length > 0 || stepsLogs.length > 0 || bodyLogs.length > 0

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="px-4 pt-4 pb-24 space-y-6 animate-fade-in">
      <h1 className="text-xl font-extrabold text-zinc-100">Progress</h1>

      {!hasAnyData && (
        <Card variant="ghost" padding="lg">
          <p className="text-center text-zinc-500 text-sm leading-relaxed">
            Start logging workouts, steps, and body metrics to see your progress here.
          </p>
        </Card>
      )}

      {/* ── Streaks ────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Streaks</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Flame size={20} className="text-orange-400" />}
            iconBg="bg-orange-500/15"
            value={streak.current}
            label="day streak"
          />
          <StatCard
            icon={<Award size={20} className="text-purple-400" />}
            iconBg="bg-purple-500/15"
            value={streak.longest}
            label="best ever"
          />
        </div>
      </section>

      {/* ── Weekly adherence ───────────────────────────────────── */}
      <section>
        <SectionLabel>This Week's Adherence</SectionLabel>
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 text-sm font-semibold">Overall</span>
              <span className={cn(
                'text-3xl font-extrabold leading-none',
                adherence.pct >= 80 ? 'text-green-400'
                  : adherence.pct >= 50 ? 'text-accent-400'
                  : 'text-zinc-400',
              )}>
                {adherence.pct}%
              </span>
            </div>

            <div className="flex gap-0.5 h-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex-1 rounded-sm transition-colors duration-300',
                    (i + 1) * 5 <= adherence.pct
                      ? adherence.pct >= 80 ? 'bg-green-500'
                        : adherence.pct >= 50 ? 'bg-accent-500'
                        : 'bg-zinc-600'
                      : 'bg-surface-800',
                  )}
                />
              ))}
            </div>

            <div className="flex gap-4 text-xs text-zinc-500 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />
                Gym: {adherence.gymCompleted}/{adherence.gymScheduled} sessions
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                Steps: {adherence.stepsGoalMet}/{adherence.stepsDays} days
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Weight trend ───────────────────────────────────────── */}
      <section>
        <SectionLabel>
          <Scale size={12} className="inline mr-1 text-blue-400" />
          Weight Trend · 30 days
        </SectionLabel>
        <Card padding="sm">
          {weightData.length < 2 ? (
            <EmptyChart label="Log at least 2 body entries to see trend" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weightData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <ChartXAxis />
                <ChartYAxis fmt={(v) => `${v}${wUnit}`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: AXIS_COLOR }}
                  formatter={(v) => [`${v} ${wUnit}`, 'Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </section>

      {/* ── Waist trend ────────────────────────────────────────── */}
      <section>
        <SectionLabel>
          <Ruler size={12} className="inline mr-1 text-purple-400" />
          Waist Trend · 30 days
        </SectionLabel>
        <Card padding="sm">
          {waistData.length < 2 ? (
            <EmptyChart label="Log at least 2 waist measurements to see trend" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={waistData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                <ChartXAxis />
                <ChartYAxis fmt={(v) => `${v}cm`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: AXIS_COLOR }}
                  formatter={(v) => [`${v} cm`, 'Waist']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#a78bfa', strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </section>

      {/* ── Steps bar chart ────────────────────────────────────── */}
      <section>
        <SectionLabel>
          <Footprints size={12} className="inline mr-1 text-green-400" />
          Steps · 14 days
        </SectionLabel>
        <Card padding="sm">
          {stepsData.every((d) => d.steps === 0) ? (
            <EmptyChart label="Log some steps to see your trend" />
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stepsData} margin={{ top: 5, right: 8, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                <ChartXAxis />
                <ChartYAxis fmt={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: AXIS_COLOR }}
                  formatter={(v) => [(v as number).toLocaleString(), 'Steps']}
                />
                <Bar
                  dataKey="steps"
                  fill="#22c55e"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </section>
    </div>
  )
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
      {children}
    </p>
  )
}

function StatCard({
  icon, iconBg, value, label,
}: {
  icon:   React.ReactNode
  iconBg: string
  value:  number
  label:  string
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-extrabold text-zinc-100 leading-none">{value}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
        </div>
      </div>
    </Card>
  )
}

function EmptyChart({ label }: { label: string }) {
  return (
    <p className="text-center text-zinc-600 text-sm py-8">{label}</p>
  )
}
