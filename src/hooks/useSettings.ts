import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { UserSettings } from '../types'

export function useSettings() {
  // undefined  = still loading
  // null       = no settings row → needs onboarding
  // UserSettings = ready
  const settings = useLiveQuery(async (): Promise<UserSettings | null> => {
    const rows = await db.settings.toArray()
    return rows[0] ?? null
  })

  const updateSettings = async (
    patch: Partial<Omit<UserSettings, 'id' | 'createdAt'>>,
  ) => {
    const rows = await db.settings.toArray()
    if (rows[0]?.id != null) {
      await db.settings.update(rows[0].id, {
        ...patch,
        updatedAt: new Date().toISOString(),
      })
    }
  }

  return {
    settings,
    updateSettings,
    isLoading:       settings === undefined,
    needsOnboarding: settings === null,
  }
}
