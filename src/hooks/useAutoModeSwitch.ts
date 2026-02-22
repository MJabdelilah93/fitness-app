import { useEffect } from 'react'
import { useSettings } from './useSettings'
import { todayISO } from '../utils/dateUtils'

// Ramadan 2026: Feb 18 → Mar 20
const RAMADAN_END_2026 = '2026-03-20'
const OLD_DEFAULT_DATE = '2025-03-20'

/**
 * Automatically switches the training mode based on the Ramadan end date:
 *   – today <= ramadanEndDate  →  mode becomes 'ramadan'
 *   – today >  ramadanEndDate  →  mode becomes 'normal'
 *
 * Also migrates the old onboarding default date ('2025-03-20') to the
 * current year's value so existing users get the correct end date.
 *
 * Runs once when the settings row first loads. Safe to call in AppShell.
 */
export function useAutoModeSwitch(): void {
  const { settings, updateSettings } = useSettings()

  useEffect(() => {
    if (!settings) return

    const patch: Record<string, unknown> = {}

    // Migrate old default end date for existing users
    let endDate = settings.ramadanEndDate
    if (endDate === OLD_DEFAULT_DATE) {
      endDate = RAMADAN_END_2026
      patch.ramadanEndDate = endDate
    }

    if (!endDate) return

    // Bidirectional: enforce the correct mode based on today vs end date
    const targetMode = todayISO() <= endDate ? 'ramadan' : 'normal'
    if (settings.mode !== targetMode) {
      patch.mode = targetMode
    }

    if (Object.keys(patch).length > 0) {
      updateSettings(patch)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.id])   // intentionally only re-run when the row first loads
}
