// ─── Core ────────────────────────────────────────────────────────────────────

/** Returns today's date as 'YYYY-MM-DD'. */
export function todayISO(): string {
  return toISODate(new Date())
}

/** Formats a Date object to 'YYYY-MM-DD'. */
export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parses 'YYYY-MM-DD' to a local Date (midnight). */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Returns the JS day-of-week (0=Sun … 6=Sat) for a given ISO string. */
export function getDayOfWeek(iso: string): number {
  return fromISODate(iso).getDay()
}

/** Returns the Monday (ISO) of the week containing `date`. */
export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day   // shift Sun→Mon
  d.setDate(d.getDate() + diff)
  return toISODate(d)
}

/** Returns the last N days as ISO strings, newest last. */
export function lastNDays(n: number): string[] {
  const result: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    result.push(toISODate(d))
  }
  return result
}

// ─── Display helpers ─────────────────────────────────────────────────────────

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

/** e.g. "Monday, 3 Feb" */
export function formatDayFull(iso: string): string {
  const d = fromISODate(iso)
  return `${DAY_NAMES[d.getDay()]}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

/** e.g. "Mon" */
export function formatDayShort(iso: string): string {
  return SHORT_DAYS[fromISODate(iso).getDay()]
}

/** e.g. "3 Feb" */
export function formatDateShort(iso: string): string {
  const d = fromISODate(iso)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}

/** e.g. "Feb 2025" */
export function formatMonthYear(iso: string): string {
  const d = fromISODate(iso)
  return `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

/** "2 h 15 min" from a duration in seconds. */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

// ─── Ramadan helpers ─────────────────────────────────────────────────────────

/** Returns true if today is on or before the Ramadan end date. */
export function isRamadanActive(ramadanEndDate: string): boolean {
  const today = todayISO()
  return today <= ramadanEndDate
}

/** Days remaining until Ramadan ends (0 if past). */
export function daysUntilRamadanEnd(ramadanEndDate: string): number {
  const end = fromISODate(ramadanEndDate).getTime()
  const now = new Date().setHours(0, 0, 0, 0)
  const diff = Math.ceil((end - now) / 86_400_000)
  return Math.max(0, diff)
}
