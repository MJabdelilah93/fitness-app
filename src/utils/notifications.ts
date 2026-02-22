/**
 * Notification utilities — Milestone 5.
 *
 * Fully offline, no push server required.
 *
 * Two layers:
 *   1. In-app banners (useReminderBanners hook + ReminderBanner component) — always works,
 *      no user permission needed, rendered in HomePage.
 *   2. Browser Notification API — fires a system notification when the app is in the foreground
 *      at the configured time. Requires the user to grant permission in SettingsPage.
 *      Uses setTimeout — notifications fire only while the page is open.
 *
 * iOS note: Safari allows Web Notifications for installed PWAs (iOS 16.4+).
 * On older iOS or non-installed contexts the permission request is a no-op.
 */

import type { DayOfWeek } from '../types'

// ─── Feature detection ────────────────────────────────────────────────────────

/** Returns true when the Notification API is available in this browser. */
export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

/** Returns true when the user has already granted notification permission. */
export function permissionGranted(): boolean {
  return notificationsSupported() && Notification.permission === 'granted'
}

// ─── Permission request ───────────────────────────────────────────────────────

/**
 * Prompts the user for notification permission.
 * Returns the resulting permission state.
 * Safe to call when notifications are not supported — returns 'denied'.
 */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  if (Notification.permission === 'granted') return 'granted'
  return Notification.requestPermission()
}

// ─── Send ─────────────────────────────────────────────────────────────────────

/**
 * Shows a browser notification.
 * No-ops silently if permission is not granted or API unavailable.
 *
 * @param tag  Unique string — prevents duplicate notifications with the same tag.
 */
export function sendNotification(title: string, body: string, tag?: string): void {
  if (!permissionGranted()) return
  try {
    new Notification(title, {
      body,
      tag,
      icon: '/pwa-192x192.png',
      badge: '/pwa-192x192.png',
      silent: false,
    })
  } catch {
    // Notification constructor can throw in some restricted contexts — swallow silently.
  }
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

/**
 * Returns milliseconds until `time` (format 'HH:mm') today.
 * Returns 0 if the time has already passed.
 */
function msUntilToday(time: string): number {
  const [hh, mm] = time.split(':').map(Number)
  const now  = new Date()
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0)
  return Math.max(0, target.getTime() - now.getTime())
}

// ─── Session-scoped scheduler ─────────────────────────────────────────────────

/**
 * Schedules today's timed browser notifications using `setTimeout`.
 * Uses `sessionStorage` to ensure each notification is only scheduled once per
 * page session, regardless of how many times this function is called (e.g., on
 * React re-renders).
 *
 * Notifications fire while the app is open in the foreground.
 * If the app is closed before the time, nothing fires — this is intentional for
 * the offline-only constraint.
 */
export interface ScheduleOptions {
  isGymDay:          boolean
  workoutDoneToday:  boolean   // true if a session was completed today
  stepsGoalMet:      boolean
  bodyLoggedToday:   boolean
  notifyWorkoutTime: string    // 'HH:mm'
  notifyStepsTime:   string    // 'HH:mm'
  notifyWeighInDay:  DayOfWeek
  todayDow:          DayOfWeek
}

const SESSION_KEY = 'fittrack_notif_scheduled_date'

export function scheduleTodayNotifications(opts: ScheduleOptions): void {
  if (!permissionGranted()) return

  // Only schedule once per calendar day per page session
  const today = new Date().toISOString().slice(0, 10)
  if (sessionStorage.getItem(SESSION_KEY) === today) return
  sessionStorage.setItem(SESSION_KEY, today)

  const {
    isGymDay,
    workoutDoneToday,
    stepsGoalMet,
    bodyLoggedToday,
    notifyWorkoutTime,
    notifyStepsTime,
    notifyWeighInDay,
    todayDow,
  } = opts

  // Workout reminder
  if (isGymDay && !workoutDoneToday) {
    const ms = msUntilToday(notifyWorkoutTime)
    if (ms > 0) {
      setTimeout(() => {
        sendNotification(
          "Time to train 💪",
          "Your gym session is scheduled for today. Let's go!",
          'workout-reminder',
        )
      }, ms)
    }
  }

  // Steps reminder
  if (!stepsGoalMet) {
    const ms = msUntilToday(notifyStepsTime)
    if (ms > 0) {
      setTimeout(() => {
        sendNotification(
          "Don't forget your steps 🚶",
          "You haven't logged your step goal yet today.",
          'steps-reminder',
        )
      }, ms)
    }
  }

  // Weigh-in reminder — fires immediately if it's the right day and no log yet
  if (todayDow === notifyWeighInDay && !bodyLoggedToday) {
    // Small delay so UI is fully loaded before notification appears
    setTimeout(() => {
      sendNotification(
        "Weekly weigh-in day ⚖️",
        "Log your weight and waist measurement for today.",
        'weighin-reminder',
      )
    }, 3000)
  }
}
