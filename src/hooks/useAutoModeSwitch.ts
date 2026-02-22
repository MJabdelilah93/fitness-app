import { useEffect } from 'react'
import { useSettings } from './useSettings'
import { todayISO } from '../utils/dateUtils'

/**
 * Automatically switches the training mode from 'ramadan' to 'normal'
 * on or after the user-configured Ramadan end date.
 *
 * Runs once when the settings row first loads. Safe to call in AppShell
 * because `useSettings` is already subscribed there.
 */
export function useAutoModeSwitch(): void {
  const { settings, updateSettings } = useSettings()

  useEffect(() => {
    if (!settings) return
    if (settings.mode !== 'ramadan') return
    if (!settings.ramadanEndDate) return
    if (todayISO() >= settings.ramadanEndDate) {
      updateSettings({ mode: 'normal' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.id])   // intentionally only re-run when the row first appears
}
