import Dexie, { type Table } from 'dexie'
import type {
  UserSettings,
  WorkoutSession,
  ExerciseLog,
  StepsLog,
  BodyLog,
  NutritionLog,
  RowLog,
  MealLog,
  TrainingMode,
} from '../types'

// ─── Schema version history ──────────────────────────────────────────────────
//  v1  – initial schema aligned with product spec (M2)

class FitnessDB extends Dexie {
  settings!:        Table<UserSettings,   number>
  workoutSessions!: Table<WorkoutSession, number>
  exerciseLogs!:    Table<ExerciseLog,    number>
  stepsLogs!:       Table<StepsLog,       number>
  bodyLogs!:        Table<BodyLog,        number>
  nutritionLogs!:   Table<NutritionLog,   number>
  rowLogs!:         Table<RowLog,         number>
  mealLogs!:        Table<MealLog,        number>

  constructor() {
    super('FitnessDB')

    // v1 – initial schema (M2)
    this.version(1).stores({
      // ++id       = auto-increment primary key
      // &field     = unique index
      // field      = regular index
      settings:         '++id',
      workoutSessions:  '++id, date, sessionTemplateId, status',
      exerciseLogs:     '++id, workoutSessionId, exerciseId',
      stepsLogs:        '++id, &date',
      bodyLogs:         '++id, &date',
      nutritionLogs:    '++id, &date',
    })

    // v2 – M5: adds gymStartDay + notification schedule fields to existing settings rows.
    // No store-schema change (no new indexes) — only a data migration.
    this.version(2).stores({
      settings:         '++id',
      workoutSessions:  '++id, date, sessionTemplateId, status',
      exerciseLogs:     '++id, workoutSessionId, exerciseId',
      stepsLogs:        '++id, &date',
      bodyLogs:         '++id, &date',
      nutritionLogs:    '++id, &date',
    }).upgrade(tx =>
      tx.table('settings').toCollection().modify((row: Record<string, unknown>) => {
        if (row['gymStartDay']       == null) row['gymStartDay']       = 'MON'
        if (row['notifyWorkoutTime'] == null) row['notifyWorkoutTime'] = '18:00'
        if (row['notifyStepsTime']   == null) row['notifyStepsTime']   = '20:00'
        if (row['notifyWeighInDay']  == null) row['notifyWeighInDay']  = 'MON'
      }),
    )

    // v3 – New flat-data workout logging (rowLogs) + meal adherence (mealLogs).
    this.version(3).stores({
      settings:         '++id',
      workoutSessions:  '++id, date, sessionTemplateId, status',
      exerciseLogs:     '++id, workoutSessionId, exerciseId',
      stepsLogs:        '++id, &date',
      bodyLogs:         '++id, &date',
      nutritionLogs:    '++id, &date',
      rowLogs:          '++id, date, exerciseKey',
      mealLogs:         '++id, date',
    })
  }
}

export const db = new FitnessDB()

// ─── Settings helpers ─────────────────────────────────────────────────────────

/** Returns the settings row, or null if onboarding not done yet. */
export async function getSettings(): Promise<UserSettings | null> {
  const all = await db.settings.toArray()
  return all[0] ?? null
}

export async function updateSettings(
  patch: Partial<Omit<UserSettings, 'id' | 'createdAt'>>,
): Promise<void> {
  const all = await db.settings.toArray()
  if (all[0]?.id != null) {
    await db.settings.update(all[0].id, {
      ...patch,
      updatedAt: new Date().toISOString(),
    })
  }
}

// ─── Steps helpers ────────────────────────────────────────────────────────────

export async function upsertStepsLog(
  date: string,
  steps: number,
  goalSteps: number,
  notes?: string,
): Promise<void> {
  const existing = await db.stepsLogs.where('date').equals(date).first()
  const goalMet = steps >= goalSteps
  if (existing?.id != null) {
    await db.stepsLogs.update(existing.id, { steps, goalSteps, goalMet, notes })
  } else {
    await db.stepsLogs.add({ date, steps, goalSteps, goalMet, source: 'manual', notes })
  }
}

// ─── Body log helpers ─────────────────────────────────────────────────────────

export async function upsertBodyLog(
  date: string,
  data: Partial<Pick<BodyLog, 'weightKg' | 'waistCm' | 'bodyFatPercent' | 'timeOfDay' | 'notes'>>,
): Promise<void> {
  const existing = await db.bodyLogs.where('date').equals(date).first()
  if (existing?.id != null) {
    await db.bodyLogs.update(existing.id, data)
  } else {
    await db.bodyLogs.add({ date, timeOfDay: 'morning', ...data })
  }
}

// ─── Nutrition helpers ────────────────────────────────────────────────────────

export async function upsertNutritionLog(
  date: string,
  data: Partial<Pick<NutritionLog, 'calories' | 'proteinG' | 'carbsG' | 'fatG' | 'waterMl' | 'mealContext' | 'notes'>>,
): Promise<void> {
  const existing = await db.nutritionLogs.where('date').equals(date).first()
  if (existing?.id != null) {
    await db.nutritionLogs.update(existing.id, data)
  } else {
    await db.nutritionLogs.add({
      date,
      calories: 0,
      proteinG: 0,
      mealContext: 'standard',
      ...data,
    })
  }
}

// ─── Row log helpers ──────────────────────────────────────────────────────────

export async function upsertRowLog(
  date: string,
  planMode: TrainingMode,
  exerciseKey: string,
  data: Partial<Omit<RowLog, 'id' | 'date' | 'planMode' | 'exerciseKey'>>,
): Promise<void> {
  const existing = await db.rowLogs
    .where('date').equals(date)
    .filter(l => l.exerciseKey === exerciseKey)
    .first()
  if (existing?.id != null) {
    await db.rowLogs.update(existing.id, data)
  } else {
    await db.rowLogs.add({
      date, planMode, exerciseKey,
      useAlt: false, setsDone: '', repsDone: '', weightKg: '',
      completed: false, notes: '',
      ...data,
    })
  }
}

// ─── Meal log helpers ─────────────────────────────────────────────────────────

export async function upsertMealLog(
  date: string,
  planMode: TrainingMode,
  mealIndex: number,
  data: Partial<Pick<MealLog, 'completed' | 'notes'>>,
): Promise<void> {
  const existing = await db.mealLogs
    .where('date').equals(date)
    .filter(l => l.mealIndex === mealIndex)
    .first()
  if (existing?.id != null) {
    await db.mealLogs.update(existing.id, data)
  } else {
    await db.mealLogs.add({
      date, planMode, mealIndex,
      completed: false, notes: '',
      ...data,
    })
  }
}

// ─── Backup helpers ───────────────────────────────────────────────────────────

/** Atomically wipe all tables — used before import. */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear()
    }
  })
}

/** Fetch every table's data for backup. */
export async function getAllData() {
  const [settings, workoutSessions, exerciseLogs, stepsLogs, bodyLogs, nutritionLogs, rowLogs, mealLogs] =
    await Promise.all([
      db.settings.toArray(),
      db.workoutSessions.toArray(),
      db.exerciseLogs.toArray(),
      db.stepsLogs.toArray(),
      db.bodyLogs.toArray(),
      db.nutritionLogs.toArray(),
      db.rowLogs.toArray(),
      db.mealLogs.toArray(),
    ])
  return { settings, workoutSessions, exerciseLogs, stepsLogs, bodyLogs, nutritionLogs, rowLogs, mealLogs }
}
