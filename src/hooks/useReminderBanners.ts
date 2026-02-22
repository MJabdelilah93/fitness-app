import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { todayISO } from '../utils/dateUtils'
import type { UserSettings, DayOfWeek } from '../types'
import type { TodayPlan } from './useTodayPlan'

// ─── Types ────────────────────────────────────────────────────────────────────

export type BannerType = 'workout' | 'steps' | 'weigh-in'

export interface ReminderBanner {
  type:    BannerType
  title:   string
  message: string
  action:  { label: string; to: string }
}

// ─── Time helper ──────────────────────────────────────────────────────────────

/** Returns the current local time as 'HH:mm'. */
function nowHHmm(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Returns the JS day of week as a DayOfWeek string. */
const JS_TO_DOW: Record<number, DayOfWeek> = {
  0: 'SUN', 1: 'MON', 2: 'TUE', 3: 'WED', 4: 'THU', 5: 'FRI', 6: 'SAT',
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Returns the list of reminder banners that should currently be visible.
 *
 * Rules (all require `settings.notificationsEnabled === true`):
 *   Workout  — today is a gym day + no workout session logged yet + current time ≥ notifyWorkoutTime
 *   Steps    — steps goal not met today + current time ≥ notifyStepsTime
 *   Weigh-in — today is the configured weigh-in weekday + no body log today
 *
 * In-app banners are always shown regardless of browser Notification permission.
 */
export function useReminderBanners(
  settings: UserSettings | null | undefined,
  plan:     TodayPlan | null,
): ReminderBanner[] {
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

  return useMemo(() => {
    // Not enabled or not yet loaded
    if (!settings?.notificationsEnabled) return []

    const current    = nowHHmm()
    const todayDow   = JS_TO_DOW[new Date().getDay()]
    const banners: ReminderBanner[] = []

    const workoutTime  = settings.notifyWorkoutTime ?? '18:00'
    const stepsTime    = settings.notifyStepsTime   ?? '20:00'
    const weighInDay   = settings.notifyWeighInDay  ?? 'MON'

    // Workout reminder
    if (
      plan?.isGymDay &&
      !workoutSession &&          // no session started/completed today
      current >= workoutTime
    ) {
      banners.push({
        type:    'workout',
        title:   'Gym session today',
        message: `Your ${plan.session.name} session is scheduled. Time to train!`,
        action:  { label: 'Start workout', to: '/workout' },
      })
    }

    // Steps reminder
    const stepsGoalMet = (stepsLog?.steps ?? 0) >= (settings.stepGoalPerDay ?? 10_000)
    if (!stepsGoalMet && current >= stepsTime) {
      banners.push({
        type:    'steps',
        title:   'Step goal',
        message: `You've walked ${(stepsLog?.steps ?? 0).toLocaleString()} / ${settings.stepGoalPerDay.toLocaleString()} steps today.`,
        action:  { label: 'Log steps', to: '/metrics' },
      })
    }

    // Weigh-in reminder
    if (todayDow === weighInDay && !bodyLog) {
      banners.push({
        type:    'weigh-in',
        title:   'Weekly weigh-in',
        message: 'Log your weight and waist measurement to track your trend.',
        action:  { label: 'Log measurements', to: '/metrics' },
      })
    }

    return banners
  // Re-evaluate whenever any live query resolves (workoutSession/stepsLog/bodyLog change),
  // settings change, or the plan changes. The nowHHmm() snapshot is taken at render time.
  }, [settings, plan, workoutSession, stepsLog, bodyLog])
}
