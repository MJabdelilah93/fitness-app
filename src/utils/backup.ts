/**
 * Backup utilities — JSON export and import.
 * All data stays local; this is the only data-portability mechanism.
 */
import { db, clearAllData } from '../db/db'
import { BACKUP_VERSION, type BackupData, type UserSettings } from '../types'

// ─── Export ───────────────────────────────────────────────────────────────────

export async function createBackup(): Promise<BackupData> {
  const [
    settingsArr,
    workoutSessions,
    exerciseLogs,
    stepsLogs,
    bodyLogs,
    nutritionLogs,
  ] = await Promise.all([
    db.settings.toArray(),
    db.workoutSessions.toArray(),
    db.exerciseLogs.toArray(),
    db.stepsLogs.toArray(),
    db.bodyLogs.toArray(),
    db.nutritionLogs.toArray(),
  ])

  const settings = settingsArr[0]
  if (!settings) throw new Error('No settings found — onboarding may not be complete.')

  return {
    version:        BACKUP_VERSION,
    exportedAt:     new Date().toISOString(),
    appMode:        settings.mode,
    settings,
    workoutSessions,
    exerciseLogs,
    stepsLogs,
    bodyLogs,
    nutritionLogs,
  }
}

/** Triggers a browser file-save dialog with the JSON backup. */
export async function downloadBackup(): Promise<void> {
  const data = await createBackup()
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `fittrack-backup-${data.exportedAt.slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Import ───────────────────────────────────────────────────────────────────

export class BackupValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BackupValidationError'
  }
}

/** Validate shape before touching the DB. */
function validateBackup(raw: unknown): BackupData {
  if (typeof raw !== 'object' || raw === null) {
    throw new BackupValidationError('File is not a valid JSON object.')
  }
  const b = raw as Record<string, unknown>

  if (b.version !== BACKUP_VERSION) {
    throw new BackupValidationError(
      `Unsupported backup version: ${b.version}. Expected ${BACKUP_VERSION}.`,
    )
  }
  if (!b.settings || typeof b.settings !== 'object') {
    throw new BackupValidationError('Backup is missing "settings" field.')
  }
  const s = b.settings as Partial<UserSettings>
  if (!s.mode || (s.mode !== 'normal' && s.mode !== 'ramadan')) {
    throw new BackupValidationError('Backup settings.mode must be "normal" or "ramadan".')
  }
  return raw as BackupData
}

/**
 * Restore a backup.
 * Wipes existing data first — caller must show a confirmation dialog.
 */
export async function restoreBackup(jsonText: string): Promise<void> {
  let raw: unknown
  try {
    raw = JSON.parse(jsonText)
  } catch {
    throw new BackupValidationError('File is not valid JSON.')
  }

  const data = validateBackup(raw)

  await clearAllData()

  await db.transaction('rw', db.tables, async () => {
    // Strip ids so Dexie auto-assigns new ones, preventing PK conflicts
    const strip = <T extends { id?: number }>(arr: T[]): Omit<T, 'id'>[] =>
      arr.map(({ id: _id, ...rest }) => rest)

    await db.settings.add(strip([data.settings])[0] as UserSettings)

    if (data.workoutSessions.length) {
      await db.workoutSessions.bulkAdd(strip(data.workoutSessions) as typeof data.workoutSessions)
    }
    if (data.exerciseLogs.length) {
      await db.exerciseLogs.bulkAdd(strip(data.exerciseLogs) as typeof data.exerciseLogs)
    }
    if (data.stepsLogs.length) {
      await db.stepsLogs.bulkAdd(strip(data.stepsLogs) as typeof data.stepsLogs)
    }
    if (data.bodyLogs.length) {
      await db.bodyLogs.bulkAdd(strip(data.bodyLogs) as typeof data.bodyLogs)
    }
    if (data.nutritionLogs.length) {
      await db.nutritionLogs.bulkAdd(strip(data.nutritionLogs) as typeof data.nutritionLogs)
    }
  })
}

/** Opens a file picker and resolves with the text content of the chosen file. */
export function pickJsonFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input   = document.createElement('input')
    input.type    = 'file'
    input.accept  = '.json,application/json'
    input.style.display = 'none'

    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) { reject(new Error('No file selected.')); return }
      const reader = new FileReader()
      reader.onload  = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read file.'))
      reader.readAsText(file)
      document.body.removeChild(input)
    }
    input.oncancel = () => {
      document.body.removeChild(input)
      reject(new Error('Cancelled.'))
    }

    document.body.appendChild(input)
    input.click()
  })
}
