// ═══════════════════════════════════════════════════════════════════
//  PRIMITIVES
// ═══════════════════════════════════════════════════════════════════

export type TrainingMode   = 'normal' | 'ramadan'
export type WeightUnit     = 'kg' | 'lbs'
export type WaistUnit      = 'cm' | 'in'
export type DayOfWeek      = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export type SessionType =
  | 'push'
  | 'pull'
  | 'legs'
  | 'upper'        // condensed push+pull (Ramadan / Upper-Lower split)
  | 'lower'        // condensed legs
  | 'full-body'
  | 'cardio'       // cardio + core day
  | 'steps'
  | 'rest'

export type ExerciseCategory = 'compound' | 'isolation' | 'cardio' | 'bodyweight'

export type MuscleGroup =
  | 'chest'
  | 'upper-back'
  | 'lats'
  | 'rear-delts'
  | 'front-delts'
  | 'side-delts'
  | 'biceps'
  | 'brachialis'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'hip-flexors'
  | 'traps'
  | 'erectors'

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'resistance-band'
  | 'ez-bar'

export type SessionStatus = 'in-progress' | 'completed' | 'skipped'
export type MoodRating    = 'great' | 'good' | 'neutral' | 'tired' | 'bad'
export type LogSource     = 'manual' | 'health-api'
export type TimeOfDay     = 'morning' | 'afternoon' | 'evening'

export type MealContext =
  | 'standard'
  | 'pre-workout'
  | 'post-workout'
  | 'suhoor'          // pre-dawn meal — Ramadan
  | 'iftar'           // break-fast meal — Ramadan

// ═══════════════════════════════════════════════════════════════════
//  USER SETTINGS  (single row in DB, id always 1)
// ═══════════════════════════════════════════════════════════════════

export interface UserSettings {
  id?:                  number
  displayName:          string
  mode:                 TrainingMode
  ramadanEndDate:       string          // 'YYYY-MM-DD'
  stepGoalPerDay:       number          // default 10 000
  weightUnit:           WeightUnit      // display only; DB always stores kg
  waistUnit:            WaistUnit       // display only; DB always stores cm
  notificationsEnabled: boolean
  onboardingComplete:   boolean
  createdAt:            string          // ISO timestamp
  updatedAt:            string
  // ── M5: scheduling + reminders (optional; defaults applied via DB v2 upgrade) ──
  gymStartDay?:         DayOfWeek       // which weekday the cycle starts; default 'MON'
  notifyWorkoutTime?:   string          // 'HH:mm'; default '18:00'
  notifyStepsTime?:     string          // 'HH:mm'; default '20:00'
  notifyWeighInDay?:    DayOfWeek       // which weekday triggers weigh-in reminder; default 'MON'
}

// ═══════════════════════════════════════════════════════════════════
//  EXERCISE LIBRARY  (static data — not persisted in DB)
// ═══════════════════════════════════════════════════════════════════

/** Lightweight reference used inside Exercise.replacements */
export interface ExerciseSuggestion {
  exerciseId: string
  reason:     string    // e.g. "Use if: shoulder pain > 3/10"
}

export interface Exercise {
  id:                string            // slug: 'barbell-bench-press'
  name:              string
  category:          ExerciseCategory
  muscles: {
    primary:   MuscleGroup[]
    secondary: MuscleGroup[]
  }
  equipment:         Equipment[]
  videoUrl:          string            // YouTube watch URL
  imageUrl?:         string
  warmupCues:        string[]          // 2–4 short bullet points shown pre-exercise
  formCues:          string[]          // 2–4 technique tips shown during set logging
  contraindications: string[]          // conditions that trigger swap prompt
  replacements:      ExerciseSuggestion[]
  safetyNote?:       string            // shown when painScore > 3
}

// ═══════════════════════════════════════════════════════════════════
//  PROGRAM TEMPLATES  (static data — not persisted in DB)
// ═══════════════════════════════════════════════════════════════════

export interface SetScheme {
  sets:        number
  repsMin:     number
  repsMax:     number
  rirTarget:   number          // reps in reserve; 2 = stop 2 short of failure
  restSeconds: number
}

export interface ProgramExercise {
  exerciseId: string
  setScheme:  SetScheme
  notes?:     string           // coaching note for this slot
}

export interface SessionTemplate {
  id:               string
  name:             string
  type:             SessionType
  gymDay:           boolean
  description:      string
  estimatedMinutes: number
  warmupProtocol:   string     // brief general warm-up shown before session
  exercises:        ProgramExercise[]
}

/** Maps every day-of-week (string key) to a SessionTemplate.id */
export type WeeklySchedule = Record<DayOfWeek, string>

export interface ProgramTemplate {
  id:             string
  name:           string
  mode:           TrainingMode | 'universal'
  description:    string
  weeklySchedule: WeeklySchedule
  sessions:       SessionTemplate[]
  notes?:         string
}

// ═══════════════════════════════════════════════════════════════════
//  WORKOUT SESSION  (persisted in IndexedDB)
// ═══════════════════════════════════════════════════════════════════

export interface WorkoutSession {
  id?:               number
  date:              string          // 'YYYY-MM-DD'
  programId:         string
  sessionTemplateId: string
  sessionName:       string          // snapshot at time of log
  status:            SessionStatus
  startedAt:         number          // ms timestamp
  completedAt?:      number
  durationSeconds?:  number          // derived: completedAt - startedAt
  overallPainScore:  number          // 0–10; > 3 shows safety warning
  perceivedExertion: number          // RPE 1–10
  mood:              MoodRating
  bodyweightKg?:     number          // optional same-day BW snapshot
  notes?:            string
}

// ═══════════════════════════════════════════════════════════════════
//  EXERCISE LOG + SETS  (sets array embedded — no separate set table)
// ═══════════════════════════════════════════════════════════════════

export interface ExerciseSet {
  setNumber:   number
  targetReps:  number          // from program template
  actualReps:  number          // what the user did
  weightKg:    number          // always stored in kg
  rir:         number          // 0–5; 0 = went to failure
  completed:   boolean
  painScore?:  number          // 0–10 per exercise (optional)
  timestamp:   number          // ms; when this set was logged
}

export interface ExerciseLog {
  id?:                 number
  workoutSessionId:    number          // FK → WorkoutSession.id
  exerciseId:          string          // exercise actually performed
  exerciseName:        string          // snapshot
  isReplacement:       boolean
  originalExerciseId?: string          // populated when isReplacement = true
  sets:                ExerciseSet[]   // embedded — no separate table
  notes?:              string
}

// ═══════════════════════════════════════════════════════════════════
//  STEPS LOG  (one row per date; unique date index)
// ═══════════════════════════════════════════════════════════════════

export interface StepsLog {
  id?:       number
  date:      string          // 'YYYY-MM-DD'
  steps:     number
  goalSteps: number          // snapshot of goal on that day
  goalMet:   boolean         // steps >= goalSteps
  source:    LogSource       // 'manual' in v1
  notes?:    string
}

// ═══════════════════════════════════════════════════════════════════
//  BODY LOG  (one row per date; unique date index)
// ═══════════════════════════════════════════════════════════════════

export interface BodyLog {
  id?:             number
  date:            string          // 'YYYY-MM-DD'
  weightKg?:       number
  waistCm?:        number
  bodyFatPercent?: number          // optional / future
  timeOfDay:       TimeOfDay       // 'morning' preferred for consistency
  notes?:          string
}

// ═══════════════════════════════════════════════════════════════════
//  NUTRITION LOG  (one row per date; unique date index)
// ═══════════════════════════════════════════════════════════════════

export interface NutritionLog {
  id?:         number
  date:        string          // 'YYYY-MM-DD'
  calories:    number
  proteinG:    number
  carbsG?:     number
  fatG?:       number
  waterMl?:    number
  mealContext: MealContext
  notes?:      string
}

// ═══════════════════════════════════════════════════════════════════
//  ROW LOG  (per-exercise-row logging — new flat system)
// ═══════════════════════════════════════════════════════════════════

export interface RowLog {
  id?:         number
  date:        string          // 'YYYY-MM-DD'
  planMode:    TrainingMode
  exerciseKey: string          // makeExerciseKey(name)
  useAlt:      boolean
  setsDone:    string          // e.g. '3'
  repsDone:    string          // e.g. '10'
  weightKg:    string          // e.g. '80', '' if not tracked
  completed:   boolean
  notes:       string
}

// ═══════════════════════════════════════════════════════════════════
//  MEAL LOG  (meal adherence per day — new nutrition system)
// ═══════════════════════════════════════════════════════════════════

export interface MealLog {
  id?:       number
  date:      string          // 'YYYY-MM-DD'
  planMode:  TrainingMode
  mealIndex: number          // 0, 1, 2 … matches meals array index for that day
  completed: boolean
  notes:     string
}

// ═══════════════════════════════════════════════════════════════════
//  BACKUP ENVELOPE  (JSON export / import)
// ═══════════════════════════════════════════════════════════════════

export const BACKUP_VERSION = 2 as const

export interface BackupData {
  version:         typeof BACKUP_VERSION
  exportedAt:      string
  appMode:         TrainingMode
  settings:        UserSettings
  workoutSessions: WorkoutSession[]
  exerciseLogs:    ExerciseLog[]
  stepsLogs:       StepsLog[]
  bodyLogs:        BodyLog[]
  nutritionLogs:   NutritionLog[]
  rowLogs:         RowLog[]
  mealLogs:        MealLog[]
}

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD HELPERS  (pure computed, never stored)
// ═══════════════════════════════════════════════════════════════════

export interface WeeklyAdherence {
  weekStart:    string
  gymScheduled: number
  gymCompleted: number
  stepDays:     number
  stepGoalMet:  number
  percentage:   number
}

export interface Streak {
  current:          number
  longest:          number
  lastActivityDate: string | null
}

export interface TrendPoint {
  date:  string
  value: number
}
