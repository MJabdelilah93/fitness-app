import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Header } from './Header'
import { BottomNav } from './BottomNav'
import { useAutoModeSwitch } from '../../hooks/useAutoModeSwitch'
import { scheduleTodayNotifications } from '../../utils/notifications'
import { db } from '../../db/db'
import { todayISO } from '../../utils/dateUtils'
import { useSettings } from '../../hooks/useSettings'
import { getProgram } from '../../data/programs'
import type { DayOfWeek } from '../../types'

const JS_TO_DOW: DayOfWeek[] = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DOW_ORDER: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

/**
 * Root shell: fixed header + scrollable content + fixed bottom nav.
 * Uses `h-dvh` so the layout fills the visible viewport on mobile
 * even when the browser chrome (address bar) is visible.
 *
 * Also mounts:
 *   – useAutoModeSwitch: auto-transitions Ramadan → Normal on the end date
 *   – useScheduleNotifications: schedules today's timed browser notifications once per session
 */
export function AppShell() {
  useAutoModeSwitch()
  useScheduleNotifications()

  return (
    <div className="flex flex-col h-dvh bg-surface-950 text-zinc-100 overflow-hidden">
      <Header />

      {/* Scrollable page content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        {/* Bottom padding prevents content hiding behind nav bar */}
        <div className="pb-24 min-h-full">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

// ─── Notification scheduler (side-effect, runs once per session per day) ─────

function useScheduleNotifications() {
  const { settings } = useSettings()
  const today = todayISO()

  const workoutSession = useLiveQuery(
    () => db.workoutSessions.where('date').equals(today).first(),
    [today],
  )
  const stepsLog = useLiveQuery(
    () => db.stepsLogs.where('date').equals(today).first(),
    [today],
  )
  const bodyLog = useLiveQuery(
    () => db.bodyLogs.where('date').equals(today).first(),
    [today],
  )

  useEffect(() => {
    if (!settings?.notificationsEnabled) return
    // Wait until all live queries have resolved (undefined = still loading)
    if (workoutSession === undefined || stepsLog === undefined || bodyLog === undefined) return

    const todayDow = JS_TO_DOW[new Date().getDay()]

    const program = getProgram(settings.mode)
    if (!program) return

    // Reproduce the gymStartDay schedule shift from useTodayPlan
    const gymStartDay = settings.gymStartDay ?? 'MON'
    const ids    = DOW_ORDER.map(d => program.weeklySchedule[d])
    const offset = DOW_ORDER.indexOf(gymStartDay)
    const shifted: Record<string, string> = {}
    DOW_ORDER.forEach((d, i) => { shifted[d] = ids[(i - offset + 7) % 7] })

    const sessionId = shifted[todayDow]
    const session   = program.sessions.find(s => s.id === sessionId)
    const isGymDay  = session?.gymDay ?? false

    scheduleTodayNotifications({
      isGymDay,
      workoutDoneToday:  workoutSession?.status === 'completed',
      stepsGoalMet:      (stepsLog?.steps ?? 0) >= (settings.stepGoalPerDay ?? 10_000),
      bodyLoggedToday:   bodyLog != null,
      notifyWorkoutTime: settings.notifyWorkoutTime ?? '18:00',
      notifyStepsTime:   settings.notifyStepsTime   ?? '20:00',
      notifyWeighInDay:  settings.notifyWeighInDay  ?? 'MON',
      todayDow,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.id, workoutSession, stepsLog, bodyLog])
}
