import type { TrainingMode } from '../types'

// ─── Core types ───────────────────────────────────────────────────────────────

export interface ProgramRow {
  day:          string   // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  part:         string   // 'Warm-up', 'Upper A', 'Lower A', 'Steps', etc.
  exercise:     string   // Main exercise name
  url:          string   // YouTube search URL for main exercise
  sets:         string   // '3', '2–3', '—' for timed, '' for cardio
  reps:         string   // '8–12', '20–40 min', '5 min', etc.
  altExercise?: string   // Alternative exercise name (separate field)
  altUrl?:      string   // YouTube URL for alt exercise
  kcalMin?:     number   // Estimated kcal burned (total, all sets) — min end
  kcalMax?:     number   // Estimated kcal burned (total, all sets) — max end
}

export interface MealItem {
  meal:     string   // 'Iftar (Maghrib)', 'Snack', 'Suhoor', 'Meal 1 (12:00)', etc.
  items:    string   // Human-readable food description
  kcalMin?: number   // Estimated kcal — min
  kcalMax?: number   // Estimated kcal — max
}

export interface NutritionDay {
  day:   string       // 'Mon' … 'Sun'
  meals: MealItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise exercise name to a stable storage key. */
export function makeExerciseKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export interface ParsedExercise {
  main: { name: string; key: string; url: string }
  alt?: { name: string; key: string; url: string }
}

/** Extract main and optional alt exercise from a ProgramRow. */
export function parseExercise(row: ProgramRow): ParsedExercise {
  const result: ParsedExercise = {
    main: { name: row.exercise, key: makeExerciseKey(row.exercise), url: row.url },
  }
  if (row.altExercise) {
    result.alt = {
      name: row.altExercise,
      key:  makeExerciseKey(row.altExercise),
      url:  row.altUrl ?? `https://www.youtube.com/results?search_query=${encodeURIComponent(row.altExercise)}`,
    }
  }
  return result
}

/** Returns true when a row has structured sets/reps (i.e. is a weight-training exercise). */
export function isLoggableRow(row: ProgramRow): boolean {
  return row.sets !== '' && row.sets !== '—' && row.reps !== ''
}

/** Parse the maximum rep value from a range string like "8–12" → "12", "10" → "10". */
export function parseMaxReps(reps: string): string {
  const match = reps.match(/^(\d+)\s*[–\-]\s*(\d+)$/)
  return match ? match[2] : reps
}

const JS_DAY_SHORT: Record<number, string> = {
  0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat',
}

/** All rows for a specific ISO date in the given plan mode. */
export function getDayRows(mode: TrainingMode, date: string): ProgramRow[] {
  const d   = new Date(`${date}T00:00:00`)
  const day = JS_DAY_SHORT[d.getDay()]
  const src = mode === 'ramadan' ? RAMADAN_WORKOUT : NORMAL_WORKOUT
  return src.filter(r => r.day === day)
}

/** All rows for the week in the given plan mode. */
export function getWeekRows(mode: TrainingMode): ProgramRow[] {
  return mode === 'ramadan' ? RAMADAN_WORKOUT : NORMAL_WORKOUT
}

/** Today's meal plan for the given mode. */
export function getDayMeals(mode: TrainingMode, date: string): MealItem[] {
  const d   = new Date(`${date}T00:00:00`)
  const day = JS_DAY_SHORT[d.getDay()]
  const src = mode === 'ramadan' ? RAMADAN_NUTRITION : NORMAL_NUTRITION
  return src.find(n => n.day === day)?.meals ?? []
}

/** Full week meal plan for the given mode. */
export function getWeekMeals(mode: TrainingMode): NutritionDay[] {
  return mode === 'ramadan' ? RAMADAN_NUTRITION : NORMAL_NUTRITION
}

// ─── Ramadan workout ──────────────────────────────────────────────────────────
// Calorie estimates assume 104 kg bodyweight (MET × weight × time or sets × kcal/set).

const RAMADAN_WORKOUT: ProgramRow[] = [
  // ── Monday: Warm-up + Upper A ──
  { day: 'Mon', part: 'Warm-up', exercise: 'Bike or Elliptical (easy)',        url: 'https://www.youtube.com/results?search_query=Bike+or+Elliptical+easy+cardio',                    sets: '—',   reps: '5 min',      kcalMin: 36,  kcalMax: 64  },
  { day: 'Mon', part: 'Warm-up', exercise: 'Bird-dog',                          url: 'https://www.youtube.com/results?search_query=Bird-dog+exercise+tutorial+proper+form',              sets: '2',   reps: '8/side',     kcalMin: 3,   kcalMax: 12  },
  { day: 'Mon', part: 'Warm-up', exercise: 'Dead bug',                          url: 'https://www.youtube.com/results?search_query=Dead+bug+exercise+tutorial+proper+form',              sets: '2',   reps: '8/side',     kcalMin: 3,   kcalMax: 12  },
  { day: 'Mon', part: 'Upper A', exercise: 'Machine Chest Press',               url: 'https://www.youtube.com/results?search_query=Machine+Chest+Press+exercise+tutorial',              sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Cable Chest Press',        altUrl: 'https://www.youtube.com/results?search_query=Cable+Chest+Press+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Lat Pulldown (neutral grip)',       url: 'https://www.youtube.com/results?search_query=Lat+Pulldown+neutral+grip+exercise+tutorial',        sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Straight-arm Pulldown',    altUrl: 'https://www.youtube.com/results?search_query=Straight-arm+Pulldown+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Seated Cable Row',                  url: 'https://www.youtube.com/results?search_query=Seated+Cable+Row+exercise+tutorial',                sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Chest-Supported Row',      altUrl: 'https://www.youtube.com/results?search_query=Chest-Supported+Row+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Machine Shoulder Press',            url: 'https://www.youtube.com/results?search_query=Machine+Shoulder+Press+exercise+tutorial',          sets: '2–3', reps: '8–12',       kcalMin: 3,   kcalMax: 26,  altExercise: 'Landmine Press',           altUrl: 'https://www.youtube.com/results?search_query=Landmine+Press+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Machine/Cable Lateral Raise',       url: 'https://www.youtube.com/results?search_query=Machine+Cable+Lateral+Raise+exercise+tutorial',    sets: '2',   reps: '12–15',      kcalMin: 5,   kcalMax: 22,  altExercise: 'Cable Lateral Raise',      altUrl: 'https://www.youtube.com/results?search_query=Cable+Lateral+Raise+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Triceps Pushdown',                  url: 'https://www.youtube.com/results?search_query=Triceps+Pushdown+exercise+tutorial',                sets: '2',   reps: '10–15',      kcalMin: 4,   kcalMax: 22,  altExercise: 'Rope Pushdown',            altUrl: 'https://www.youtube.com/results?search_query=Rope+Pushdown+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Hammer Curl',                       url: 'https://www.youtube.com/results?search_query=Hammer+Curl+exercise+tutorial',                    sets: '2',   reps: '10–15',      kcalMin: 4,   kcalMax: 22  },

  // ── Tuesday: Warm-up + Lower A ──
  { day: 'Tue', part: 'Warm-up', exercise: 'Bike (easy)',                       url: 'https://www.youtube.com/results?search_query=Stationary+bike+easy+warm+up',                     sets: '—',   reps: '5 min',      kcalMin: 36,  kcalMax: 64  },
  { day: 'Tue', part: 'Warm-up', exercise: 'Pallof Press (light)',              url: 'https://www.youtube.com/results?search_query=Pallof+Press+exercise+tutorial',                   sets: '2',   reps: '10/side',    kcalMin: 4,   kcalMax: 15  },
  { day: 'Tue', part: 'Lower A', exercise: 'Leg Press',                         url: 'https://www.youtube.com/results?search_query=Leg+Press+exercise+tutorial',                      sets: '4',   reps: '10–15',      kcalMin: 8,   kcalMax: 44  },
  { day: 'Tue', part: 'Lower A', exercise: 'Seated Leg Curl',                   url: 'https://www.youtube.com/results?search_query=Seated+Leg+Curl+exercise+tutorial',                sets: '3',   reps: '10–15',      kcalMin: 6,   kcalMax: 33,  altExercise: 'Lying Leg Curl',           altUrl: 'https://www.youtube.com/results?search_query=Lying+Leg+Curl+exercise+tutorial' },
  { day: 'Tue', part: 'Lower A', exercise: 'Leg Extension',                     url: 'https://www.youtube.com/results?search_query=Leg+Extension+exercise+tutorial',                  sets: '3',   reps: '12–15',      kcalMin: 8,   kcalMax: 33,  altExercise: 'Reverse Sled Drag',        altUrl: 'https://www.youtube.com/results?search_query=Reverse+Sled+Drag+exercise+tutorial' },
  { day: 'Tue', part: 'Lower A', exercise: 'Hip Abduction Machine',             url: 'https://www.youtube.com/results?search_query=Hip+Abduction+Machine+exercise+tutorial',          sets: '3',   reps: '12–20',      kcalMin: 8,   kcalMax: 44,  altExercise: 'Cable Hip Abduction',      altUrl: 'https://www.youtube.com/results?search_query=Cable+Hip+Abduction+exercise+tutorial' },
  { day: 'Tue', part: 'Lower A', exercise: 'Calf Raise',                        url: 'https://www.youtube.com/results?search_query=Calf+Raise+seated+standing+exercise+tutorial',     sets: '3',   reps: '10–15',      kcalMin: 6,   kcalMax: 33,  altExercise: 'Leg Press Calf Raise',     altUrl: 'https://www.youtube.com/results?search_query=Leg+Press+Calf+Raise+exercise+tutorial' },
  { day: 'Tue', part: 'Lower A', exercise: 'Pallof Press',                      url: 'https://www.youtube.com/results?search_query=Pallof+Press+core+exercise+tutorial',              sets: '3',   reps: '10/side',    kcalMin: 6,   kcalMax: 22,  altExercise: 'Side Plank',               altUrl: 'https://www.youtube.com/results?search_query=Side+Plank+exercise+tutorial' },

  // ── Wednesday: Steps / Cardio ──
  { day: 'Wed', part: 'Steps / Cardio', exercise: 'Brisk Walk',                 url: 'https://www.youtube.com/results?search_query=Brisk+Walk+outdoors+treadmill+tutorial',           sets: '—',   reps: '20–40 min',  kcalMin: 146, kcalMax: 255 },

  // ── Thursday: Warm-up + Upper B ──
  { day: 'Thu', part: 'Warm-up', exercise: 'Rower or Bike (easy)',              url: 'https://www.youtube.com/results?search_query=Rowing+machine+bike+easy+warm+up',                 sets: '—',   reps: '5 min',      kcalMin: 36,  kcalMax: 64  },
  { day: 'Thu', part: 'Warm-up', exercise: 'Face Pull (light)',                 url: 'https://www.youtube.com/results?search_query=Face+Pull+exercise+tutorial',                      sets: '2',   reps: '15',         kcalMin: 6,   kcalMax: 22  },
  { day: 'Thu', part: 'Upper B', exercise: 'Incline Machine Chest Press',       url: 'https://www.youtube.com/results?search_query=Incline+Machine+Chest+Press+exercise+tutorial',   sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Machine Chest Press',      altUrl: 'https://www.youtube.com/results?search_query=Machine+Chest+Press+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Chest-Supported Row',               url: 'https://www.youtube.com/results?search_query=Chest-Supported+Row+exercise+tutorial',            sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Seated Cable Row',         altUrl: 'https://www.youtube.com/results?search_query=Seated+Cable+Row+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Lat Pulldown',                      url: 'https://www.youtube.com/results?search_query=Lat+Pulldown+exercise+tutorial',                   sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Assisted Pull-up Machine', altUrl: 'https://www.youtube.com/results?search_query=Assisted+Pull-up+Machine+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Face Pull',                         url: 'https://www.youtube.com/results?search_query=Face+Pull+exercise+tutorial+rear+delts',           sets: '2',   reps: '12–20',      kcalMin: 5,   kcalMax: 29,  altExercise: 'Rear Delt Machine',        altUrl: 'https://www.youtube.com/results?search_query=Rear+Delt+Machine+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Machine/Cable Lateral Raise',       url: 'https://www.youtube.com/results?search_query=Machine+Cable+Lateral+Raise+exercise+tutorial',   sets: '2',   reps: '12–15',      kcalMin: 5,   kcalMax: 22,  altExercise: 'Cable Lateral Raise',      altUrl: 'https://www.youtube.com/results?search_query=Cable+Lateral+Raise+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Overhead Cable Triceps Extension',  url: 'https://www.youtube.com/results?search_query=Overhead+Cable+Triceps+Extension+tutorial',       sets: '2',   reps: '10–15',      kcalMin: 4,   kcalMax: 22,  altExercise: 'Triceps Pushdown',         altUrl: 'https://www.youtube.com/results?search_query=Triceps+Pushdown+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Cable Curl',                        url: 'https://www.youtube.com/results?search_query=Cable+Curl+exercise+tutorial',                    sets: '2',   reps: '10–15',      kcalMin: 4,   kcalMax: 22  },

  // ── Friday: Steps / Cardio ──
  { day: 'Fri', part: 'Steps / Cardio', exercise: 'Brisk Walk',                 url: 'https://www.youtube.com/results?search_query=Brisk+Walk+outdoors+treadmill+tutorial',           sets: '—',   reps: '20–40 min',  kcalMin: 146, kcalMax: 255 },

  // ── Saturday: Warm-up + Lower B ──
  { day: 'Sat', part: 'Warm-up', exercise: 'Bike (easy)',                       url: 'https://www.youtube.com/results?search_query=Stationary+bike+easy+warm+up',                     sets: '—',   reps: '5 min',      kcalMin: 36,  kcalMax: 64  },
  { day: 'Sat', part: 'Warm-up', exercise: 'Dead bug',                          url: 'https://www.youtube.com/results?search_query=Dead+bug+exercise+tutorial+proper+form',           sets: '2',   reps: '8/side',     kcalMin: 3,   kcalMax: 12  },
  { day: 'Sat', part: 'Lower B', exercise: 'Leg Press (heavier)',               url: 'https://www.youtube.com/results?search_query=Leg+Press+exercise+tutorial',                      sets: '4',   reps: '8–12',       kcalMin: 7,   kcalMax: 35,  altExercise: 'Hack Squat Machine',       altUrl: 'https://www.youtube.com/results?search_query=Hack+Squat+Machine+exercise+tutorial' },
  { day: 'Sat', part: 'Lower B', exercise: 'Seated Leg Curl',                   url: 'https://www.youtube.com/results?search_query=Seated+Leg+Curl+exercise+tutorial',                sets: '3',   reps: '10–15',      kcalMin: 6,   kcalMax: 33,  altExercise: 'Lying Leg Curl',           altUrl: 'https://www.youtube.com/results?search_query=Lying+Leg+Curl+exercise+tutorial' },
  { day: 'Sat', part: 'Lower B', exercise: 'Leg Extension',                     url: 'https://www.youtube.com/results?search_query=Leg+Extension+exercise+tutorial',                  sets: '3',   reps: '12–15',      kcalMin: 8,   kcalMax: 33  },
  { day: 'Sat', part: 'Lower B', exercise: 'Hip Abduction Machine',             url: 'https://www.youtube.com/results?search_query=Hip+Abduction+Machine+exercise+tutorial',          sets: '3',   reps: '12–20',      kcalMin: 8,   kcalMax: 44,  altExercise: 'Cable Hip Abduction',      altUrl: 'https://www.youtube.com/results?search_query=Cable+Hip+Abduction+exercise+tutorial' },
  { day: 'Sat', part: 'Lower B', exercise: 'Calf Raise',                        url: 'https://www.youtube.com/results?search_query=Calf+Raise+seated+standing+exercise+tutorial',     sets: '3',   reps: '10–15',      kcalMin: 6,   kcalMax: 33,  altExercise: 'Leg Press Calf Raise',     altUrl: 'https://www.youtube.com/results?search_query=Leg+Press+Calf+Raise+exercise+tutorial' },
  { day: 'Sat', part: 'Lower B', exercise: 'Side Plank',                        url: 'https://www.youtube.com/results?search_query=Side+Plank+exercise+tutorial',                     sets: '3',   reps: '20–40s/side', kcalMin: 13, kcalMax: 87,  altExercise: 'Pallof Press',             altUrl: 'https://www.youtube.com/results?search_query=Pallof+Press+exercise+tutorial' },

  // ── Sunday: Steps / Recovery ──
  { day: 'Sun', part: 'Steps / Recovery', exercise: 'Easy Walk + light mobility', url: 'https://www.youtube.com/results?search_query=Easy+walk+mobility+exercise+recovery',          sets: '—',   reps: '30–60 min',  kcalMin: 218, kcalMax: 382 },
]

// ─── Normal workout ───────────────────────────────────────────────────────────
// Same split as Ramadan (Upper/Lower — 3×/week); differences:
//   – Tue: Side Plank (alt Pallof Press) instead of Pallof Press (alt Side Plank)
//   – Thu: Rear Delt Machine (alt Face Pull) instead of Face Pull (alt Rear Delt Machine)
//   – Wed/Fri cardio: 30–45 min instead of 20–40 min

const NORMAL_WORKOUT: ProgramRow[] = [
  // ── Monday: Warm-up + Upper A ──
  { day: 'Mon', part: 'Warm-up', exercise: 'Bike or Elliptical (easy)',        url: 'https://www.youtube.com/results?search_query=Bike+or+Elliptical+easy+cardio',                    sets: '—',   reps: '5 min',      kcalMin: 36,  kcalMax: 64  },
  { day: 'Mon', part: 'Warm-up', exercise: 'Bird-dog',                          url: 'https://www.youtube.com/results?search_query=Bird-dog+exercise+tutorial+proper+form',            sets: '2',   reps: '8/side',     kcalMin: 3,   kcalMax: 12  },
  { day: 'Mon', part: 'Warm-up', exercise: 'Dead bug',                          url: 'https://www.youtube.com/results?search_query=Dead+bug+exercise+tutorial+proper+form',            sets: '2',   reps: '8/side',     kcalMin: 3,   kcalMax: 12  },
  { day: 'Mon', part: 'Upper A', exercise: 'Machine Chest Press',               url: 'https://www.youtube.com/results?search_query=Machine+Chest+Press+exercise+tutorial',            sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Cable Chest Press',        altUrl: 'https://www.youtube.com/results?search_query=Cable+Chest+Press+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Lat Pulldown (neutral grip)',       url: 'https://www.youtube.com/results?search_query=Lat+Pulldown+neutral+grip+exercise+tutorial',      sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Straight-arm Pulldown',    altUrl: 'https://www.youtube.com/results?search_query=Straight-arm+Pulldown+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Seated Cable Row',                  url: 'https://www.youtube.com/results?search_query=Seated+Cable+Row+exercise+tutorial',              sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Chest-Supported Row',      altUrl: 'https://www.youtube.com/results?search_query=Chest-Supported+Row+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Machine Shoulder Press',            url: 'https://www.youtube.com/results?search_query=Machine+Shoulder+Press+exercise+tutorial',        sets: '2–3', reps: '8–12',       kcalMin: 3,   kcalMax: 26,  altExercise: 'Landmine Press',           altUrl: 'https://www.youtube.com/results?search_query=Landmine+Press+exercise+tutorial' },
  { day: 'Mon', part: 'Upper A', exercise: 'Machine/Cable Lateral Raise',       url: 'https://www.youtube.com/results?search_query=Machine+Cable+Lateral+Raise+exercise+tutorial',  sets: '2',   reps: '12–15',      kcalMin: 5,   kcalMax: 22  },
  { day: 'Mon', part: 'Upper A', exercise: 'Triceps Pushdown',                  url: 'https://www.youtube.com/results?search_query=Triceps+Pushdown+exercise+tutorial',              sets: '2',   reps: '10–15',      kcalMin: 4,   kcalMax: 22  },
  { day: 'Mon', part: 'Upper A', exercise: 'Hammer Curl',                       url: 'https://www.youtube.com/results?search_query=Hammer+Curl+exercise+tutorial',                  sets: '2',   reps: '10–15',      kcalMin: 4,   kcalMax: 22  },

  // ── Tuesday: Warm-up + Lower A ──
  { day: 'Tue', part: 'Warm-up', exercise: 'Bike (easy)',                       url: 'https://www.youtube.com/results?search_query=Stationary+bike+easy+warm+up',                   sets: '—',   reps: '5 min',      kcalMin: 36,  kcalMax: 64  },
  { day: 'Tue', part: 'Warm-up', exercise: 'Pallof Press (light)',              url: 'https://www.youtube.com/results?search_query=Pallof+Press+exercise+tutorial',                 sets: '2',   reps: '10/side',    kcalMin: 4,   kcalMax: 15  },
  { day: 'Tue', part: 'Lower A', exercise: 'Leg Press',                         url: 'https://www.youtube.com/results?search_query=Leg+Press+exercise+tutorial',                    sets: '4',   reps: '10–15',      kcalMin: 8,   kcalMax: 44  },
  { day: 'Tue', part: 'Lower A', exercise: 'Seated Leg Curl',                   url: 'https://www.youtube.com/results?search_query=Seated+Leg+Curl+exercise+tutorial',              sets: '3',   reps: '10–15',      kcalMin: 6,   kcalMax: 33  },
  { day: 'Tue', part: 'Lower A', exercise: 'Leg Extension',                     url: 'https://www.youtube.com/results?search_query=Leg+Extension+exercise+tutorial',                sets: '3',   reps: '12–15',      kcalMin: 8,   kcalMax: 33,  altExercise: 'Reverse Sled Drag',        altUrl: 'https://www.youtube.com/results?search_query=Reverse+Sled+Drag+exercise+tutorial' },
  { day: 'Tue', part: 'Lower A', exercise: 'Hip Abduction Machine',             url: 'https://www.youtube.com/results?search_query=Hip+Abduction+Machine+exercise+tutorial',        sets: '3',   reps: '12–20',      kcalMin: 8,   kcalMax: 44  },
  { day: 'Tue', part: 'Lower A', exercise: 'Calf Raise',                        url: 'https://www.youtube.com/results?search_query=Calf+Raise+seated+standing+exercise+tutorial',   sets: '3',   reps: '10–15',      kcalMin: 6,   kcalMax: 33  },
  { day: 'Tue', part: 'Lower A', exercise: 'Side Plank',                        url: 'https://www.youtube.com/results?search_query=Side+Plank+exercise+tutorial',                   sets: '3',   reps: '20–40s/side', kcalMin: 13, kcalMax: 87,  altExercise: 'Pallof Press',             altUrl: 'https://www.youtube.com/results?search_query=Pallof+Press+exercise+tutorial' },

  // ── Wednesday: Steps / Cardio (longer than Ramadan) ──
  { day: 'Wed', part: 'Steps / Cardio', exercise: 'Brisk Walk',                 url: 'https://www.youtube.com/results?search_query=Brisk+Walk+outdoors+treadmill+tutorial',         sets: '—',   reps: '30–45 min',  kcalMin: 218, kcalMax: 382 },

  // ── Thursday: Warm-up + Upper B ──
  { day: 'Thu', part: 'Warm-up', exercise: 'Rower or Bike (easy)',              url: 'https://www.youtube.com/results?search_query=Rowing+machine+bike+easy+warm+up',               sets: '—',   reps: '5 min',      kcalMin: 36,  kcalMax: 64  },
  { day: 'Thu', part: 'Warm-up', exercise: 'Face Pull (light)',                 url: 'https://www.youtube.com/results?search_query=Face+Pull+exercise+tutorial',                    sets: '2',   reps: '15',         kcalMin: 6,   kcalMax: 22  },
  { day: 'Thu', part: 'Upper B', exercise: 'Incline Machine Chest Press',       url: 'https://www.youtube.com/results?search_query=Incline+Machine+Chest+Press+exercise+tutorial', sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Machine Chest Press',      altUrl: 'https://www.youtube.com/results?search_query=Machine+Chest+Press+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Chest-Supported Row',               url: 'https://www.youtube.com/results?search_query=Chest-Supported+Row+exercise+tutorial',          sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Seated Cable Row',         altUrl: 'https://www.youtube.com/results?search_query=Seated+Cable+Row+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Lat Pulldown',                      url: 'https://www.youtube.com/results?search_query=Lat+Pulldown+exercise+tutorial',                 sets: '3',   reps: '8–12',       kcalMin: 5,   kcalMax: 26,  altExercise: 'Assisted Pull-up Machine', altUrl: 'https://www.youtube.com/results?search_query=Assisted+Pull-up+Machine+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Rear Delt Machine',                 url: 'https://www.youtube.com/results?search_query=Rear+Delt+Machine+exercise+tutorial',            sets: '2',   reps: '12–20',      kcalMin: 5,   kcalMax: 29,  altExercise: 'Face Pull',                altUrl: 'https://www.youtube.com/results?search_query=Face+Pull+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Machine/Cable Lateral Raise',       url: 'https://www.youtube.com/results?search_query=Machine+Cable+Lateral+Raise+exercise+tutorial', sets: '2',   reps: '12–15',      kcalMin: 5,   kcalMax: 22  },
  { day: 'Thu', part: 'Upper B', exercise: 'Overhead Cable Triceps Extension',  url: 'https://www.youtube.com/results?search_query=Overhead+Cable+Triceps+Extension+tutorial',     sets: '2',   reps: '10–15',      kcalMin: 4,   kcalMax: 22,  altExercise: 'Triceps Pushdown',         altUrl: 'https://www.youtube.com/results?search_query=Triceps+Pushdown+exercise+tutorial' },
  { day: 'Thu', part: 'Upper B', exercise: 'Cable Curl',                        url: 'https://www.youtube.com/results?search_query=Cable+Curl+exercise+tutorial',                  sets: '2',   reps: '10–15',      kcalMin: 4,   kcalMax: 22  },

  // ── Friday: Steps / Cardio ──
  { day: 'Fri', part: 'Steps / Cardio', exercise: 'Brisk Walk',                 url: 'https://www.youtube.com/results?search_query=Brisk+Walk+outdoors+treadmill+tutorial',         sets: '—',   reps: '30–45 min',  kcalMin: 218, kcalMax: 382 },

  // ── Saturday: Warm-up + Lower B ──
  { day: 'Sat', part: 'Warm-up', exercise: 'Bike (easy)',                       url: 'https://www.youtube.com/results?search_query=Stationary+bike+easy+warm+up',                   sets: '—',   reps: '5 min',      kcalMin: 36,  kcalMax: 64  },
  { day: 'Sat', part: 'Warm-up', exercise: 'Dead bug',                          url: 'https://www.youtube.com/results?search_query=Dead+bug+exercise+tutorial+proper+form',         sets: '2',   reps: '8/side',     kcalMin: 3,   kcalMax: 12  },
  { day: 'Sat', part: 'Lower B', exercise: 'Leg Press (heavier)',               url: 'https://www.youtube.com/results?search_query=Leg+Press+exercise+tutorial',                    sets: '4',   reps: '8–12',       kcalMin: 7,   kcalMax: 35,  altExercise: 'Hack Squat Machine',       altUrl: 'https://www.youtube.com/results?search_query=Hack+Squat+Machine+exercise+tutorial' },
  { day: 'Sat', part: 'Lower B', exercise: 'Seated Leg Curl',                   url: 'https://www.youtube.com/results?search_query=Seated+Leg+Curl+exercise+tutorial',              sets: '3',   reps: '10–15',      kcalMin: 6,   kcalMax: 33,  altExercise: 'Lying Leg Curl',           altUrl: 'https://www.youtube.com/results?search_query=Lying+Leg+Curl+exercise+tutorial' },
  { day: 'Sat', part: 'Lower B', exercise: 'Leg Extension',                     url: 'https://www.youtube.com/results?search_query=Leg+Extension+exercise+tutorial',                sets: '3',   reps: '12–15',      kcalMin: 8,   kcalMax: 33  },
  { day: 'Sat', part: 'Lower B', exercise: 'Hip Abduction Machine',             url: 'https://www.youtube.com/results?search_query=Hip+Abduction+Machine+exercise+tutorial',        sets: '3',   reps: '12–20',      kcalMin: 8,   kcalMax: 44,  altExercise: 'Cable Hip Abduction',      altUrl: 'https://www.youtube.com/results?search_query=Cable+Hip+Abduction+exercise+tutorial' },
  { day: 'Sat', part: 'Lower B', exercise: 'Calf Raise',                        url: 'https://www.youtube.com/results?search_query=Calf+Raise+seated+standing+exercise+tutorial',   sets: '3',   reps: '10–15',      kcalMin: 6,   kcalMax: 33,  altExercise: 'Leg Press Calf Raise',     altUrl: 'https://www.youtube.com/results?search_query=Leg+Press+Calf+Raise+exercise+tutorial' },
  { day: 'Sat', part: 'Lower B', exercise: 'Side Plank',                        url: 'https://www.youtube.com/results?search_query=Side+Plank+exercise+tutorial',                   sets: '3',   reps: '20–40s/side', kcalMin: 13, kcalMax: 87,  altExercise: 'Pallof Press',             altUrl: 'https://www.youtube.com/results?search_query=Pallof+Press+exercise+tutorial' },

  // ── Sunday: Steps / Recovery ──
  { day: 'Sun', part: 'Steps / Recovery', exercise: 'Easy Walk + light mobility', url: 'https://www.youtube.com/results?search_query=Easy+walk+mobility+exercise+recovery',        sets: '—',   reps: '30–60 min',  kcalMin: 218, kcalMax: 382 },
]

// ─── Ramadan nutrition ────────────────────────────────────────────────────────
// Calorie estimates from standard hand-portion library (±15–25% real-world error).

const RAMADAN_NUTRITION: NutritionDay[] = [
  { day: 'Mon', meals: [
    { meal: 'Iftar (Maghrib)', items: '2 dates + water + harira (1 bowl) · Grilled chicken or turkey + big salad + rice (1 cupped hand)',                 kcalMin: 400, kcalMax: 430 },
    { meal: 'Snack',           items: '1 fruit (banana/orange) + handful nuts · OR 2 boiled eggs',                                                        kcalMin: 144, kcalMax: 270 },
    { meal: 'Suhoor',          items: '3–4 eggs + oats or whole-grain bread (1 cupped hand) + cucumber/tomato + olive oil (1 tbsp)',                       kcalMin: 360, kcalMax: 438 },
  ]},
  { day: 'Tue', meals: [
    { meal: 'Iftar (Maghrib)', items: '2 dates + water · Kefta (lean beef) + roasted veggies + potatoes or rice (1 cupped hand)',                         kcalMin: 400, kcalMax: 512 },
    { meal: 'Snack',           items: 'Tuna/sardines (1 can) + fruit',                                                                                    kcalMin: 260, kcalMax: 260 },
    { meal: 'Suhoor',          items: 'Chicken breast or beef leftovers + bread (1 cupped hand) + salad',                                                 kcalMin: 200, kcalMax: 500 },
  ]},
  { day: 'Wed', meals: [
    { meal: 'Iftar (Maghrib)', items: '1–2 dates + water + soup (small) · Salmon + big salad + lentils (1 cupped hand)',                                  kcalMin: 575, kcalMax: 600 },
    { meal: 'Snack',           items: 'Fruit + nuts · OR eggs',                                                                                           kcalMin: 72,  kcalMax: 270 },
    { meal: 'Suhoor',          items: '3 eggs + olive oil + veggies + small bread (½–1 cupped hand)',                                                     kcalMin: 488, kcalMax: 568 },
  ]},
  { day: 'Thu', meals: [
    { meal: 'Iftar (Maghrib)', items: '2 dates + water · Chicken tagine (olives + veggies) + rice (1 cupped hand)',                                       kcalMin: 400, kcalMax: 400 },
    { meal: 'Snack',           items: 'Sardines or tuna + fruit · OR 2 eggs',                                                                             kcalMin: 144, kcalMax: 320 },
    { meal: 'Suhoor',          items: 'Beef/kefta + salad + oats or bread (1 cupped hand)',                                                               kcalMin: 160, kcalMax: 490 },
  ]},
  { day: 'Fri', meals: [
    { meal: 'Iftar (Maghrib)', items: '1–2 dates + water · Fish (salmon/sardines/tuna) + salad + rice (1 cupped hand)',                                   kcalMin: 485, kcalMax: 510 },
    { meal: 'Snack',           items: 'Fruit + nuts · OR eggs',                                                                                           kcalMin: 72,  kcalMax: 270 },
    { meal: 'Suhoor',          items: '3–4 eggs + bread (½–1 cupped hand) + veggies',                                                                    kcalMin: 368, kcalMax: 520 },
  ]},
  { day: 'Sat', meals: [
    { meal: 'Iftar (Maghrib)', items: '2 dates + water + soup (small) · Grilled chicken + salad + potatoes/rice (1–2 cupped hands)',                      kcalMin: 580, kcalMax: 730 },
    { meal: 'Snack',           items: 'Tuna/sardines + fruit',                                                                                            kcalMin: 320, kcalMax: 320 },
    { meal: 'Suhoor',          items: 'Chicken/beef + oats or bread (1 cupped hand) + veggies + olive oil',                                              kcalMin: 350, kcalMax: 352 },
  ]},
  { day: 'Sun', meals: [
    { meal: 'Iftar (Maghrib)', items: '1–2 dates + water · Kefta or chicken + big salad + cooked veggies · Optional: ½ cupped hand carbs',               kcalMin: 285, kcalMax: 430 },
    { meal: 'Snack',           items: 'Fruit · OR nuts (pick one)',                                                                                       kcalMin: 90,  kcalMax: 180 },
    { meal: 'Suhoor',          items: '3 eggs + salad + small bread (½ cupped hand, optional)',                                                           kcalMin: 160, kcalMax: 376 },
  ]},
]

// ─── Normal nutrition ─────────────────────────────────────────────────────────

const NORMAL_NUTRITION: NutritionDay[] = [
  { day: 'Mon', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Grilled chicken + big salad + rice (1–2 cupped hands)',                                                            kcalMin: 430, kcalMax: 580 },
    { meal: 'Snack',           items: 'Fruit (banana/orange) + nuts (small handful) · OR 2 boiled eggs',                                                  kcalMin: 144, kcalMax: 270 },
    { meal: 'Dinner (18:00)', items: 'Kefta (lean beef) + cooked vegetables + potatoes (1 cupped hand)',                                                  kcalMin: 390, kcalMax: 390 },
  ]},
  { day: 'Tue', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Tuna/sardines + salad + bread (½–1 cupped hand)',                                                                  kcalMin: 390, kcalMax: 470 },
    { meal: 'Snack',           items: 'Fruit · OR nuts (pick one)',                                                                                       kcalMin: 90,  kcalMax: 180 },
    { meal: 'Dinner (18:00)', items: 'Salmon + big salad + optional rice (½–1 cupped hand)',                                                              kcalMin: 385, kcalMax: 460 },
  ]},
  { day: 'Wed', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Chicken tagine (olives + veg) + rice (1–2 cupped hands)',                                                          kcalMin: 350, kcalMax: 500 },
    { meal: 'Snack',           items: '2 eggs + fruit',                                                                                                   kcalMin: 234, kcalMax: 234 },
    { meal: 'Dinner (18:00)', items: 'Beef + roasted vegetables + bread (½–1 cupped hand)',                                                               kcalMin: 340, kcalMax: 420 },
  ]},
  { day: 'Thu', meals: [
    { meal: 'Meal 1 (12:00)',  items: '3–4 eggs + salad + olive oil · No bread or ½ cupped hand max (rest/low-carb day)',                                 kcalMin: 416, kcalMax: 488 },
    { meal: 'Snack',           items: 'Fruit',                                                                                                            kcalMin: 90,  kcalMax: 90  },
    { meal: 'Dinner (18:00)', items: 'Chicken + big salad + cooked vegetables (no rice/potato)',                                                          kcalMin: 430, kcalMax: 430 },
  ]},
  { day: 'Fri', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Kefta + salad + rice (1–2 cupped hands)',                                                                          kcalMin: 490, kcalMax: 640 },
    { meal: 'Snack',           items: 'Fruit + nuts · OR tuna',                                                                                           kcalMin: 230, kcalMax: 270 },
    { meal: 'Dinner (18:00)', items: 'Fish (salmon/tuna/sardines) + vegetables + potatoes (1 cupped hand)',                                               kcalMin: 360, kcalMax: 360 },
  ]},
  { day: 'Sat', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Chicken + salad + rice (1–2 cupped hands)',                                                                        kcalMin: 430, kcalMax: 580 },
    { meal: 'Snack',           items: '2 eggs · OR tuna + fruit',                                                                                         kcalMin: 144, kcalMax: 320 },
    { meal: 'Dinner (18:00)', items: 'Beef + vegetables + bread (½–1 cupped hand)',                                                                       kcalMin: 340, kcalMax: 420 },
  ]},
  { day: 'Sun', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Tuna/sardines + salad + olive oil · Skip bread or ½ cupped hand (rest/low-carb day)',                              kcalMin: 280, kcalMax: 430 },
    { meal: 'Snack',           items: 'Fruit · OR nuts (pick one)',                                                                                       kcalMin: 90,  kcalMax: 180 },
    { meal: 'Dinner (18:00)', items: 'Chicken + vegetables + salad (no rice/potato)',                                                                     kcalMin: 280, kcalMax: 280 },
  ]},
]
