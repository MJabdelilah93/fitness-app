import { useState } from 'react'
import { Dumbbell, Footprints, Moon, Sun, ChevronRight } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'
import { useTodayPlan } from '../hooks/useTodayPlan'
import { useReminderBanners } from '../hooks/useReminderBanners'
import type { BannerType } from '../hooks/useReminderBanners'
import { db } from '../db/db'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { ProgressRing } from '../components/ui/ProgressRing'
import { PageSpinner } from '../components/ui/Spinner'
import { ReminderBanner } from '../components/ui/ReminderBanner'
import {
  formatDayFull,
  daysUntilRamadanEnd,
  isRamadanActive,
  todayISO,
} from '../utils/dateUtils'

export function HomePage() {
  const { settings, isLoading } = useSettings()
  const navigate = useNavigate()
  const today    = todayISO()
  const plan     = useTodayPlan(settings)

  // Reminder banners — dismissed in-session via local state
  const banners = useReminderBanners(settings, plan)
  const [dismissed, setDismissed] = useState<Set<BannerType>>(new Set())
  const visibleBanners = banners.filter(b => !dismissed.has(b.type))
  const dismissBanner  = (type: BannerType) => setDismissed(prev => new Set(prev).add(type))

  // Live-query today's step log
  const stepsLog = useLiveQuery(
    () => db.stepsLogs.where('date').equals(today).first(),
    [today],
  )

  // Live-query today's body log (for weight)
  const bodyLog = useLiveQuery(
    () => db.bodyLogs.where('date').equals(today).first(),
    [today],
  )

  if (isLoading) return <PageSpinner />

  const isRamadan  = settings?.mode === 'ramadan'
  const ramadanDaysLeft = settings
    ? daysUntilRamadanEnd(settings.ramadanEndDate)
    : 0

  const stepsNow  = stepsLog?.steps ?? 0
  const stepsGoal = settings?.stepGoalPerDay ?? 10_000
  const stepsProgress = stepsNow / stepsGoal

  return (
    <div className="px-4 pt-4 space-y-4 animate-fade-in">

      {/* ── Date header ──────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-widest">
            {plan?.dayLabel ?? new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </p>
          <h1 className="text-2xl font-extrabold leading-tight text-zinc-100 mt-0.5">
            {formatDayFull(today)}
          </h1>
          {settings?.displayName && (
            <p className="text-zinc-600 text-sm mt-0.5">
              Hey {settings.displayName} 👋
            </p>
          )}
        </div>
        {isRamadan
          ? <Moon className="text-amber-400 mt-1 shrink-0" size={24} />
          : <Sun  className="text-accent-500 mt-1 shrink-0" size={24} />
        }
      </div>

      {/* ── Ramadan countdown ─────────────────────────────── */}
      {isRamadan && settings && isRamadanActive(settings.ramadanEndDate) && ramadanDaysLeft > 0 && (
        <Card variant="accent" padding="sm">
          <div className="flex items-center gap-2">
            <Moon size={15} className="text-amber-400 shrink-0" />
            <span className="text-sm text-amber-300 font-medium">
              Ramadan ends in {ramadanDaysLeft} day{ramadanDaysLeft !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>
      )}

      {/* ── Reminder banners ──────────────────────────────── */}
      {visibleBanners.map(b => (
        <ReminderBanner
          key={b.type}
          banner={b}
          onDismiss={() => dismissBanner(b.type)}
        />
      ))}

      {/* ── Today's plan card ─────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Today's Plan
        </h2>

        {plan ? (
          <Card
            onClick={() => plan.isGymDay ? navigate('/workout') : navigate('/metrics')}
            className="active:scale-[0.98] transition-transform duration-100"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  plan.isGymDay ? 'bg-accent-500/15' : 'bg-green-500/15'
                }`}
              >
                {plan.isGymDay
                  ? <Dumbbell  size={22} className="text-accent-400" />
                  : <Footprints size={22} className="text-green-400" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-zinc-100 text-sm leading-snug">
                    {plan.session.name}
                  </span>
                  <Badge color={plan.isGymDay ? 'orange' : 'green'} dot>
                    {plan.isGymDay ? 'Gym' : 'Steps'}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 truncate">{plan.session.description}</p>
                {plan.isGymDay && plan.session.exercises.length > 0 && (
                  <p className="text-[11px] text-zinc-600 mt-0.5">
                    {plan.session.exercises.length} exercises · ~{plan.session.estimatedMinutes} min
                  </p>
                )}
              </div>
              <ChevronRight size={18} className="text-zinc-600 shrink-0" />
            </div>
          </Card>
        ) : (
          <Card variant="ghost">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center shrink-0">
                <Dumbbell size={22} className="text-zinc-600" />
              </div>
              <div>
                <p className="font-semibold text-zinc-500">No plan for today</p>
                <p className="text-xs text-zinc-700">Program data loads in Milestone 3</p>
              </div>
            </div>
          </Card>
        )}
      </section>

      {/* ── Step progress ring (non-gym days get this prominent) ── */}
      {plan && !plan.isGymDay && (
        <Card>
          <div className="flex items-center gap-4">
            <ProgressRing progress={stepsProgress} size={72} strokeWidth={7}>
              <span className="text-[10px] font-bold text-zinc-300">
                {Math.round(stepsProgress * 100)}%
              </span>
            </ProgressRing>
            <div className="flex-1">
              <p className="font-bold text-zinc-100 text-lg leading-none">
                {stepsNow.toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                of {stepsGoal.toLocaleString()} steps
              </p>
              <p className="text-xs text-zinc-600 mt-1">
                {stepsNow >= stepsGoal
                  ? '✓ Goal reached!'
                  : `${(stepsGoal - stepsNow).toLocaleString()} to go`}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ── Quick stats row ───────────────────────────────── */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
          Today's Snapshot
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Weight"
            value={bodyLog?.weightKg != null ? String(bodyLog.weightKg) : '—'}
            unit={settings?.weightUnit ?? 'kg'}
          />
          <StatCard
            label="Steps"
            value={stepsNow >= 1000 ? `${(stepsNow / 1000).toFixed(1)}k` : String(stepsNow)}
            unit={`/ ${stepsGoal >= 1000 ? `${stepsGoal / 1000}k` : stepsGoal}`}
          />
          <StatCard
            label="Mode"
            value={isRamadan ? 'Ramadan' : 'Normal'}
            unit=""
          />
        </div>
      </section>

      {/* ── Safety notice ─────────────────────────────────── */}
      <Card variant="ghost" padding="sm">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <span className="text-accent-400 font-semibold">Safety: </span>
          Pain &gt; 3/10 on any exercise? Use the replacement shown on the exercise card.
          Pain &gt; 6/10? Skip the movement entirely.
        </p>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit:  string
}) {
  return (
    <Card padding="sm">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-bold text-zinc-100 leading-none text-sm">{value}</p>
      {unit && <p className="text-[10px] text-zinc-600 mt-0.5">{unit}</p>}
    </Card>
  )
}
