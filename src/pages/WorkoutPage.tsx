import { useState, useMemo } from 'react'
import { Dumbbell, Footprints, ChevronLeft, ChevronRight, CalendarDays, Zap } from 'lucide-react'

import { useSettings }    from '../hooks/useSettings'
import { todayISO, toISODate, formatDayFull, formatDateShort } from '../utils/dateUtils'
import { getDayRows, getWeekRows, isLoggableRow, type ProgramRow } from '../data/programData'
import { ExerciseRowCard } from '../components/workout/ExerciseRowCard'
import { PageSpinner }    from '../components/ui/Spinner'
import { cn }             from '../utils/cn'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function groupByPart(rows: ProgramRow[]): { part: string; rows: ProgramRow[] }[] {
  const seen: string[] = []
  const map: Record<string, ProgramRow[]> = {}
  for (const row of rows) {
    if (!map[row.part]) { map[row.part] = []; seen.push(row.part) }
    map[row.part].push(row)
  }
  return seen.map(part => ({ part, rows: map[part] }))
}

function isGymDay(rows: ProgramRow[]): boolean {
  return rows.some(isLoggableRow)
}

// ─── Date navigation bar ──────────────────────────────────────────────────────

function DateNav({ offset, onChange }: { offset: number; onChange: (n: number) => void }) {
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

// ─── Today tab ────────────────────────────────────────────────────────────────

function TodayTab({
  dateOffset,
  setDateOffset,
  selectedDate,
  today,
}: {
  dateOffset:    number
  setDateOffset: (n: number) => void
  selectedDate:  string
  today:         string
}) {
  const { settings } = useSettings()
  const mode = settings?.mode ?? 'normal'
  const rows = getDayRows(mode, selectedDate)
  const groups = groupByPart(rows)
  const gymDay = isGymDay(rows)
  const isFuture = selectedDate > today

  if (rows.length === 0) {
    return (
      <div className="space-y-4 px-4 pt-4">
        <DateNav offset={dateOffset} onChange={setDateOffset} />
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Footprints size={40} className="text-zinc-700" />
          <p className="text-zinc-500 text-sm">Rest day — nothing scheduled.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 pt-4 pb-6">
      <DateNav offset={dateOffset} onChange={setDateOffset} />

      {/* Day type badge */}
      <div className="flex items-center gap-2">
        {gymDay
          ? <Dumbbell size={15} className="text-accent-400" />
          : <Footprints size={15} className="text-green-400" />
        }
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          {gymDay ? groups[0]?.part ?? 'Gym Day' : 'Active Recovery'}
        </span>
      </div>

      {/* Exercise groups */}
      {groups.map(({ part, rows: partRows }) => (
        <div key={part} className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 px-1">
            {part}
          </p>
          {partRows.map((row, i) => (
            <ExerciseRowCard
              key={`${row.exercise}-${i}`}
              row={row}
              date={selectedDate}
              mode={mode}
              readOnly={isFuture}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Week tab ─────────────────────────────────────────────────────────────────

function WeekTab() {
  const { settings } = useSettings()
  const mode  = settings?.mode ?? 'normal'
  const today = todayISO()
  const rows  = getWeekRows(mode)

  const byDay = DAY_ORDER.map(day => ({
    day,
    rows: rows.filter(r => r.day === day),
  }))

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <p className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">
        {mode === 'ramadan' ? 'Ramadan' : 'Normal'} program — full week
      </p>

      {byDay.map(({ day, rows: dayRows }) => {
        if (dayRows.length === 0) return null
        const todayDayShort = new Date(`${today}T00:00:00`)
          .toLocaleDateString('en-US', { weekday: 'short' })
          .slice(0, 3)
        const isToday = todayDayShort === day
        const gymDay  = isGymDay(dayRows)

        return (
          <div key={day} className={cn('rounded-xl border overflow-hidden', isToday ? 'border-accent-500/40' : 'border-surface-700')}>
            {/* Day header */}
            <div className={cn('flex items-center gap-2 px-3 py-2', isToday ? 'bg-accent-500/10' : 'bg-surface-800')}>
              {gymDay
                ? <Dumbbell size={13} className="text-accent-400" />
                : <Footprints size={13} className="text-green-400" />}
              <span className={cn('text-xs font-bold', isToday ? 'text-accent-300' : 'text-zinc-300')}>
                {day}
                {isToday && <span className="ml-1.5 text-[10px] text-accent-400">Today</span>}
              </span>
            </div>

            {/* Exercise rows */}
            <div className="divide-y divide-surface-800">
              {dayRows.map((row, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2">
                  <span className="text-[10px] text-zinc-700 mt-0.5 w-16 shrink-0">{row.part}</span>
                  <div className="flex-1 min-w-0">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-300 hover:text-accent-400 transition-colors leading-snug"
                    >
                      {row.exercise}
                    </a>
                    {row.sets && (
                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        {row.sets} × {row.reps}
                      </p>
                    )}
                    {!row.sets && row.reps && (
                      <p className="text-[10px] text-zinc-600 mt-0.5">{row.reps}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PageTab = 'today' | 'week'

export function WorkoutPage() {
  const { isLoading } = useSettings()
  const today = todayISO()

  const [pageTab,    setPageTab]    = useState<PageTab>('today')
  const [dateOffset, setDateOffset] = useState(0)

  const selectedDate = useMemo(() => {
    if (dateOffset === 0) return today
    const d = new Date()
    d.setDate(d.getDate() + dateOffset)
    return toISODate(d)
  }, [dateOffset, today])

  if (isLoading) return <PageSpinner />

  return (
    <div className="flex flex-col h-full">
      {/* ── Inner tab bar ── */}
      <div className="flex shrink-0 border-b border-surface-700 px-2">
        {([
          { id: 'today', label: 'Today',    icon: <Zap size={13} /> },
          { id: 'week',  label: 'Full Week', icon: <CalendarDays size={13} /> },
        ] as { id: PageTab; label: string; icon: React.ReactNode }[]).map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setPageTab(id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold',
              'transition-colors border-b-2 -mb-px',
              pageTab === id
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
        {pageTab === 'today' && (
          <TodayTab
            dateOffset={dateOffset}
            setDateOffset={setDateOffset}
            selectedDate={selectedDate}
            today={today}
          />
        )}
        {pageTab === 'week' && <WeekTab />}
      </div>
    </div>
  )
}
