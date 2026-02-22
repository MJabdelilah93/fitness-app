/**
 * Complete exercise library — Milestone 3.
 * YouTube links use search URLs so they never go dead.
 * Replace any with a direct video URL once you verify a favourite tutorial.
 */
import type { Exercise } from '../types'

// ─── Helper ───────────────────────────────────────────────────────────────────

const yt = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`

// ═══════════════════════════════════════════════════════════════════
//  PUSH — Chest / Shoulders / Triceps
// ═══════════════════════════════════════════════════════════════════

export const EXERCISE_BARBELL_BENCH_PRESS: Exercise = {
  id: 'barbell-bench-press',
  name: 'Barbell Bench Press',
  category: 'compound',
  muscles: { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
  equipment: ['barbell'],
  videoUrl: yt('barbell bench press proper form tutorial Jeff Nippard'),
  warmupCues: [
    'Shoulder CARs × 10 each direction',
    'Band pull-aparts × 15',
    '2 warm-up sets: 50% × 8, then 70% × 5',
  ],
  formCues: [
    'Retract & depress scapula before lifting off',
    'Feet flat, drive into floor throughout',
    'Lower bar to lower chest, elbows ~70° from torso',
    'Full lockout without losing scapular position',
  ],
  contraindications: ['Shoulder impingement', 'AC joint pain', 'Wrist instability'],
  replacements: [
    { exerciseId: 'db-bench-press',   reason: 'Use if: shoulder pain > 3/10 or no spotter' },
    { exerciseId: 'incline-db-press', reason: 'Use if: AC joint pain or want upper-chest focus' },
  ],
  safetyNote: 'Pain > 3/10 during pressing → switch to DB Bench Press immediately.',
}

export const EXERCISE_OVERHEAD_PRESS: Exercise = {
  id: 'overhead-press',
  name: 'Barbell Overhead Press',
  category: 'compound',
  muscles: { primary: ['front-delts', 'side-delts'], secondary: ['triceps', 'traps'] },
  equipment: ['barbell'],
  videoUrl: yt('barbell overhead press proper form tutorial Alan Thrall'),
  warmupCues: [
    'Band dislocates × 10',
    'Thoracic extension over foam roller × 60s',
    '2 warm-up sets: empty bar × 10, then 60% × 5',
  ],
  formCues: [
    'Brace core and glutes hard throughout',
    'Bar path is vertical — chin back as bar passes face',
    'Lock out fully, shrug into bar at top',
    'Do NOT hyperextend lower back',
  ],
  contraindications: ['Shoulder impingement', 'Cervical spine / neck issues', 'Elbow tendinopathy'],
  replacements: [
    { exerciseId: 'db-bench-press',   reason: 'Use if: shoulder impingement (seated press is gentler)' },
    { exerciseId: 'lateral-raise',    reason: 'Use if: pressing causes pain — isolate delts only' },
  ],
  safetyNote: 'Seated DB press is safer if standing OHP causes lower-back pain.',
}

export const EXERCISE_INCLINE_DB_PRESS: Exercise = {
  id: 'incline-db-press',
  name: 'Incline Dumbbell Press',
  category: 'compound',
  muscles: { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
  equipment: ['dumbbell'],
  videoUrl: yt('incline dumbbell press proper form tutorial'),
  warmupCues: [
    'Set bench 30-45° — steeper hits more delt',
    '1 warm-up set at 50% × 12',
    'Gentle chest stretch before first working set',
  ],
  formCues: [
    'Neutral to slight pronation grip',
    'Lower DBs to upper chest / armpits',
    'Drive up and slightly in — don\'t bang DBs at top',
    'Control the descent (2-3s)',
  ],
  contraindications: ['AC joint pain', 'Shoulder impingement'],
  replacements: [
    { exerciseId: 'db-bench-press',        reason: 'Use if: upper chest is painful — flat press' },
    { exerciseId: 'barbell-bench-press',   reason: 'Use if: no dumbbells available' },
  ],
}

export const EXERCISE_DB_BENCH_PRESS: Exercise = {
  id: 'db-bench-press',
  name: 'Dumbbell Bench Press',
  category: 'compound',
  muscles: { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
  equipment: ['dumbbell'],
  videoUrl: yt('dumbbell bench press proper form tutorial'),
  warmupCues: [
    '1 warm-up set at 50% × 10',
    'Shoulder CARs × 10 each side',
  ],
  formCues: [
    'Elbows ~70° from torso — not flared wide',
    'Full range of motion, slight stretch at bottom',
    'Drive up and in — meet DBs above mid-chest',
    'Keep wrists neutral (straight, not bent back)',
  ],
  contraindications: ['Wrist instability'],
  replacements: [
    { exerciseId: 'barbell-bench-press', reason: 'Use if: no dumbbells available' },
    { exerciseId: 'incline-db-press',    reason: 'Use if: want more upper chest focus' },
  ],
}

export const EXERCISE_LATERAL_RAISE: Exercise = {
  id: 'lateral-raise',
  name: 'Dumbbell Lateral Raise',
  category: 'isolation',
  muscles: { primary: ['side-delts'], secondary: ['traps'] },
  equipment: ['dumbbell'],
  videoUrl: yt('lateral raise proper form side delt tutorial'),
  warmupCues: [
    '1 very light set × 20 to prime the side delts',
    'Arm circles × 10 forward + backward',
  ],
  formCues: [
    'Slight forward lean at hips (~10-15°)',
    'Pinky slightly higher than thumb at top — "empty a jug of water"',
    'Lead with elbow, not wrist',
    'Stop at shoulder height — going higher recruits traps, not delts',
  ],
  contraindications: ['Shoulder impingement (can worsen with heavy load)'],
  replacements: [
    { exerciseId: 'face-pull', reason: 'Use if: lateral raise aggravates shoulder — face pull is safer' },
  ],
}

export const EXERCISE_TRICEP_PUSHDOWN: Exercise = {
  id: 'tricep-pushdown',
  name: 'Cable Tricep Pushdown',
  category: 'isolation',
  muscles: { primary: ['triceps'], secondary: [] },
  equipment: ['cable'],
  videoUrl: yt('cable tricep pushdown proper form tutorial'),
  warmupCues: [
    '1 light warm-up set × 15 at 40%',
    'Elbow circles × 10 each arm',
  ],
  formCues: [
    'Lock elbows at sides throughout — no swinging',
    'Full extension at bottom, squeeze at lockout',
    'Lean forward slightly — helps keep elbows in',
    'Use rope or straight bar; neutral grip (rope) is often more comfortable',
  ],
  contraindications: ['Elbow tendinopathy (lateral)'],
  replacements: [
    { exerciseId: 'skull-crushers',            reason: 'Use if: no cable machine' },
    { exerciseId: 'overhead-tricep-extension', reason: 'Use if: want more long-head emphasis' },
  ],
}

export const EXERCISE_SKULL_CRUSHERS: Exercise = {
  id: 'skull-crushers',
  name: 'EZ-Bar Skull Crushers',
  category: 'isolation',
  muscles: { primary: ['triceps'], secondary: [] },
  equipment: ['ez-bar'],
  videoUrl: yt('skull crushers EZ bar proper form tutorial'),
  warmupCues: [
    '1 warm-up set × 12 at 50%',
    'Gentle elbow flexion stretch before first set',
  ],
  formCues: [
    'Upper arms vertical and stationary throughout',
    'Lower bar to forehead / top of head',
    'Full lockout at top — squeeze triceps',
    'Slow eccentric (3s down) maximises stimulus',
  ],
  contraindications: ['Elbow tendinopathy (medial or lateral)'],
  replacements: [
    { exerciseId: 'tricep-pushdown',           reason: 'Use if: elbow pain on skull crushers' },
    { exerciseId: 'overhead-tricep-extension', reason: 'Use if: want long-head focus with less elbow stress' },
  ],
  safetyNote: 'Elbow pain > 3/10? Switch to pushdown immediately — skull crushers have high elbow torque.',
}

export const EXERCISE_OVERHEAD_TRICEP_EXTENSION: Exercise = {
  id: 'overhead-tricep-extension',
  name: 'Overhead Tricep Extension',
  category: 'isolation',
  muscles: { primary: ['triceps'], secondary: [] },
  equipment: ['dumbbell', 'cable'],
  videoUrl: yt('overhead tricep extension dumbbell or cable tutorial'),
  warmupCues: [
    '1 warm-up set × 15 at 40%',
    'Tricep stretch: arm overhead, elbow bent × 30s each',
  ],
  formCues: [
    'Elbows point straight ahead — don\'t flare',
    'Lower weight behind head, feel stretch at bottom',
    'Full extension at top — squeeze long head',
    'Core braced, no lumbar hyperextension',
  ],
  contraindications: ['Shoulder impingement (overhead position)'],
  replacements: [
    { exerciseId: 'tricep-pushdown', reason: 'Use if: shoulder can\'t tolerate overhead position' },
    { exerciseId: 'skull-crushers',  reason: 'Use if: no cable or comfortable with lying position' },
  ],
}

// ═══════════════════════════════════════════════════════════════════
//  PULL — Back / Biceps
// ═══════════════════════════════════════════════════════════════════

export const EXERCISE_WEIGHTED_PULLUP: Exercise = {
  id: 'weighted-pullup',
  name: 'Weighted Pull-Up',
  category: 'compound',
  muscles: { primary: ['lats', 'upper-back'], secondary: ['biceps', 'rear-delts'] },
  equipment: ['bodyweight'],
  videoUrl: yt('weighted pull up proper form tutorial Jeff Nippard'),
  warmupCues: [
    '2 sets bodyweight pull-ups × submaximal to prime',
    'Band-assisted scapular pull-ups × 10',
    'Hang from bar 20-30s for shoulder decompression',
  ],
  formCues: [
    'Dead hang start — full scapular depression before pulling',
    'Pull elbows toward hips, not just chin over bar',
    'Chest to bar for full ROM',
    'Lower slowly (3s) — eccentric builds more lat width',
  ],
  contraindications: ['Shoulder impingement', 'Elbow tendinopathy'],
  replacements: [
    { exerciseId: 'lat-pulldown', reason: 'Use if: can\'t do 5+ bodyweight pull-ups yet' },
    { exerciseId: 'cable-row',    reason: 'Use if: shoulder pain on overhead pulling' },
  ],
}

export const EXERCISE_LAT_PULLDOWN: Exercise = {
  id: 'lat-pulldown',
  name: 'Lat Pulldown',
  category: 'compound',
  muscles: { primary: ['lats'], secondary: ['upper-back', 'biceps'] },
  equipment: ['cable'],
  videoUrl: yt('lat pulldown proper form tutorial wide grip neutral'),
  warmupCues: [
    '1 warm-up set × 12 at 50%',
    'Dead hang on pull-up bar × 20s to pre-stretch lats',
  ],
  formCues: [
    'Slight lean back (~10-15°) — not a row',
    'Pull bar to upper chest, lead with elbows down and back',
    'Full stretch at top — don\'t truncate the ROM',
    'Slow return (2-3s) for maximum lat tension',
  ],
  contraindications: ['Shoulder impingement (wide overhand grip — try neutral/supinated)'],
  replacements: [
    { exerciseId: 'weighted-pullup', reason: 'Use if: stronger alternative, no cable needed' },
    { exerciseId: 'cable-row',       reason: 'Use if: shoulder pain on overhead pulling' },
  ],
}

export const EXERCISE_BARBELL_ROW: Exercise = {
  id: 'barbell-row',
  name: 'Barbell Bent-Over Row',
  category: 'compound',
  muscles: { primary: ['upper-back', 'lats'], secondary: ['biceps', 'rear-delts', 'erectors'] },
  equipment: ['barbell'],
  videoUrl: yt('barbell bent over row proper form tutorial Alan Thrall'),
  warmupCues: [
    'Cat-cow × 10 to mobilise spine',
    '1 warm-up set at 50% × 8',
    'Hip hinge drill with PVC or broomstick',
  ],
  formCues: [
    'Hinge to ~45° — this is NOT a squat row',
    'Pull to lower sternum / top of abs',
    'Squeeze scapulae at top — hold 1s',
    'Keep lower back neutral — no rounding under load',
  ],
  contraindications: ['Acute lower back pain', 'Disc herniation', 'Lumbar strain'],
  replacements: [
    { exerciseId: 'cable-row',    reason: 'Use if: lower back pain > 3/10 during hinge' },
    { exerciseId: 'lat-pulldown', reason: 'Use if: no barbell / lumbar strain' },
  ],
  safetyNote: 'Lower back pain > 3/10? Sit down and use cable or machine row instead.',
}

export const EXERCISE_CABLE_ROW: Exercise = {
  id: 'cable-row',
  name: 'Seated Cable Row',
  category: 'compound',
  muscles: { primary: ['upper-back', 'lats'], secondary: ['biceps', 'rear-delts'] },
  equipment: ['cable'],
  videoUrl: yt('seated cable row proper form tutorial'),
  warmupCues: [
    '1 warm-up set × 12 at 50%',
    'Cat-cow × 10 before heavy sets',
  ],
  formCues: [
    'Sit tall — do not round lower back to reach forward',
    'Full stretch: shoulders forward, scapulae wide at front',
    'Pull handle to lower ribs / navel',
    'Squeeze scapulae together at full contraction',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'barbell-row',  reason: 'Use if: no cable machine' },
    { exerciseId: 'lat-pulldown', reason: 'Use if: prefer vertical pull' },
  ],
}

export const EXERCISE_FACE_PULL: Exercise = {
  id: 'face-pull',
  name: 'Cable Face Pull',
  category: 'isolation',
  muscles: { primary: ['rear-delts', 'traps'], secondary: ['biceps'] },
  equipment: ['cable'],
  videoUrl: yt('cable face pull proper form rear delt tutorial AthleanX'),
  warmupCues: [
    'Always do face pulls first in any session — shoulder health primer',
    'Use lighter weight — this is a health exercise, not an ego lift',
  ],
  formCues: [
    'Set cable at forehead height',
    'Pull rope to forehead level, elbows flared high',
    'External rotate: "hands behind your head" at peak',
    'Pause 1s at peak contraction',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'lateral-raise', reason: 'Use if: no cable — target side delts instead' },
  ],
}

export const EXERCISE_DB_CURL: Exercise = {
  id: 'db-curl',
  name: 'Dumbbell Bicep Curl',
  category: 'isolation',
  muscles: { primary: ['biceps'], secondary: [] },
  equipment: ['dumbbell'],
  videoUrl: yt('dumbbell bicep curl proper form supination tutorial'),
  warmupCues: [
    '1 light set × 15 at 40%',
    'Wrist flexion/extension stretch × 30s each',
  ],
  formCues: [
    'Fully supinate (palm up) as you curl up',
    'Do NOT swing — elbows stay at sides',
    'Full stretch at bottom — don\'t truncate the bottom ROM',
    'Squeeze hard at peak, lower in 3s',
  ],
  contraindications: ['Distal bicep tendinopathy'],
  replacements: [
    { exerciseId: 'hammer-curl',  reason: 'Use if: wrist pain — neutral grip is more comfortable' },
    { exerciseId: 'cable-curl',   reason: 'Use if: want constant tension through full ROM' },
  ],
}

export const EXERCISE_HAMMER_CURL: Exercise = {
  id: 'hammer-curl',
  name: 'Hammer Curl',
  category: 'isolation',
  muscles: { primary: ['biceps'], secondary: ['brachialis'] },
  equipment: ['dumbbell'],
  videoUrl: yt('hammer curl proper form brachialis tutorial'),
  warmupCues: ['No special warm-up — done after regular curls'],
  formCues: [
    'Neutral grip throughout (thumbs up)',
    'Elbows stay at sides — no swinging',
    'Can be done alternating or simultaneously',
    'Focus on squeezing the brachialis under the bicep',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'db-curl',    reason: 'Use if: want more bicep peak focus' },
    { exerciseId: 'cable-curl', reason: 'Use if: want constant tension' },
  ],
}

export const EXERCISE_CABLE_CURL: Exercise = {
  id: 'cable-curl',
  name: 'Cable Curl',
  category: 'isolation',
  muscles: { primary: ['biceps'], secondary: [] },
  equipment: ['cable'],
  videoUrl: yt('cable curl proper form constant tension tutorial'),
  warmupCues: ['Last bicep exercise — no additional warm-up needed'],
  formCues: [
    'Stand close to cable stack to avoid pulley drag',
    'Keep elbows forward — this creates peak contraction',
    'Constant tension through full ROM is the advantage over dumbbells',
    'Slow 3s eccentric',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'db-curl',     reason: 'Use if: no cable machine' },
    { exerciseId: 'hammer-curl', reason: 'Use if: prefer neutral grip' },
  ],
}

// ═══════════════════════════════════════════════════════════════════
//  LEGS — Quads / Hamstrings / Glutes / Calves
// ═══════════════════════════════════════════════════════════════════

export const EXERCISE_BARBELL_SQUAT: Exercise = {
  id: 'barbell-squat',
  name: 'Barbell Back Squat',
  category: 'compound',
  muscles: { primary: ['quads'], secondary: ['hamstrings', 'glutes', 'erectors'] },
  equipment: ['barbell'],
  videoUrl: yt('barbell back squat proper form tutorial Alan Thrall'),
  warmupCues: [
    '5 min bike or rowing machine',
    'Hip circles × 15 each direction',
    'Goblet squat × 10 (bodyweight or light)',
    '3 warm-up sets: empty bar × 10, 50% × 6, 75% × 3',
  ],
  formCues: [
    'Knees track over toes — push them out',
    'Depth = hip crease below top of knee (parallel or below)',
    'Chest up, slight forward lean is normal',
    'Drive through mid-foot, not toes or heels',
  ],
  contraindications: ['Acute knee pain', 'Acute lower back pain', 'Hip impingement'],
  replacements: [
    { exerciseId: 'leg-press',   reason: 'Use if: knee pain > 3/10 or lower back pain' },
    { exerciseId: 'goblet-squat', reason: 'Use if: form breakdown / need to reduce load significantly' },
  ],
  safetyNote: 'Knee or back pain > 3/10? Move to leg press immediately — reduce ego, protect joints.',
}

export const EXERCISE_GOBLET_SQUAT: Exercise = {
  id: 'goblet-squat',
  name: 'Goblet Squat',
  category: 'compound',
  muscles: { primary: ['quads'], secondary: ['glutes', 'abs'] },
  equipment: ['dumbbell'],
  videoUrl: yt('goblet squat proper form tutorial Dan John'),
  warmupCues: [
    'Perfect substitute for back squat warm-up',
    'Hip flexor stretch × 30s each side',
  ],
  formCues: [
    'Hold DB at chest — acts as counterbalance for upright torso',
    'Elbows inside knees at bottom, push them out',
    'Heels down throughout',
    'Drive up — squeeze glutes at top',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'barbell-squat', reason: 'Use if: ready to progress to barbell' },
    { exerciseId: 'leg-press',     reason: 'Use if: want more quad isolation' },
  ],
}

export const EXERCISE_ROMANIAN_DEADLIFT: Exercise = {
  id: 'romanian-deadlift',
  name: 'Romanian Deadlift (RDL)',
  category: 'compound',
  muscles: { primary: ['hamstrings'], secondary: ['glutes', 'erectors'] },
  equipment: ['barbell'],
  videoUrl: yt('Romanian deadlift proper form RDL tutorial Jeff Nippard'),
  warmupCues: [
    'Hip hinge drill with band around hips × 10',
    'Light RDL with PVC or broomstick to feel the hinge',
    '1 warm-up set at 50% × 8',
  ],
  formCues: [
    'This is a HINGE, not a squat — minimal knee bend',
    'Bar stays close to legs (nearly drags down shins)',
    'Stop when you feel hamstring stretch — for most, mid-shin is enough',
    'Drive hips forward to return, not just standing up',
  ],
  contraindications: ['Acute hamstring strain', 'Acute lower back pain / disc herniation'],
  replacements: [
    { exerciseId: 'leg-curl',   reason: 'Use if: hamstring strain — isolate without loading spine' },
    { exerciseId: 'hip-thrust', reason: 'Use if: lower back pain — glute dominant, low back stress' },
  ],
  safetyNote: 'Sharp lower back pain? Stop immediately. Use leg curl instead until evaluated.',
}

export const EXERCISE_LEG_PRESS: Exercise = {
  id: 'leg-press',
  name: 'Leg Press',
  category: 'compound',
  muscles: { primary: ['quads'], secondary: ['glutes', 'hamstrings'] },
  equipment: ['machine'],
  videoUrl: yt('leg press proper form tutorial foot position'),
  warmupCues: [
    '1 warm-up set × 15 at 50%',
    '5 min bike before pressing',
  ],
  formCues: [
    'Feet mid-plate, hip-width apart',
    'Do NOT lock knees at top — keep soft bend',
    'Lower until ~90° knee angle — don\'t let lower back peel off pad',
    'Higher foot position = more glute / hamstring. Lower = more quad.',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'barbell-squat', reason: 'Use if: no leg press machine' },
    { exerciseId: 'goblet-squat',  reason: 'Use if: no equipment available' },
  ],
}

export const EXERCISE_LEG_CURL: Exercise = {
  id: 'leg-curl',
  name: 'Lying Leg Curl',
  category: 'isolation',
  muscles: { primary: ['hamstrings'], secondary: [] },
  equipment: ['machine'],
  videoUrl: yt('lying leg curl proper form hamstring machine tutorial'),
  warmupCues: [
    '1 warm-up set × 15 at 40%',
    'Standing hamstring stretch × 30s each',
  ],
  formCues: [
    'Pad should rest just above ankles, not on calves',
    'Do NOT raise hips off pad — this is cheating',
    'Full extension at bottom — complete ROM',
    'Slow 3s eccentric — hamstrings are strongest during eccentric',
  ],
  contraindications: ['Acute hamstring strain (Grade 2-3)'],
  replacements: [
    { exerciseId: 'romanian-deadlift', reason: 'Use if: no leg curl machine' },
    { exerciseId: 'hip-thrust',        reason: 'Use if: hamstring is strained — hip thrust is safer' },
  ],
}

export const EXERCISE_LEG_EXTENSION: Exercise = {
  id: 'leg-extension',
  name: 'Leg Extension',
  category: 'isolation',
  muscles: { primary: ['quads'], secondary: [] },
  equipment: ['machine'],
  videoUrl: yt('leg extension machine proper form quad tutorial'),
  warmupCues: [
    '1 warm-up set × 15 at 40%',
    'Quad stretch × 30s each side standing',
  ],
  formCues: [
    'Do NOT swing — controlled movement only',
    'Full extension at top — squeeze quads for 1s',
    'Lower slowly (3s) — eccentric overload is valuable here',
    'Pointed toes = slightly more outer quad. Neutral = even stimulus.',
  ],
  contraindications: ['Acute patellar tendinopathy', 'Acute knee pain'],
  replacements: [
    { exerciseId: 'leg-press',    reason: 'Use if: knee pain on leg extension' },
    { exerciseId: 'goblet-squat', reason: 'Use if: no machine — full quad via squat pattern' },
  ],
  safetyNote: 'Knee pain > 3/10? Switch to leg press — lower shear force on patella.',
}

export const EXERCISE_HIP_THRUST: Exercise = {
  id: 'hip-thrust',
  name: 'Barbell Hip Thrust',
  category: 'compound',
  muscles: { primary: ['glutes'], secondary: ['hamstrings'] },
  equipment: ['barbell'],
  videoUrl: yt('barbell hip thrust proper form glute tutorial Bret Contreras'),
  warmupCues: [
    'Glute bridges × 15 bodyweight to activate',
    '1 warm-up set at 50% × 10',
    'Clam shells × 15 each side',
  ],
  formCues: [
    'Pad on hips, upper back on bench — NOT lower back',
    'Drive hips to full extension — squeeze at top for 2s',
    'Posterior pelvic tilt at top (tuck tailbone)',
    'Chin tucked — looking at ceiling not hips',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'romanian-deadlift', reason: 'Use if: no barbell/bench setup' },
    { exerciseId: 'leg-curl',          reason: 'Use if: hip thrust setup unavailable' },
  ],
}

export const EXERCISE_CALF_RAISE: Exercise = {
  id: 'calf-raise',
  name: 'Standing Calf Raise',
  category: 'isolation',
  muscles: { primary: ['calves'], secondary: [] },
  equipment: ['machine', 'bodyweight'],
  videoUrl: yt('calf raise proper form full range of motion tutorial'),
  warmupCues: [
    'Calf stretch × 45s each (bent and straight knee)',
    '1 warm-up set × 20 bodyweight',
  ],
  formCues: [
    'FULL range — all the way down (stretch) to all the way up',
    'Pause 1s at top — squeeze calf hard',
    'Most people cut the bottom ROM — don\'t',
    'Slow eccentric (3s down) for max mechanical tension',
  ],
  contraindications: ['Achilles tendinopathy — reduce range, no deep stretch'],
  replacements: [],
}

// ═══════════════════════════════════════════════════════════════════
//  MACHINES — Chest / Shoulders (new in M4)
// ═══════════════════════════════════════════════════════════════════

export const EXERCISE_CHEST_PRESS_MACHINE: Exercise = {
  id: 'chest-press-machine',
  name: 'Chest Press Machine',
  category: 'compound',
  muscles: { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
  equipment: ['machine'],
  videoUrl: yt('chest press machine proper form tutorial seat adjustment'),
  warmupCues: [
    'Adjust seat so handles align with mid-chest at start position',
    '1 warm-up set × 12 at 50% — feel where the stretch is',
    'Shoulder circles × 10 each direction before loading up',
  ],
  formCues: [
    'Retract and depress scapula before every rep — don\'t shrug',
    'Back flat against the pad throughout — no arching away',
    'Drive handles straight out, slight squeeze at lockout',
    'Return under control (2-3s) — don\'t let the stack slam',
  ],
  contraindications: ['Shoulder impingement', 'AC joint pain'],
  replacements: [
    { exerciseId: 'incline-chest-press-machine', reason: 'Use if: flat press aggravates shoulder — incline reduces impingement risk' },
    { exerciseId: 'db-bench-press',              reason: 'Use if: no machine — dumbbell allows natural path' },
  ],
  safetyNote: 'Shoulder pain > 3/10? Widen grip, reduce weight, or switch to incline machine immediately.',
}

export const EXERCISE_INCLINE_CHEST_PRESS_MACHINE: Exercise = {
  id: 'incline-chest-press-machine',
  name: 'Incline Chest Press Machine',
  category: 'compound',
  muscles: { primary: ['chest'], secondary: ['front-delts', 'triceps'] },
  equipment: ['machine'],
  videoUrl: yt('incline chest press machine proper form upper chest tutorial'),
  warmupCues: [
    'Adjust seat so handles align with upper chest / clavicle',
    '1 warm-up set × 12 at 40%',
    'Gentle chest-door stretch 20s before working sets',
  ],
  formCues: [
    'Lean back into pad — do NOT round forward to reach handles',
    'Drive handles up and very slightly inward',
    'Avoid full lockout — maintain chest tension throughout',
    'Slow controlled descent (2-3s) — upper chest stretch at bottom',
  ],
  contraindications: ['Shoulder impingement (overhead pressing position)'],
  replacements: [
    { exerciseId: 'chest-press-machine', reason: 'Use if: incline angle aggravates shoulder — use flat machine' },
    { exerciseId: 'incline-db-press',    reason: 'Use if: no incline machine — dumbbells allow ROM adjustment' },
  ],
  safetyNote: 'Upper shoulder pain? Lower incline angle or switch to flat chest press machine.',
}

export const EXERCISE_SHOULDER_PRESS_MACHINE: Exercise = {
  id: 'shoulder-press-machine',
  name: 'Shoulder Press Machine',
  category: 'compound',
  muscles: { primary: ['front-delts', 'side-delts'], secondary: ['triceps', 'traps'] },
  equipment: ['machine'],
  videoUrl: yt('shoulder press machine proper form seated delt tutorial'),
  warmupCues: [
    'Adjust seat so handles start at shoulder height',
    'Band pull-aparts × 15 before pressing',
    '1 warm-up set × 12 at 40% — groove the path',
  ],
  formCues: [
    'Back flat against pad — do NOT hyperextend lower back',
    'Press handles directly overhead, keep elbows under wrists',
    'Stop just short of full lockout — keep delts under tension',
    'Return slowly (2s) — don\'t lose shoulder position',
  ],
  contraindications: ['Shoulder impingement', 'Rotator cuff pathology', 'AC joint pain', 'Cervical spine issues'],
  replacements: [
    { exerciseId: 'cable-lateral-raise', reason: 'Use if: pressing causes shoulder pain — isolation only, no impingement' },
    { exerciseId: 'face-pull',           reason: 'Use if: all pressing is painful — external rotation health work' },
  ],
  safetyNote: 'Any shoulder pain > 3/10? Drop to cable lateral raises + face pulls only. No overhead pressing.',
}

// ═══════════════════════════════════════════════════════════════════
//  MACHINES — Back (new in M4)
// ═══════════════════════════════════════════════════════════════════

export const EXERCISE_CABLE_LATERAL_RAISE: Exercise = {
  id: 'cable-lateral-raise',
  name: 'Cable Lateral Raise',
  category: 'isolation',
  muscles: { primary: ['side-delts'], secondary: ['traps'] },
  equipment: ['cable'],
  videoUrl: yt('cable lateral raise proper form constant tension side delt tutorial'),
  warmupCues: [
    'Set cable at hip height — single D-handle attachment',
    '1 very light set × 20 each side to prime the delts',
    'Stand with slight forward lean (~10°) for better delt isolation',
  ],
  formCues: [
    'Stand side-on to the stack, cable crosses in front of body',
    'Raise arm to shoulder height — lead with the elbow, not the wrist',
    'Pinky slightly higher than thumb at the top ("pour out a cup")',
    'Lower slowly (2-3s) — cable keeps constant tension unlike dumbbells',
  ],
  contraindications: ['Shoulder impingement with heavy loading'],
  replacements: [
    { exerciseId: 'lateral-raise', reason: 'Use if: no single-cable station — dumbbell version' },
    { exerciseId: 'face-pull',     reason: 'Use if: lateral raise aggravates shoulder — rear delt + health focus' },
  ],
}

export const EXERCISE_CHEST_SUPPORTED_ROW: Exercise = {
  id: 'chest-supported-row',
  name: 'Chest-Supported Row',
  category: 'compound',
  muscles: { primary: ['upper-back', 'lats'], secondary: ['biceps', 'rear-delts'] },
  equipment: ['machine'],
  videoUrl: yt('chest supported row machine proper form upper back tutorial'),
  warmupCues: [
    'Adjust chest pad height — torso fully supported, no gap',
    '1 warm-up set × 12 at 50%',
    'Shoulder blade retraction drill × 10 before loading',
  ],
  formCues: [
    'Chest pressed firmly against pad throughout — zero lower back involvement',
    'Pull handles to lower ribs, elbows track close to torso',
    'Squeeze shoulder blades together at peak — hold 1s',
    'Let arms reach full extension at bottom — scapulae protract for full stretch',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'cable-row',    reason: 'Use if: no chest-supported machine — seated cable row' },
    { exerciseId: 'lat-pulldown', reason: 'Use if: prefer vertical pull — lat pulldown' },
  ],
  safetyNote: 'Chest-supported = ZERO lower back load. This is the safest row for anyone with back history.',
}

// ═══════════════════════════════════════════════════════════════════
//  MACHINES — Legs (new in M4)
// ═══════════════════════════════════════════════════════════════════

export const EXERCISE_SEATED_LEG_CURL: Exercise = {
  id: 'seated-leg-curl',
  name: 'Seated Leg Curl',
  category: 'isolation',
  muscles: { primary: ['hamstrings'], secondary: [] },
  equipment: ['machine'],
  videoUrl: yt('seated leg curl machine proper form hamstring stretch tutorial'),
  warmupCues: [
    '1 warm-up set × 12 at 40%',
    'Standing hamstring stretch × 30s each leg',
    'Seated version allows greater hip flexion = deeper hamstring stretch than lying curl',
  ],
  formCues: [
    'Adjust ankle pad to just above the ankle — not on the calf',
    'Back flat against the seat pad, hips pushed back',
    'Curl until heel nearly touches under the seat — full ROM',
    'Slow 3s eccentric — fight the weight back up',
  ],
  contraindications: ['Acute hamstring strain Grade 2-3'],
  replacements: [
    { exerciseId: 'leg-curl',          reason: 'Use if: only lying leg curl available' },
    { exerciseId: 'romanian-deadlift', reason: 'Use if: no leg curl machine — loaded hamstring stretch' },
  ],
  safetyNote: 'Hamstring pull or cramping? Reduce ROM and weight. Sharp pain → stop immediately.',
}

export const EXERCISE_HIP_ABDUCTION: Exercise = {
  id: 'hip-abduction',
  name: 'Hip Abduction Machine',
  category: 'isolation',
  muscles: { primary: ['glutes'], secondary: [] },
  equipment: ['machine'],
  videoUrl: yt('hip abduction machine proper form glute med tutorial'),
  warmupCues: [
    'Set thigh pads at a comfortable starting width — not too narrow',
    '1 warm-up set × 20 at very light weight',
    'Clam shells × 15 each side as a glute-med primer',
  ],
  formCues: [
    'Sit upright with full back support — do NOT lean to cheat reps',
    'Push knees OUTWARD against the pads — feel the glute med contracting',
    'Do NOT use momentum — no bouncing or swinging',
    'Squeeze glutes at maximum width, hold 1s, return under control',
  ],
  contraindications: ['Hip labral tear — consult physio before loading'],
  replacements: [
    { exerciseId: 'hip-thrust', reason: 'Use if: no machine — barbell hip thrust for glute activation' },
    { exerciseId: 'calf-raise', reason: 'Use if: substituting — add calf volume instead' },
  ],
}

// ═══════════════════════════════════════════════════════════════════
//  CORE — Anti-rotation + Stability (new in M4)
// ═══════════════════════════════════════════════════════════════════

export const EXERCISE_PALLOF_PRESS: Exercise = {
  id: 'pallof-press',
  name: 'Pallof Press',
  category: 'compound',
  muscles: { primary: ['abs', 'erectors'], secondary: ['glutes'] },
  equipment: ['cable'],
  videoUrl: yt('pallof press proper form anti rotation core cable tutorial'),
  warmupCues: [
    'Set cable at chest height — D-handle or short bar',
    'Start very light — this is ANTI-ROTATION work, not a pressing strength exercise',
    'Pain rule: zero pain expected. If core cramping, stop.',
  ],
  formCues: [
    'Stand sideways to the cable stack, feet shoulder-width apart, slight knee bend',
    'Hold handle at chest with both hands, then PRESS OUT to arm extension',
    'Core HARD — resist any rotation toward the cable',
    'Return hands to chest. That\'s 1 rep. Complete all reps, then switch sides.',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'side-plank', reason: 'Use if: no cable — side plank builds same lateral anti-rotation strength' },
    { exerciseId: 'dead-bug',   reason: 'Use if: want supine core work — anti-extension pattern' },
  ],
}

export const EXERCISE_SIDE_PLANK: Exercise = {
  id: 'side-plank',
  name: 'Side Plank',
  category: 'bodyweight',
  muscles: { primary: ['abs', 'erectors'], secondary: ['glutes'] },
  equipment: ['bodyweight'],
  videoUrl: yt('side plank proper form lateral core stability tutorial'),
  warmupCues: [
    'Do after machine work — no pre-warm-up needed',
    'Start from knees if the full version is too challenging',
  ],
  formCues: [
    'Body forms a perfectly straight line head to heels — no hip sagging',
    'Supporting elbow directly below shoulder',
    'Stack feet OR stagger front-to-back for balance',
    'Breathe steadily. Hold for prescribed time, then switch sides.',
  ],
  contraindications: ['Shoulder impingement on the supporting arm'],
  replacements: [
    { exerciseId: 'pallof-press', reason: 'Use if: shoulder can\'t support bodyweight — cable anti-rotation instead' },
    { exerciseId: 'dead-bug',     reason: 'Use if: shoulder pain — supine anti-extension core work' },
  ],
}

export const EXERCISE_BIRD_DOG: Exercise = {
  id: 'bird-dog',
  name: 'Bird Dog',
  category: 'bodyweight',
  muscles: { primary: ['erectors', 'abs'], secondary: ['glutes'] },
  equipment: ['bodyweight'],
  videoUrl: yt('bird dog exercise proper form core stability lumbar tutorial'),
  warmupCues: [
    'Excellent warm-up for any session — activates deep core + erectors',
    'Use as active rest between heavy sets if desired',
  ],
  formCues: [
    'Start on hands and knees — wrists under shoulders, knees under hips',
    'Brace core FIRST (think: someone about to punch your stomach)',
    'Extend OPPOSITE arm + leg simultaneously — do NOT rotate the hips',
    'Hold 2s at extension. Return under control. Alternate sides.',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'dead-bug',     reason: 'Use if: wrist pain on the floor — supine version same movement pattern' },
    { exerciseId: 'pallof-press', reason: 'Use if: floor work unavailable — standing anti-rotation' },
  ],
}

export const EXERCISE_DEAD_BUG: Exercise = {
  id: 'dead-bug',
  name: 'Dead Bug',
  category: 'bodyweight',
  muscles: { primary: ['abs', 'hip-flexors'], secondary: ['erectors'] },
  equipment: ['bodyweight'],
  videoUrl: yt('dead bug exercise proper form anti extension core tutorial'),
  warmupCues: [
    'Done at end of session — no additional warm-up needed',
    'This is the safest core exercise for anyone with back history',
  ],
  formCues: [
    'Lie on back, arms pointing at ceiling, knees bent at 90° (tabletop position)',
    'EXHALE fully and press lower back INTO the floor — hold this the entire set',
    'Lower opposite arm + leg to just above the floor',
    'Return before letting lower back lift. NEVER lose lumbar contact with floor.',
  ],
  contraindications: [],
  replacements: [
    { exerciseId: 'bird-dog',     reason: 'Use if: prefer quadruped position — same anti-extension pattern' },
    { exerciseId: 'pallof-press', reason: 'Use if: standing core work preferred' },
  ],
  safetyNote: 'If lower back lifts off floor → you\'ve gone too far. Reduce range of motion.',
}

// ═══════════════════════════════════════════════════════════════════
//  REGISTRY
// ═══════════════════════════════════════════════════════════════════

export const EXERCISES: Exercise[] = [
  // ── Machine: Chest / Shoulders (M4 primary program exercises)
  EXERCISE_CHEST_PRESS_MACHINE,
  EXERCISE_INCLINE_CHEST_PRESS_MACHINE,
  EXERCISE_SHOULDER_PRESS_MACHINE,
  EXERCISE_CABLE_LATERAL_RAISE,
  // ── Machine: Back (M4 primary program exercises)
  EXERCISE_CHEST_SUPPORTED_ROW,
  // ── Machine: Legs (M4 primary program exercises)
  EXERCISE_SEATED_LEG_CURL,
  EXERCISE_HIP_ABDUCTION,
  // ── Core (M4 cardio + core day)
  EXERCISE_PALLOF_PRESS,
  EXERCISE_SIDE_PLANK,
  EXERCISE_BIRD_DOG,
  EXERCISE_DEAD_BUG,
  // ── Free-weight Push (kept as replacements / Normal advanced)
  EXERCISE_BARBELL_BENCH_PRESS,
  EXERCISE_OVERHEAD_PRESS,
  EXERCISE_INCLINE_DB_PRESS,
  EXERCISE_DB_BENCH_PRESS,
  EXERCISE_LATERAL_RAISE,
  EXERCISE_TRICEP_PUSHDOWN,
  EXERCISE_SKULL_CRUSHERS,
  EXERCISE_OVERHEAD_TRICEP_EXTENSION,
  // ── Free-weight Pull
  EXERCISE_WEIGHTED_PULLUP,
  EXERCISE_LAT_PULLDOWN,
  EXERCISE_BARBELL_ROW,
  EXERCISE_CABLE_ROW,
  EXERCISE_FACE_PULL,
  EXERCISE_DB_CURL,
  EXERCISE_HAMMER_CURL,
  EXERCISE_CABLE_CURL,
  // ── Free-weight Legs
  EXERCISE_BARBELL_SQUAT,
  EXERCISE_GOBLET_SQUAT,
  EXERCISE_ROMANIAN_DEADLIFT,
  EXERCISE_LEG_PRESS,
  EXERCISE_LEG_CURL,
  EXERCISE_LEG_EXTENSION,
  EXERCISE_HIP_THRUST,
  EXERCISE_CALF_RAISE,
]

const MAP = new Map(EXERCISES.map((e) => [e.id, e]))

export function getExerciseById(id: string): Exercise | undefined {
  return MAP.get(id)
}

export function getExercisesByIds(ids: string[]): Exercise[] {
  return ids.flatMap((id) => {
    const e = MAP.get(id)
    return e ? [e] : []
  })
}

/** Fallback when exercise ID not in library — returns a named stub. */
export function exerciseOrStub(id: string): Exercise {
  return (
    MAP.get(id) ?? {
      id,
      name: id.replace(/-/g, ' '),
      category: 'compound',
      muscles: { primary: [], secondary: [] },
      equipment: [],
      videoUrl: '',
      warmupCues: [],
      formCues: [],
      contraindications: [],
      replacements: [],
    }
  )
}
