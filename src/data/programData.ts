import type { TrainingMode } from '../types'

// ─── Core types ───────────────────────────────────────────────────────────────

export interface ProgramRow {
  day:      string   // 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
  part:     string   // 'Warm-up', 'Upper A', 'Lower A', 'Steps', 'Rest', etc.
  exercise: string   // Full name – may contain " (Alt: ...)"
  url:      string   // YouTube search URL
  sets:     string   // '3', '2–3', '' for cardio/warmup
  reps:     string   // '8–12', '20–30 min', ''
}

export interface MealItem {
  meal:  string   // 'Iftar (Maghrib)', 'Snack', 'Pre/Suhoor', 'Meal 1 (12:00)', etc.
  items: string   // Human-readable food description
}

export interface NutritionDay {
  day:   string       // 'Mon' … 'Sun'
  meals: MealItem[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise exercise name to a stable storage key. */
export function makeExerciseKey(name: string): string {
  return name
    .replace(/\s*\([^)]*\)/g, '')   // strip all parenthetical text
    .replace(/\s*Alt:.*$/i, '')      // strip trailing Alt: ...
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export interface ParsedExercise {
  main: { name: string; key: string; url: string }
  alt?: { name: string; key: string; url: string }
}

/** Split "Exercise (Alt: Alternative)" into main + optional alt. */
export function parseExercise(row: ProgramRow): ParsedExercise {
  const altMatch = row.exercise.match(/\(Alt:\s*([^)]+)\)/i)
  const mainName = row.exercise.replace(/\s*\(Alt:[^)]*\)/i, '').trim()
  const result: ParsedExercise = {
    main: { name: mainName, key: makeExerciseKey(mainName), url: row.url },
  }
  if (altMatch) {
    const altName = altMatch[1].trim()
    result.alt = {
      name: altName,
      key:  makeExerciseKey(altName),
      url:  `https://www.youtube.com/results?search_query=${encodeURIComponent(altName)}`,
    }
  }
  return result
}

/** Returns true when a row has structured sets/reps (i.e. is a weight-training exercise). */
export function isLoggableRow(row: ProgramRow): boolean {
  return row.sets !== '' && row.reps !== ''
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

const RAMADAN_WORKOUT: ProgramRow[] = [
  { day: 'Mon', part: 'Warm-up', exercise: 'Treadmill walk (incline) 5–7 min',       url: 'https://www.youtube.com/results?search_query=Treadmill+walk+incline',          sets: '',    reps: '5–7 min' },
  { day: 'Mon', part: 'Warm-up', exercise: 'Band pull-aparts / cable face pulls',     url: 'https://www.youtube.com/results?search_query=Band+pull-aparts+cable+face+pulls', sets: '2',   reps: '15' },
  { day: 'Mon', part: 'Warm-up', exercise: 'Machine chest press light',               url: 'https://www.youtube.com/results?search_query=Machine+chest+press+light',         sets: '1–2', reps: '12–15' },
  { day: 'Mon', part: 'Upper A', exercise: 'Incline Chest Press Machine',             url: 'https://www.youtube.com/results?search_query=Incline+Chest+Press+Machine',       sets: '3',   reps: '8–12' },
  { day: 'Mon', part: 'Upper A', exercise: 'Lat Pulldown (neutral grip)',             url: 'https://www.youtube.com/results?search_query=Lat+Pulldown+neutral+grip',         sets: '3',   reps: '8–12' },
  { day: 'Mon', part: 'Upper A', exercise: 'Seated Row Machine',                     url: 'https://www.youtube.com/results?search_query=Seated+Row+Machine',                sets: '3',   reps: '10–12' },
  { day: 'Mon', part: 'Upper A', exercise: 'Shoulder Press Machine',                 url: 'https://www.youtube.com/results?search_query=Shoulder+Press+Machine',            sets: '2–3', reps: '8–12' },
  { day: 'Mon', part: 'Upper A', exercise: 'Cable Triceps Pressdown',                url: 'https://www.youtube.com/results?search_query=Cable+Triceps+Pressdown',           sets: '2–3', reps: '10–15' },
  { day: 'Mon', part: 'Upper A', exercise: 'Cable Biceps Curl',                      url: 'https://www.youtube.com/results?search_query=Cable+Biceps+Curl',                 sets: '2–3', reps: '10–15' },
  { day: 'Mon', part: 'Upper A', exercise: 'Plank',                                  url: 'https://www.youtube.com/results?search_query=Plank+exercise',                    sets: '3',   reps: '30–45s' },

  { day: 'Tue', part: 'Steps',           exercise: 'Brisk walk (outdoor or treadmill)', url: 'https://www.youtube.com/results?search_query=Brisk+walk+treadmill',         sets: '', reps: '20–30 min' },
  { day: 'Tue', part: 'Optional cardio', exercise: 'Bike or Elliptical (easy)',          url: 'https://www.youtube.com/results?search_query=Bike+Elliptical+easy+cardio', sets: '', reps: '10–20 min' },

  { day: 'Wed', part: 'Warm-up', exercise: 'Bike 5–7 min',                   url: 'https://www.youtube.com/results?search_query=Stationary+bike+warm+up',      sets: '',    reps: '5–7 min' },
  { day: 'Wed', part: 'Warm-up', exercise: 'Bodyweight glute bridge',        url: 'https://www.youtube.com/results?search_query=Bodyweight+glute+bridge',       sets: '2',   reps: '12–15' },
  { day: 'Wed', part: 'Warm-up', exercise: 'Leg press light',                url: 'https://www.youtube.com/results?search_query=Leg+press+light+warm+up',      sets: '1–2', reps: '12–15' },
  { day: 'Wed', part: 'Lower A', exercise: 'Leg Press (limited depth; pain-free)', url: 'https://www.youtube.com/results?search_query=Leg+Press+limited+depth', sets: '4',   reps: '8–12' },
  { day: 'Wed', part: 'Lower A', exercise: 'Seated Leg Curl',                url: 'https://www.youtube.com/results?search_query=Seated+Leg+Curl',              sets: '3',   reps: '10–15' },
  { day: 'Wed', part: 'Lower A', exercise: 'Leg Extension',                  url: 'https://www.youtube.com/results?search_query=Leg+Extension+machine',        sets: '3',   reps: '10–15' },
  { day: 'Wed', part: 'Lower A', exercise: 'Hip Thrust Machine',             url: 'https://www.youtube.com/results?search_query=Hip+Thrust+Machine',           sets: '3',   reps: '8–12' },
  { day: 'Wed', part: 'Lower A', exercise: 'Back Extension Machine',        url: 'https://www.youtube.com/results?search_query=Back+Extension+Machine',       sets: '2–3', reps: '10–15' },
  { day: 'Wed', part: 'Lower A', exercise: 'Side Plank',                     url: 'https://www.youtube.com/results?search_query=Side+Plank+exercise',         sets: '2',   reps: '20–40s/side' },

  { day: 'Thu', part: 'Steps', exercise: 'Brisk walk', url: 'https://www.youtube.com/results?search_query=Brisk+walk', sets: '', reps: '20–30 min' },

  { day: 'Fri', part: 'Warm-up', exercise: 'Rower or Elliptical 5–7 min',    url: 'https://www.youtube.com/results?search_query=Rowing+machine+warm+up',     sets: '',    reps: '5–7 min' },
  { day: 'Fri', part: 'Warm-up', exercise: 'Band external rotations',        url: 'https://www.youtube.com/results?search_query=Band+external+rotations',    sets: '2',   reps: '12–15' },
  { day: 'Fri', part: 'Warm-up', exercise: 'Lat pulldown light',             url: 'https://www.youtube.com/results?search_query=Lat+pulldown+light',         sets: '1–2', reps: '12–15' },
  { day: 'Fri', part: 'Upper B', exercise: 'Chest Press Machine (flat)',     url: 'https://www.youtube.com/results?search_query=Chest+Press+Machine+flat',   sets: '3',   reps: '8–12' },
  { day: 'Fri', part: 'Upper B', exercise: 'Assisted Pull-up or Lat Pulldown', url: 'https://www.youtube.com/results?search_query=Assisted+Pull-up+Lat+Pulldown', sets: '3', reps: '8–12' },
  { day: 'Fri', part: 'Upper B', exercise: 'Pec Deck / Rear Delt Fly (machine)', url: 'https://www.youtube.com/results?search_query=Pec+Deck+Rear+Delt+Fly+machine', sets: '2–3', reps: '12–15' },
  { day: 'Fri', part: 'Upper B', exercise: 'Cable Row (or machine row)',     url: 'https://www.youtube.com/results?search_query=Cable+Row+machine+row',      sets: '3',   reps: '10–12' },
  { day: 'Fri', part: 'Upper B', exercise: 'Lateral Raise Machine (or cables)', url: 'https://www.youtube.com/results?search_query=Lateral+Raise+Machine+cables', sets: '2–3', reps: '12–15' },
  { day: 'Fri', part: 'Upper B', exercise: 'Overhead Cable Triceps Extension', url: 'https://www.youtube.com/results?search_query=Overhead+Cable+Triceps+Extension', sets: '2–3', reps: '10–15' },
  { day: 'Fri', part: 'Upper B', exercise: 'Hammer Curl (cable or dumbbells)', url: 'https://www.youtube.com/results?search_query=Hammer+Curl+cable+dumbbells', sets: '2–3', reps: '10–15' },
  { day: 'Fri', part: 'Upper B', exercise: 'Dead Bug (slow)',                url: 'https://www.youtube.com/results?search_query=Dead+Bug+exercise+slow',     sets: '3',   reps: '8–12/side' },

  { day: 'Sat', part: 'Optional', exercise: 'Long walk / steps',     url: 'https://www.youtube.com/results?search_query=Long+walk+exercise', sets: '', reps: '45–60 min' },
  { day: 'Sun', part: 'Rest',     exercise: 'Mobility + easy walk',  url: 'https://www.youtube.com/results?search_query=Mobility+easy+walk',  sets: '', reps: '15–30 min' },
]

// ─── Normal workout ───────────────────────────────────────────────────────────

const NORMAL_WORKOUT: ProgramRow[] = [
  { day: 'Mon', part: 'Warm-up', exercise: 'Treadmill walk (incline) 5–7 min',   url: 'https://www.youtube.com/results?search_query=Treadmill+walk+incline',          sets: '',    reps: '5–7 min' },
  { day: 'Mon', part: 'Warm-up', exercise: 'Band pull-aparts / face pulls',       url: 'https://www.youtube.com/results?search_query=Band+pull-aparts+face+pulls',     sets: '2',   reps: '15' },
  { day: 'Mon', part: 'Warm-up', exercise: 'Machine chest press light',           url: 'https://www.youtube.com/results?search_query=Machine+chest+press+light',       sets: '1–2', reps: '12–15' },
  { day: 'Mon', part: 'Upper A', exercise: 'Incline Chest Press Machine',         url: 'https://www.youtube.com/results?search_query=Incline+Chest+Press+Machine',     sets: '3',   reps: '8–12' },
  { day: 'Mon', part: 'Upper A', exercise: 'Lat Pulldown (neutral grip)',         url: 'https://www.youtube.com/results?search_query=Lat+Pulldown+neutral+grip',       sets: '3',   reps: '8–12' },
  { day: 'Mon', part: 'Upper A', exercise: 'Seated Row Machine',                 url: 'https://www.youtube.com/results?search_query=Seated+Row+Machine',              sets: '3',   reps: '10–12' },
  { day: 'Mon', part: 'Upper A', exercise: 'Shoulder Press Machine',             url: 'https://www.youtube.com/results?search_query=Shoulder+Press+Machine',          sets: '2–3', reps: '8–12' },
  { day: 'Mon', part: 'Upper A', exercise: 'Cable Triceps Pressdown',            url: 'https://www.youtube.com/results?search_query=Cable+Triceps+Pressdown',         sets: '2–3', reps: '10–15' },
  { day: 'Mon', part: 'Upper A', exercise: 'Cable Biceps Curl',                  url: 'https://www.youtube.com/results?search_query=Cable+Biceps+Curl',               sets: '2–3', reps: '10–15' },
  { day: 'Mon', part: 'Upper A', exercise: 'Plank',                              url: 'https://www.youtube.com/results?search_query=Plank+exercise',                  sets: '3',   reps: '30–45s' },

  { day: 'Tue', part: 'Warm-up', exercise: 'Bike 5–7 min',              url: 'https://www.youtube.com/results?search_query=Stationary+bike+warm+up',    sets: '',    reps: '5–7 min' },
  { day: 'Tue', part: 'Warm-up', exercise: 'Bodyweight glute bridge',   url: 'https://www.youtube.com/results?search_query=Bodyweight+glute+bridge',     sets: '2',   reps: '12–15' },
  { day: 'Tue', part: 'Warm-up', exercise: 'Leg press light',           url: 'https://www.youtube.com/results?search_query=Leg+press+light+warm+up',    sets: '1–2', reps: '12–15' },
  { day: 'Tue', part: 'Lower A', exercise: 'Leg Press (limited depth; pain-free)', url: 'https://www.youtube.com/results?search_query=Leg+Press+limited+depth', sets: '4', reps: '8–12' },
  { day: 'Tue', part: 'Lower A', exercise: 'Seated Leg Curl',           url: 'https://www.youtube.com/results?search_query=Seated+Leg+Curl',            sets: '3',   reps: '10–15' },
  { day: 'Tue', part: 'Lower A', exercise: 'Leg Extension',             url: 'https://www.youtube.com/results?search_query=Leg+Extension+machine',      sets: '3',   reps: '10–15' },
  { day: 'Tue', part: 'Lower A', exercise: 'Hip Thrust Machine',        url: 'https://www.youtube.com/results?search_query=Hip+Thrust+Machine',         sets: '3',   reps: '8–12' },
  { day: 'Tue', part: 'Lower A', exercise: 'Cable Pull-Through (Alt: Hip Thrust / Glute Bridge)', url: 'https://www.youtube.com/results?search_query=Cable+Pull-Through', sets: '2–3', reps: '12–15' },
  { day: 'Tue', part: 'Lower A', exercise: 'Back Extension Machine',    url: 'https://www.youtube.com/results?search_query=Back+Extension+Machine',     sets: '2–3', reps: '10–15' },
  { day: 'Tue', part: 'Lower A', exercise: 'Side Plank',                url: 'https://www.youtube.com/results?search_query=Side+Plank+exercise',        sets: '2',   reps: '20–40s/side' },

  { day: 'Wed', part: 'Cardio', exercise: 'Brisk walk or Elliptical', url: 'https://www.youtube.com/results?search_query=Brisk+walk+elliptical+cardio', sets: '', reps: '25–35 min' },

  { day: 'Thu', part: 'Warm-up', exercise: 'Rower or Elliptical 5–7 min',        url: 'https://www.youtube.com/results?search_query=Rowing+machine+warm+up',          sets: '',    reps: '5–7 min' },
  { day: 'Thu', part: 'Warm-up', exercise: 'Band external rotations',            url: 'https://www.youtube.com/results?search_query=Band+external+rotations',         sets: '2',   reps: '12–15' },
  { day: 'Thu', part: 'Warm-up', exercise: 'Lat pulldown light',                 url: 'https://www.youtube.com/results?search_query=Lat+pulldown+light',              sets: '1–2', reps: '12–15' },
  { day: 'Thu', part: 'Upper B', exercise: 'Chest Press Machine (flat)',         url: 'https://www.youtube.com/results?search_query=Chest+Press+Machine+flat',        sets: '3',   reps: '8–12' },
  { day: 'Thu', part: 'Upper B', exercise: 'Assisted Pull-up or Lat Pulldown',  url: 'https://www.youtube.com/results?search_query=Assisted+Pull-up+Lat+Pulldown',   sets: '3',   reps: '8–12' },
  { day: 'Thu', part: 'Upper B', exercise: 'Pec Deck / Rear Delt Fly (machine)',url: 'https://www.youtube.com/results?search_query=Pec+Deck+Rear+Delt+Fly+machine', sets: '2–3', reps: '12–15' },
  { day: 'Thu', part: 'Upper B', exercise: 'Cable Row (or machine row)',         url: 'https://www.youtube.com/results?search_query=Cable+Row+machine+row',           sets: '3',   reps: '10–12' },
  { day: 'Thu', part: 'Upper B', exercise: 'Lateral Raise Machine (or cables)', url: 'https://www.youtube.com/results?search_query=Lateral+Raise+Machine+cables',    sets: '2–3', reps: '12–15' },
  { day: 'Thu', part: 'Upper B', exercise: 'Overhead Cable Triceps Extension',  url: 'https://www.youtube.com/results?search_query=Overhead+Cable+Triceps+Extension',sets: '2–3', reps: '10–15' },
  { day: 'Thu', part: 'Upper B', exercise: 'Hammer Curl (cable or dumbbells)',  url: 'https://www.youtube.com/results?search_query=Hammer+Curl+cable+dumbbells',     sets: '2–3', reps: '10–15' },
  { day: 'Thu', part: 'Upper B', exercise: 'Dead Bug (slow)',                   url: 'https://www.youtube.com/results?search_query=Dead+Bug+exercise+slow',          sets: '3',   reps: '8–12/side' },

  { day: 'Fri', part: 'Warm-up', exercise: 'Bike 5–7 min',                url: 'https://www.youtube.com/results?search_query=Stationary+bike+warm+up',     sets: '',    reps: '5–7 min' },
  { day: 'Fri', part: 'Warm-up', exercise: 'Bodyweight glute bridge',     url: 'https://www.youtube.com/results?search_query=Bodyweight+glute+bridge',      sets: '2',   reps: '12–15' },
  { day: 'Fri', part: 'Warm-up', exercise: 'Leg press light',             url: 'https://www.youtube.com/results?search_query=Leg+press+light+warm+up',     sets: '1–2', reps: '12–15' },
  { day: 'Fri', part: 'Lower B', exercise: 'Leg Press (different foot position)', url: 'https://www.youtube.com/results?search_query=Leg+Press+different+foot+position', sets: '4', reps: '8–12' },
  { day: 'Fri', part: 'Lower B', exercise: 'Seated Leg Curl',             url: 'https://www.youtube.com/results?search_query=Seated+Leg+Curl',             sets: '3',   reps: '10–15' },
  { day: 'Fri', part: 'Lower B', exercise: 'Leg Extension',               url: 'https://www.youtube.com/results?search_query=Leg+Extension+machine',       sets: '3',   reps: '10–15' },
  { day: 'Fri', part: 'Lower B', exercise: 'Hip Thrust Machine',          url: 'https://www.youtube.com/results?search_query=Hip+Thrust+Machine',          sets: '3',   reps: '8–12' },
  { day: 'Fri', part: 'Lower B', exercise: 'Back Extension Machine',      url: 'https://www.youtube.com/results?search_query=Back+Extension+Machine',      sets: '2–3', reps: '10–15' },
  { day: 'Fri', part: 'Lower B', exercise: 'Bird Dog (slow)',             url: 'https://www.youtube.com/results?search_query=Bird+Dog+exercise+slow',      sets: '2–3', reps: '8–12/side' },
  { day: 'Fri', part: 'Lower B', exercise: 'Calf Raise Machine (optional)', url: 'https://www.youtube.com/results?search_query=Calf+Raise+Machine',       sets: '2–3', reps: '10–15' },

  { day: 'Sat', part: 'Steps', exercise: 'Long walk / leisure activity', url: 'https://www.youtube.com/results?search_query=Long+walk+exercise', sets: '', reps: '45–60 min' },
  { day: 'Sun', part: 'Rest',  exercise: 'Mobility + easy walk',         url: 'https://www.youtube.com/results?search_query=Mobility+easy+walk',  sets: '', reps: '15–30 min' },
]

// ─── Ramadan nutrition ────────────────────────────────────────────────────────

const RAMADAN_NUTRITION: NutritionDay[] = [
  { day: 'Mon', meals: [
    { meal: 'Iftar (Maghrib)',  items: 'Water + 2 dates · Harira (lentils) 1 bowl · Grilled chicken thighs 200g · Big salad (tomato/cucumber/onion) + 1 tbsp olive oil · 1 small whole-wheat khobz or 150g cooked rice' },
    { meal: 'Snack',            items: '1 fruit (banana/orange) + 30g almonds · Mint tea no sugar' },
    { meal: 'Pre/Suhoor',       items: '3 eggs omelette with veggies · 80–100g oats cooked in water + cinnamon + berries · 1 tbsp peanut butter' },
  ]},
  { day: 'Tue', meals: [
    { meal: 'Iftar (Maghrib)',  items: 'Water + 2 dates · Sardines or tuna 200g (or salmon 200g) · Roasted vegetables · 200g potatoes or 150g couscous' },
    { meal: 'Snack',            items: 'Carrots/cucumber + olive tapenade or avocado · 1 fruit' },
    { meal: 'Pre/Suhoor',       items: 'Lean beef kefta 200g · Lentil salad · 1 whole-wheat wrap or 1 small khobz' },
  ]},
  { day: 'Wed', meals: [
    { meal: 'Iftar (Maghrib)',  items: 'Water + 2 dates · Harira (lentils) 1 bowl · Turkey/chicken tagine with olives & lemon 200g · Salad · 1 serving rice/couscous' },
    { meal: 'Snack',            items: '2 boiled eggs OR 120g turkey slices · 1 fruit' },
    { meal: 'Pre/Suhoor',       items: 'Overnight oats (water) 100g oats + chia · 2 eggs · 1 tbsp nuts' },
  ]},
  { day: 'Thu', meals: [
    { meal: 'Iftar (Maghrib)',  items: 'Water + 2 dates · Salmon 200g · Zaalouk (eggplant salad) · 150–200g sweet potato' },
    { meal: 'Snack',            items: 'Popcorn (air) or 2 rice cakes · 1 fruit' },
    { meal: 'Pre/Suhoor',       items: 'Chicken breast 220g · Rice 150g cooked · Mixed veggies · 1 tbsp olive oil' },
  ]},
  { day: 'Fri', meals: [
    { meal: 'Iftar (Maghrib)',  items: 'Water + 2 dates · Lentil soup 1 bowl · Beef tagine (lean) 200g · Salad · 1 small khobz' },
    { meal: 'Snack',            items: 'Handful nuts (30g) + 1 fruit' },
    { meal: 'Pre/Suhoor',       items: 'Egg shakshuka (3 eggs + tomato/pepper) · Oats 60–80g · 1 tbsp peanut butter' },
  ]},
  { day: 'Sat', meals: [
    { meal: 'Iftar (Maghrib)',  items: 'Water + 2 dates · Chicken brochettes 220g · Moroccan salad · 150g cooked pasta or rice' },
    { meal: 'Snack',            items: 'Smoothie (water + banana + berries) + 2 boiled eggs' },
    { meal: 'Pre/Suhoor',       items: 'Tuna salad (200g tuna) + olive oil · 1 whole-wheat wrap · 1 fruit' },
  ]},
  { day: 'Sun', meals: [
    { meal: 'Iftar (Maghrib)',  items: 'Water + 2 dates · Harira (lentils) 1 bowl · Salmon or white fish 200g · Salad · 150g couscous' },
    { meal: 'Snack',            items: '2 pieces dark chocolate (10–20g) + 1 fruit (controlled)' },
    { meal: 'Pre/Suhoor',       items: 'Chicken & veggie stir-fry 220g · Oats 60g · Nuts 20g' },
  ]},
]

// ─── Normal nutrition ─────────────────────────────────────────────────────────

const NORMAL_NUTRITION: NutritionDay[] = [
  { day: 'Mon', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Chicken tagine 220g + salad + 150g cooked rice' },
    { meal: 'Snack',           items: '1 fruit + 30g nuts' },
    { meal: 'Dinner (18:00)', items: 'Salmon 200g + roasted veggies + 200g potatoes' },
  ]},
  { day: 'Tue', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Tuna/sardine salad + 1 whole-wheat wrap' },
    { meal: 'Snack',           items: '2 boiled eggs + carrots/cucumber' },
    { meal: 'Dinner (18:00)', items: 'Lean beef kefta 200g + lentil salad + 1 small khobz' },
  ]},
  { day: 'Wed', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Chicken breast 220g + couscous 150g cooked + veggies' },
    { meal: 'Snack',           items: 'Fruit + coffee/tea (no sugar)' },
    { meal: 'Dinner (18:00)', items: 'Omelette 3 eggs + veggies + 1 serving potatoes' },
  ]},
  { day: 'Thu', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Salmon 200g + zaalouk + rice 150g cooked' },
    { meal: 'Snack',           items: 'Nuts 20–30g + fruit' },
    { meal: 'Dinner (18:00)', items: 'Turkey/chicken kebab 220g + salad + 1 wrap' },
  ]},
  { day: 'Fri', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Lentil soup + chicken 200g + salad' },
    { meal: 'Snack',           items: '2 eggs OR turkey slices + fruit' },
    { meal: 'Dinner (18:00)', items: 'Beef tagine 200g + veggies + small khobz' },
  ]},
  { day: 'Sat', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Chicken brochettes 220g + rice 150g cooked + salad' },
    { meal: 'Snack',           items: 'Popcorn (air) or rice cakes + fruit' },
    { meal: 'Dinner (18:00)', items: 'Fish (tuna/sardines/salmon) 200g + veggies + potatoes' },
  ]},
  { day: 'Sun', meals: [
    { meal: 'Meal 1 (12:00)',  items: 'Kefta 200g + couscous 150g cooked + salad' },
    { meal: 'Snack',           items: 'Dark chocolate 10–20g + fruit (controlled)' },
    { meal: 'Dinner (18:00)', items: 'Egg shakshuka 3 eggs + veggies + small khobz' },
  ]},
]
