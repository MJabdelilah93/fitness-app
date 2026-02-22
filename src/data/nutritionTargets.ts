/**
 * Nutrition Targets + Meal Templates — Milestone 4.
 *
 * These are PRESCRIPTIVE guidelines shown in the app, not user-editable.
 * User logs their own values in MetricsPage → Nutrition tab.
 *
 * Assumptions (adjust via SettingsPage in a future milestone):
 *   Body weight: ~80–85 kg
 *   Goal:        body recomposition (muscle maintenance + slow fat loss)
 *   Protein:     2.4 g/kg → ~200 g/day (rounded, easy to remember)
 *   Calories:
 *     Normal mode   — 2 400–2 700 kcal (slight deficit to maintenance)
 *     Ramadan mode  — 2 000–2 400 kcal (lower due to condensed eating window)
 *
 * Ramadan notes:
 *   – Two meals only (Suhoor + Iftar window). No grazing throughout the day.
 *   – Protein distributed across Suhoor, Iftar, post-workout, and late dinner.
 *   – Prioritise easily-digested, whole-food protein sources.
 *   – Hydration: aim for 3–4 L water between Iftar and Suhoor.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MealTemplate {
  /** Internal identifier */
  id:          string
  /** Display name, e.g. "Suhoor (Pre-Dawn)" */
  name:        string
  /** Approximate calorie range for this meal */
  caloriesMin: number
  caloriesMax: number
  /** Approximate protein target for this meal (g) */
  proteinG:    number
  /** Short timing guidance */
  timing:      string
  /** 2–4 concrete food suggestions */
  suggestions: string[]
  /** Optional coaching note */
  note?:       string
}

export interface NutritionTarget {
  mode:           'normal' | 'ramadan'
  caloriesMin:    number
  caloriesMax:    number
  proteinG:       number        // daily total
  carbsGMin:      number        // daily range
  carbsGMax:      number
  fatGMin:        number
  fatGMax:        number
  waterMlMin:     number        // daily hydration minimum
  /** Key rule shown prominently in the UI */
  topRule:        string
  meals:          MealTemplate[]
}

// ─── Normal Mode ──────────────────────────────────────────────────────────────

export const NORMAL_NUTRITION: NutritionTarget = {
  mode:        'normal',
  caloriesMin: 2400,
  caloriesMax: 2700,
  proteinG:    200,
  carbsGMin:   220,
  carbsGMax:   280,
  fatGMin:     65,
  fatGMax:     85,
  waterMlMin:  3000,
  topRule:     'Hit 200 g protein every day — everything else is secondary.',
  meals: [
    {
      id:          'normal-breakfast',
      name:        'Breakfast',
      caloriesMin: 500,
      caloriesMax: 650,
      proteinG:    45,
      timing:      '30–60 min after waking',
      suggestions: [
        '4 whole eggs + 2 egg whites scrambled + 2 slices wholegrain toast',
        '200 g Greek yoghurt (2%) + 40 g oats + 1 banana',
        '200 g cottage cheese + 50 g granola + mixed berries',
      ],
      note: 'Prioritise protein and complex carbs. Avoid high-fat + high-carb combos at this meal.',
    },
    {
      id:          'normal-preworkout',
      name:        'Pre-Workout Meal',
      caloriesMin: 350,
      caloriesMax: 450,
      proteinG:    35,
      timing:      '60–90 min before training',
      suggestions: [
        '150 g chicken breast + 120 g cooked white rice + salad',
        '200 g tuna + 1 medium potato + cucumber',
        '150 g lean mince (5% fat) + 80 g pasta + tomato sauce',
      ],
      note: 'Moderate carbs, moderate protein, LOW fat (fat slows gastric emptying).',
    },
    {
      id:          'normal-postworkout',
      name:        'Post-Workout Meal',
      caloriesMin: 500,
      caloriesMax: 650,
      proteinG:    50,
      timing:      'Within 60 min of finishing training',
      suggestions: [
        '200 g chicken breast + 150 g cooked white rice + vegetables',
        '200 g salmon + large sweet potato + broccoli',
        '30 g whey protein shake + 150 g cooked pasta + bolognese',
      ],
      note: 'Biggest protein hit of the day. White rice or potato is preferred — fast carbs replenish glycogen.',
    },
    {
      id:          'normal-lunch',
      name:        'Lunch',
      caloriesMin: 500,
      caloriesMax: 650,
      proteinG:    40,
      timing:      'Midday (if not your pre- or post-workout slot)',
      suggestions: [
        '200 g grilled chicken + large mixed salad + olive oil dressing',
        '200 g canned tuna + 100 g quinoa + roasted veggies',
        '3 turkey + avocado wraps (wholegrain tortillas)',
      ],
    },
    {
      id:          'normal-dinner',
      name:        'Dinner',
      caloriesMin: 500,
      caloriesMax: 650,
      proteinG:    40,
      timing:      'Evening, 2–3 h before bed',
      suggestions: [
        '200 g beef steak (sirloin) + large salad + sweet potato',
        '200 g white fish (cod/tilapia) + roasted vegetables + brown rice',
        '200 g shrimp stir-fry + 100 g cooked noodles + broccoli',
      ],
      note: 'Aim for complex carbs + veg. Avoid large desserts — saves calories without sacrificing muscle.',
    },
    {
      id:          'normal-snack',
      name:        'Snack / Shake',
      caloriesMin: 150,
      caloriesMax: 300,
      proteinG:    25,
      timing:      'Mid-morning or mid-afternoon if needed',
      suggestions: [
        '30 g whey protein + 250 ml semi-skimmed milk',
        '200 g cottage cheese + handful of almonds',
        '2 rice cakes + 2 tbsp peanut butter + 1 scoop protein powder in water',
      ],
    },
  ],
}

// ─── Ramadan Mode ─────────────────────────────────────────────────────────────

export const RAMADAN_NUTRITION: NutritionTarget = {
  mode:        'ramadan',
  caloriesMin: 2000,
  caloriesMax: 2400,
  proteinG:    200,
  carbsGMin:   180,
  carbsGMax:   240,
  fatGMin:     55,
  fatGMax:     75,
  waterMlMin:  3500,   // higher — compensates for daytime dehydration
  topRule:     'Protein is the priority. Distribute 200 g across Suhoor, Iftar, and post-workout.',
  meals: [
    {
      id:          'ramadan-suhoor',
      name:        'Suhoor (Pre-Dawn)',
      caloriesMin: 600,
      caloriesMax: 750,
      proteinG:    55,
      timing:      '30–60 min before Fajr',
      suggestions: [
        '4 whole eggs scrambled + 2 slices wholegrain toast + 200 g Greek yoghurt',
        '200 g cottage cheese + 60 g oats + 1 banana + handful of almonds',
        '150 g chicken breast + 100 g brown rice + salad + 30 g peanut butter',
      ],
      note:
        'This is your most important meal. Load up on:\n'
        + '• Slow-digesting carbs (oats, brown rice, wholegrain bread) — sustains energy longer\n'
        + '• Casein-rich proteins (cottage cheese, Greek yoghurt) — slow release over the fast\n'
        + '• Healthy fats (nut butter, nuts) — further slows digestion\n'
        + '• 750–1 000 ml water',
    },
    {
      id:          'ramadan-iftar-break',
      name:        'Iftar — Break Fast',
      caloriesMin: 200,
      caloriesMax: 350,
      proteinG:    15,
      timing:      'Immediately at Maghrib (sunset)',
      suggestions: [
        '3–5 dates + 500 ml water + small bowl of soup or broth',
        '3 dates + 250 ml laban (buttermilk) + handful of mixed nuts',
        '3–5 dates + 500 ml water + 1 small banana',
      ],
      note:
        'Do NOT eat a large meal immediately. Dates replenish glycogen fast. '
        + 'Drink 500 ml water right away. Wait 15–20 min before the main Iftar meal.',
    },
    {
      id:          'ramadan-iftar-main',
      name:        'Iftar — Main Meal',
      caloriesMin: 700,
      caloriesMax: 900,
      proteinG:    60,
      timing:      '15–30 min after breaking fast',
      suggestions: [
        '250 g grilled chicken + large portion of roasted veg + 150 g cooked white rice',
        '250 g salmon + sweet potato + salad with olive oil',
        '250 g lean beef/lamb + 120 g couscous + grilled vegetables',
      ],
      note: 'Biggest meal of the day. Prioritise lean protein + complex carbs. Keep fried foods minimal.',
    },
    {
      id:          'ramadan-postworkout',
      name:        'Post-Workout Meal',
      caloriesMin: 400,
      caloriesMax: 500,
      proteinG:    45,
      timing:      'Within 45 min of finishing training (post-Iftar session)',
      suggestions: [
        '30 g whey protein shake + 150 g cooked white rice + vegetables',
        '200 g chicken breast + 1 medium potato + 500 ml water',
        '200 g tuna + 100 g pasta + tomato-based sauce',
      ],
      note: 'Train 2–3 h after Iftar. Fast carbs (white rice, potato) are ideal for glycogen reload.',
    },
    {
      id:          'ramadan-late-dinner',
      name:        'Late Dinner / Pre-Sleep Snack',
      caloriesMin: 350,
      caloriesMax: 450,
      proteinG:    35,
      timing:      '1–2 h before Suhoor, or before sleep',
      suggestions: [
        '200 g cottage cheese + 1 tbsp honey + 250 ml milk',
        '4 boiled eggs + 1 slice wholegrain bread + 250 ml milk',
        '200 g Greek yoghurt + 30 g almonds + small handful of berries',
      ],
      note:
        'Casein-rich foods (cottage cheese, Greek yoghurt) digest slowly — ideal before the long overnight fast. '
        + 'Drink another 500–750 ml water at this meal.',
    },
  ],
}

// ─── Public API ───────────────────────────────────────────────────────────────

const ALL_TARGETS: NutritionTarget[] = [NORMAL_NUTRITION, RAMADAN_NUTRITION]

export function getNutritionTarget(
  mode: 'normal' | 'ramadan',
): NutritionTarget {
  return ALL_TARGETS.find((t) => t.mode === mode) ?? NORMAL_NUTRITION
}
