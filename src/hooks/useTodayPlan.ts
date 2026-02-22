import { useMemo } from 'react'
import { todayISO, getDayOfWeek } from '../utils/dateUtils'
import { getProgram } from '../data/programs'
import type { UserSettings, SessionTemplate, DayOfWeek } from '../types'

// JS getDay() returns 0=Sun…6=Sat; our DayOfWeek uses MON…SUN strings
const JS_DAY_TO_DOW: Record<number, DayOfWeek> = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
}

// Canonical week order — used for schedule shifting
const DOW_ORDER: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']

export interface TodayPlan {
  date:      string
  dow:       DayOfWeek
  dayLabel:  string    // e.g. "Monday"
  session:   SessionTemplate
  isGymDay:  boolean
  programId: string
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: 'Monday',
  TUE: 'Tuesday',
  WED: 'Wednesday',
  THU: 'Thursday',
  FRI: 'Friday',
  SAT: 'Saturday',
  SUN: 'Sunday',
}

/**
 * Shift the program's weekly schedule so it starts on `startDay` instead of MON.
 *
 * Example — startDay='WED', offset=2:
 *   WED → session that was originally on MON (index 0)
 *   THU → session that was originally on TUE (index 1)
 *   MON → session that was originally on SAT (index 5)
 */
function buildSchedule(
  original: Record<DayOfWeek, string>,
  startDay: DayOfWeek,
): Record<DayOfWeek, string> {
  const ids    = DOW_ORDER.map(d => original[d])   // session IDs in canonical MON→SUN order
  const offset = DOW_ORDER.indexOf(startDay)        // 0 for MON, 2 for WED …

  const out = {} as Record<DayOfWeek, string>
  DOW_ORDER.forEach((d, i) => {
    out[d] = ids[(i - offset + 7) % 7]
  })
  return out
}

export function useTodayPlan(settings: UserSettings | null | undefined, date?: string): TodayPlan | null {
  return useMemo(() => {
    if (!settings) return null

    const d     = date ?? todayISO()
    const jsDow = getDayOfWeek(d)                                        // number 0–6
    const dow   = JS_DAY_TO_DOW[jsDow as keyof typeof JS_DAY_TO_DOW]    // DayOfWeek string
    if (!dow) return null

    const program = getProgram(settings.mode)
    if (!program) return null

    // Apply gymStartDay offset (default 'MON' = no shift)
    const gymStartDay = settings.gymStartDay ?? 'MON'
    const schedule    = gymStartDay === 'MON'
      ? program.weeklySchedule
      : buildSchedule(program.weeklySchedule as Record<DayOfWeek, string>, gymStartDay)

    const sessionId = (schedule as Record<string, string>)[dow]
    const session   = program.sessions.find((s) => s.id === sessionId)
    if (!session) return null

    const labels = DAY_LABELS as Record<string, string>

    return {
      date: d,
      dow,
      dayLabel:  labels[dow] ?? dow,
      session,
      isGymDay:  session.gymDay,
      programId: program.id,
    }
  }, [settings, date])
}
