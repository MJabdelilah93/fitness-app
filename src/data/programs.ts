/**
 * Fixed program templates — Milestone 4.
 *
 * HARD RULE: exercises are FIXED per session, not randomised.
 * Switching between Normal ↔ Ramadan is the only runtime change.
 *
 * Normal  (5 gym days / week): Push · Pull · Legs · Cardio+Core · Upper B
 * Ramadan (4 gym days / week): Upper A · Lower A · Upper B · Lower B
 *
 * All primary exercises use MACHINES — safer for the back, beginner-friendly,
 * and consistent across commercial gyms.
 *
 * Set scheme guidelines (Normal):
 *   Main compound (machine):  4 sets · 8-12 reps · RIR 2 · 2 min rest
 *   Accessory compound:       3 sets · 10-12 reps · RIR 2 · 90 s rest
 *   Isolation:                3-4 sets · 12-20 reps · RIR 1 · 60 s rest
 *   Core / stability:         3 sets · 10-15 reps (or timed) · 45-60 s rest
 *
 * Ramadan adjustments: -1 set per exercise · RIR +1 (conservative fatigue).
 *
 * Pain rules (displayed on each ExerciseCard):
 *   > 3/10  → switch to the listed replacement exercise
 *   > 6/10  → skip the movement entirely
 */
import type { ProgramTemplate, SessionTemplate } from '../types'

// ═══════════════════════════════════════════════════════════════════
//  NORMAL MODE — 5 gym days
//  Mon Push · Tue Pull · Wed Legs · Thu Steps · Fri Cardio+Core · Sat Upper B · Sun Rest
// ═══════════════════════════════════════════════════════════════════

const NORMAL_PUSH: SessionTemplate = {
  id:               'normal-push',
  name:             'Push — Chest · Shoulders · Triceps',
  type:             'push',
  gymDay:           true,
  description:      'Machine pressing + cable isolation · Progressive overload focus',
  estimatedMinutes: 55,
  warmupProtocol:
    '5 min incline treadmill walk (grade 5%) · 15 band pull-aparts · Shoulder circles × 10 each way · 1 warm-up set each compound @ 50%',
  exercises: [
    {
      exerciseId: 'chest-press-machine',
      setScheme: { sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
      notes: 'Scapula retracted before every rep. Full control on return.',
    },
    {
      exerciseId: 'incline-chest-press-machine',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      notes: 'Seat height: handles at clavicle level. Feel upper-chest stretch at bottom.',
    },
    {
      exerciseId: 'shoulder-press-machine',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      notes: 'Back flat against pad. No lower-back hyperextension.',
    },
    {
      exerciseId: 'cable-lateral-raise',
      setScheme: { sets: 4, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
      notes: 'Lead with elbow. Stop at shoulder height. 2-3s down.',
    },
    {
      exerciseId: 'face-pull',
      setScheme: { sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
      notes: 'Elbows high. External rotate at peak. Shoulder health priority.',
    },
    {
      exerciseId: 'tricep-pushdown',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 2, restSeconds: 60 },
      notes: 'Elbows locked at sides. Full extension. Slow 3s eccentric.',
    },
    {
      exerciseId: 'overhead-tricep-extension',
      setScheme: { sets: 2, repsMin: 12, repsMax: 15, rirTarget: 2, restSeconds: 60 },
      notes: 'Elbows forward. Full stretch at bottom. Long-head emphasis.',
    },
  ],
}

const NORMAL_PULL: SessionTemplate = {
  id:               'normal-pull',
  name:             'Pull — Back · Biceps',
  type:             'pull',
  gymDay:           true,
  description:      'Vertical + horizontal machine pulls · Zero lower-back stress',
  estimatedMinutes: 55,
  warmupProtocol:
    '5 min bike · Band dislocates × 10 · Dead hang × 20s · 1 warm-up lat pulldown set @ 50%',
  exercises: [
    {
      exerciseId: 'lat-pulldown',
      setScheme: { sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
      notes: 'Slight lean back. Pull to upper chest. Full stretch at top.',
    },
    {
      exerciseId: 'chest-supported-row',
      setScheme: { sets: 4, repsMin: 8, repsMax: 12, rirTarget: 2, restSeconds: 120 },
      notes: 'Chest pinned to pad at all times. Squeeze scapulae at peak — hold 1s.',
    },
    {
      exerciseId: 'cable-row',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      notes: 'Sit tall. Pull to lower ribs. Full stretch forward between reps.',
    },
    {
      exerciseId: 'face-pull',
      setScheme: { sets: 2, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
      notes: 'Always include — rear-delt and rotator cuff health.',
    },
    {
      exerciseId: 'cable-curl',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 2, restSeconds: 60 },
      notes: 'Elbows stay forward for peak contraction. Slow 3s eccentric.',
    },
    {
      exerciseId: 'hammer-curl',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 2, restSeconds: 60 },
      notes: 'Neutral grip throughout. Brachialis focus. No swinging.',
    },
  ],
}

const NORMAL_LEGS: SessionTemplate = {
  id:               'normal-legs',
  name:             'Legs — Quads · Hamstrings · Glutes · Calves',
  type:             'legs',
  gymDay:           true,
  description:      'Full machine lower body — quad + hamstring + hip abductor + calf isolation',
  estimatedMinutes: 60,
  warmupProtocol:
    '8 min stationary bike · Leg swings × 15 each direction · Hip circles × 10 each way · 1 warm-up leg press set @ 50%',
  exercises: [
    {
      exerciseId: 'leg-press',
      setScheme: { sets: 4, repsMin: 10, repsMax: 15, rirTarget: 2, restSeconds: 120 },
      notes: 'Feet mid-plate hip-width. Do NOT lock knees at top. Full ROM.',
    },
    {
      exerciseId: 'leg-extension',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 2, restSeconds: 60 },
      notes: 'Controlled movement only. Squeeze quad 1s at top. 3s eccentric.',
    },
    {
      exerciseId: 'seated-leg-curl',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 2, restSeconds: 60 },
      notes: 'Curl until heel nearly under seat. Full stretch at extension. 3s eccentric.',
    },
    {
      exerciseId: 'hip-abduction',
      setScheme: { sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
      notes: 'Sit upright. Push outward against pads. Squeeze glute med at peak.',
    },
    {
      exerciseId: 'calf-raise',
      setScheme: { sets: 4, repsMin: 12, repsMax: 20, rirTarget: 1, restSeconds: 45 },
      notes: 'FULL range — complete stretch at bottom, full contraction at top. Pause 1s.',
    },
  ],
}

const NORMAL_CARDIO_CORE: SessionTemplate = {
  id:               'normal-cardio-core',
  name:             'Cardio + Core',
  type:             'cardio',
  gymDay:           true,
  description:      '30 min Zone 2 cardio then anti-rotation + stability core work',
  estimatedMinutes: 50,
  warmupProtocol:
    '30 MIN ZONE 2 CARDIO — choose one option:\n'
    + '• Incline treadmill walk: 12% grade · 4.5–5 km/h · hands OFF the rails\n'
    + '• Stationary bike: moderate resistance · can hold a conversation\n'
    + '• Elliptical: upright posture · push with legs, not just arms\n'
    + 'Target: breathing elevated but still able to speak in full sentences (Zone 2).',
  exercises: [
    {
      exerciseId: 'pallof-press',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 0, restSeconds: 60 },
      notes: 'Each "rep" = press out + return to chest. Complete all reps one side, then switch.',
    },
    {
      exerciseId: 'side-plank',
      setScheme: { sets: 3, repsMin: 30, repsMax: 45, rirTarget: 0, restSeconds: 60 },
      notes: 'Reps = SECONDS held. Body straight head to heels. Do each side.',
    },
    {
      exerciseId: 'bird-dog',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 0, restSeconds: 45 },
      notes: 'Each rep = opposite arm + leg. Hold 2s at extension. Alternate sides.',
    },
    {
      exerciseId: 'dead-bug',
      setScheme: { sets: 3, repsMin: 8, repsMax: 10, rirTarget: 0, restSeconds: 45 },
      notes: 'Each rep = opposite arm + leg. Lower back stays on floor at ALL times.',
    },
  ],
}

const NORMAL_UPPER_B: SessionTemplate = {
  id:               'normal-upper-b',
  name:             'Upper B — Push · Pull Combination',
  type:             'upper',
  gymDay:           true,
  description:      'Full upper body · Lower volume than dedicated push/pull days · Saturday finisher',
  estimatedMinutes: 50,
  warmupProtocol:
    '5 min incline walk · Band pull-aparts × 15 · Dead hang × 20s · 1 warm-up set per compound @ 50%',
  exercises: [
    {
      exerciseId: 'chest-press-machine',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      notes: 'Match or beat Monday\'s working weight.',
    },
    {
      exerciseId: 'lat-pulldown',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      notes: 'Full stretch at top. Pull to upper chest.',
    },
    {
      exerciseId: 'shoulder-press-machine',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      notes: 'Back flat. No lower-back extension.',
    },
    {
      exerciseId: 'chest-supported-row',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 2, restSeconds: 90 },
      notes: 'Chest firmly on pad. Full scapular retraction at peak.',
    },
    {
      exerciseId: 'cable-lateral-raise',
      setScheme: { sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 60 },
      notes: 'Light. Strict form. Lead with elbow.',
    },
    {
      exerciseId: 'overhead-tricep-extension',
      setScheme: { sets: 2, repsMin: 12, repsMax: 15, rirTarget: 2, restSeconds: 60 },
      notes: 'Elbows forward. Full stretch at bottom.',
    },
    {
      exerciseId: 'cable-curl',
      setScheme: { sets: 2, repsMin: 12, repsMax: 15, rirTarget: 2, restSeconds: 60 },
      notes: 'Constant tension. Slow eccentric.',
    },
  ],
}

const NORMAL_STEPS: SessionTemplate = {
  id:               'normal-steps',
  name:             'Active Recovery — Steps',
  type:             'steps',
  gymDay:           false,
  description:      'Hit your daily step goal. Walk, hike, or light movement.',
  estimatedMinutes: 45,
  warmupProtocol:   '',
  exercises:        [],
}

const NORMAL_REST: SessionTemplate = {
  id:               'normal-rest',
  name:             'Rest Day',
  type:             'rest',
  gymDay:           false,
  description:      'Full rest or gentle mobility. No gym required.',
  estimatedMinutes: 0,
  warmupProtocol:   '',
  exercises:        [],
}

// ═══════════════════════════════════════════════════════════════════
//  RAMADAN MODE — 4 gym days
//  Mon Upper A · Tue Lower A · Wed Steps · Thu Upper B · Fri Lower B · Sat Steps · Sun Rest
//  Goal: MAINTENANCE — preserve muscle, prevent excessive fatigue.
//  Train post-Iftar when energy and hydration are restored.
// ═══════════════════════════════════════════════════════════════════

const RAMADAN_UPPER_A: SessionTemplate = {
  id:               'ramadan-upper-a',
  name:             'Upper A — Chest · Back · Arms',
  type:             'upper',
  gymDay:           true,
  description:      'Machine push + pull superset approach · ~40 min · Conservative RIR',
  estimatedMinutes: 40,
  warmupProtocol:
    '3 min easy walk or bike · Band pull-aparts × 10 · Shoulder circles × 10 each way · 1 warm-up set per compound @ 40%',
  exercises: [
    {
      exerciseId: 'chest-press-machine',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 3, restSeconds: 90 },
      notes: 'Reduce load 20-30% vs Normal mode. Stop well short of failure.',
    },
    {
      exerciseId: 'chest-supported-row',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 3, restSeconds: 90 },
      notes: 'Chest on pad. Full retraction. No momentum.',
    },
    {
      exerciseId: 'shoulder-press-machine',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 3, restSeconds: 90 },
      notes: 'Lighter than Normal. Back supported. Controlled press.',
    },
    {
      exerciseId: 'cable-lateral-raise',
      setScheme: { sets: 2, repsMin: 15, repsMax: 20, rirTarget: 2, restSeconds: 60 },
      notes: 'Light pump work. Strict form.',
    },
    {
      exerciseId: 'face-pull',
      setScheme: { sets: 2, repsMin: 15, repsMax: 20, rirTarget: 2, restSeconds: 60 },
      notes: 'Always include — shoulder health regardless of fatigue.',
    },
    {
      exerciseId: 'tricep-pushdown',
      setScheme: { sets: 2, repsMin: 12, repsMax: 15, rirTarget: 3, restSeconds: 60 },
      notes: 'Light. No strain. Full lockout.',
    },
    {
      exerciseId: 'cable-curl',
      setScheme: { sets: 2, repsMin: 12, repsMax: 15, rirTarget: 3, restSeconds: 60 },
      notes: 'Constant tension. No swinging. Stop well short of failure.',
    },
  ],
}

const RAMADAN_LOWER_A: SessionTemplate = {
  id:               'ramadan-lower-a',
  name:             'Lower A — Quads · Hamstrings · Calves',
  type:             'lower',
  gymDay:           true,
  description:      'Machine lower body — full quad + hamstring + calf coverage in 40 min',
  estimatedMinutes: 40,
  warmupProtocol:
    '5 min easy bike · Leg swings × 10 each direction · Hip circles × 10 each way · 1 warm-up leg press set @ 40%',
  exercises: [
    {
      exerciseId: 'leg-press',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 3, restSeconds: 90 },
      notes: 'Moderate load. Full ROM. Don\'t lock knees at top.',
    },
    {
      exerciseId: 'leg-extension',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 3, restSeconds: 60 },
      notes: 'Controlled. Squeeze quad at top. 3s eccentric.',
    },
    {
      exerciseId: 'seated-leg-curl',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 3, restSeconds: 60 },
      notes: 'Full hamstring stretch. Control the negative.',
    },
    {
      exerciseId: 'hip-abduction',
      setScheme: { sets: 3, repsMin: 15, repsMax: 20, rirTarget: 2, restSeconds: 60 },
      notes: 'Sit tall. No momentum. Squeeze glute med.',
    },
    {
      exerciseId: 'calf-raise',
      setScheme: { sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 45 },
      notes: 'Full ROM. Pause at top.',
    },
  ],
}

const RAMADAN_UPPER_B: SessionTemplate = {
  id:               'ramadan-upper-b',
  name:             'Upper B — Shoulders · Back · Arms',
  type:             'upper',
  gymDay:           true,
  description:      'Upper B variation — incline press + lat pulldown + arm isolation',
  estimatedMinutes: 40,
  warmupProtocol:
    '3 min walk · Band dislocates × 10 · Dead hang × 15s · 1 warm-up lat pulldown set @ 40%',
  exercises: [
    {
      exerciseId: 'incline-chest-press-machine',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 3, restSeconds: 90 },
      notes: 'Upper chest focus. Feel stretch at bottom. Conservative load.',
    },
    {
      exerciseId: 'lat-pulldown',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 3, restSeconds: 90 },
      notes: 'Wide or neutral grip. Pull to upper chest. Full stretch at top.',
    },
    {
      exerciseId: 'shoulder-press-machine',
      setScheme: { sets: 2, repsMin: 10, repsMax: 12, rirTarget: 3, restSeconds: 90 },
      notes: 'Lighter second shoulder session of the week.',
    },
    {
      exerciseId: 'cable-row',
      setScheme: { sets: 3, repsMin: 10, repsMax: 12, rirTarget: 3, restSeconds: 90 },
      notes: 'Sit tall. No rounding. Full retraction.',
    },
    {
      exerciseId: 'face-pull',
      setScheme: { sets: 2, repsMin: 15, repsMax: 20, rirTarget: 2, restSeconds: 60 },
      notes: 'Always in every session. Shoulder health.',
    },
    {
      exerciseId: 'overhead-tricep-extension',
      setScheme: { sets: 2, repsMin: 12, repsMax: 15, rirTarget: 3, restSeconds: 60 },
      notes: 'Long-head focus. Elbows forward. Stretch at bottom.',
    },
    {
      exerciseId: 'hammer-curl',
      setScheme: { sets: 2, repsMin: 12, repsMax: 15, rirTarget: 3, restSeconds: 60 },
      notes: 'Neutral grip. No swinging. Brachialis + brachioradialis.',
    },
  ],
}

const RAMADAN_LOWER_B: SessionTemplate = {
  id:               'ramadan-lower-b',
  name:             'Lower B — Glutes · Hamstrings · Core',
  type:             'lower',
  gymDay:           true,
  description:      'Hip-dominant lower session + core finisher — posterior chain focus',
  estimatedMinutes: 40,
  warmupProtocol:
    '5 min easy bike · Glute bridges × 15 bodyweight · Leg swings × 10 each side',
  exercises: [
    {
      exerciseId: 'leg-press',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 3, restSeconds: 90 },
      notes: 'Feet slightly higher on plate vs Lower A — shifts load to glutes/hamstrings.',
    },
    {
      exerciseId: 'seated-leg-curl',
      setScheme: { sets: 3, repsMin: 12, repsMax: 15, rirTarget: 3, restSeconds: 60 },
      notes: 'Full hamstring ROM. Resist on the way back up.',
    },
    {
      exerciseId: 'hip-abduction',
      setScheme: { sets: 3, repsMin: 15, repsMax: 20, rirTarget: 2, restSeconds: 60 },
      notes: 'Slow and controlled. Glute med focus.',
    },
    {
      exerciseId: 'calf-raise',
      setScheme: { sets: 3, repsMin: 15, repsMax: 20, rirTarget: 1, restSeconds: 45 },
      notes: 'Full ROM. Pause at top.',
    },
    {
      exerciseId: 'pallof-press',
      setScheme: { sets: 2, repsMin: 10, repsMax: 12, rirTarget: 0, restSeconds: 60 },
      notes: 'Anti-rotation core finisher. Both sides. Resist rotation.',
    },
    {
      exerciseId: 'dead-bug',
      setScheme: { sets: 2, repsMin: 8, repsMax: 10, rirTarget: 0, restSeconds: 45 },
      notes: 'Lower back stays on floor. Slow. Safe core finisher.',
    },
  ],
}

const RAMADAN_STEPS: SessionTemplate = {
  id:               'ramadan-steps',
  name:             'Light Walk — Steps',
  type:             'steps',
  gymDay:           false,
  description:      'Post-Iftar walk only. Keep it gentle — 6,000–8,000 steps. No intense cardio.',
  estimatedMinutes: 30,
  warmupProtocol:   '',
  exercises:        [],
}

const RAMADAN_REST: SessionTemplate = {
  id:               'ramadan-rest',
  name:             'Rest Day',
  type:             'rest',
  gymDay:           false,
  description:      'Full rest. Prioritise sleep and hydration between Iftar and Suhoor.',
  estimatedMinutes: 0,
  warmupProtocol:   '',
  exercises:        [],
}

// ═══════════════════════════════════════════════════════════════════
//  PROGRAM DEFINITIONS
// ═══════════════════════════════════════════════════════════════════

const NORMAL_5DAY: ProgramTemplate = {
  id:          'normal-5day',
  name:        'Normal — 5-Day Machine Program',
  mode:        'normal',
  description: '5 gym days · Push · Pull · Legs · Cardio+Core · Upper B · Machine-first · Progressive overload',
  weeklySchedule: {
    MON: 'normal-push',
    TUE: 'normal-pull',
    WED: 'normal-legs',
    THU: 'normal-steps',
    FRI: 'normal-cardio-core',
    SAT: 'normal-upper-b',
    SUN: 'normal-rest',
  },
  sessions: [
    NORMAL_PUSH,
    NORMAL_PULL,
    NORMAL_LEGS,
    NORMAL_CARDIO_CORE,
    NORMAL_UPPER_B,
    NORMAL_STEPS,
    NORMAL_REST,
  ],
  notes:
    'Progress rule: add weight when you hit the top of the rep range at RIR ≥ 2 for 2 consecutive sessions.\n'
    + 'Pain rule: pain > 3/10 → use replacement. Pain > 6/10 → skip the movement.',
}

const RAMADAN_4DAY: ProgramTemplate = {
  id:          'ramadan-4day',
  name:        'Ramadan — 4-Day Machine Program',
  mode:        'ramadan',
  description: '4 gym days · Upper A · Lower A · Upper B · Lower B · Maintenance · Train post-Iftar',
  weeklySchedule: {
    MON: 'ramadan-upper-a',
    TUE: 'ramadan-lower-a',
    WED: 'ramadan-steps',
    THU: 'ramadan-upper-b',
    FRI: 'ramadan-lower-b',
    SAT: 'ramadan-steps',
    SUN: 'ramadan-rest',
  },
  sessions: [
    RAMADAN_UPPER_A,
    RAMADAN_LOWER_A,
    RAMADAN_UPPER_B,
    RAMADAN_LOWER_B,
    RAMADAN_STEPS,
    RAMADAN_REST,
  ],
  notes:
    'Goal is MAINTENANCE — preserve muscle, expect no new gains during Ramadan.\n'
    + 'Keep RIR ≥ 3. Train 2-3 h after Iftar when glycogen and hydration are restored.\n'
    + 'Pain rule: pain > 3/10 → switch to replacement. Pain > 6/10 → skip movement.',
}

// ═══════════════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════════════

const ALL_PROGRAMS: ProgramTemplate[] = [NORMAL_5DAY, RAMADAN_4DAY]

export function getProgram(mode: 'normal' | 'ramadan'): ProgramTemplate | undefined {
  return ALL_PROGRAMS.find((p) => p.mode === mode)
}

export function getSession(
  program:   ProgramTemplate,
  sessionId: string,
): SessionTemplate | undefined {
  return program.sessions.find((s) => s.id === sessionId)
}

export function getTodaySession(
  program:   ProgramTemplate,
  dayOfWeek: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN',
): SessionTemplate | undefined {
  const sessionId = program.weeklySchedule[dayOfWeek]
  return getSession(program, sessionId)
}

export { ALL_PROGRAMS }
