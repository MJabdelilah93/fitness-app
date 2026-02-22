# FitTrack — Personal Fitness PWA

A fully offline-capable Progressive Web App for tracking gym workouts, daily steps, body metrics, and nutrition. Built with React 18, TypeScript, and Dexie (IndexedDB) — no backend, no account required.

---

## Features

### Workout Tracking
- Pre-built Normal (5-day) and Ramadan (4-day) training programs
- Live workout screen with set/rep/weight/RIR logging
- Rest timer with auto-start after each completed set
- Exercise replacement (swap any exercise mid-workout)
- Finish modal capturing pain score, RPE, mood, and notes

### Smart Scheduling
- Auto-detects today's session (gym vs. steps day) from the weekly schedule
- Configurable week start day — shift the entire rotation to begin on any day
- Auto-switches from Ramadan to Normal mode when `ramadanEndDate` passes

### Metrics
- **Steps** — daily log with weekly bar chart and goal ring
- **Body** — weight + body fat tracking with trend line chart
- **Nutrition** — meal-by-meal targets adjusted for Normal / Ramadan mode

### Dashboard
- Workout streak and weekly adherence stats
- Volume-over-time chart (Recharts)
- Per-muscle-group frequency summary

### Reminders
- In-app dismissible banners for workout, steps, and weigh-in
- Browser Notification API integration (no push server — fires via `setTimeout` while the app is open)
- Configurable reminder times and weigh-in day

### Settings
- kg / lbs weight unit toggle
- Normal / Ramadan mode with Ramadan end date picker
- Daily step goal
- Gym week start day selector
- Data backup (export / import JSON)
- Notification enable/disable with time pickers

---

## Tech Stack

| Layer | Library |
|---|---|
| UI framework | React 18 + TypeScript |
| Routing | React Router v6 |
| Local database | Dexie v3 (IndexedDB wrapper) |
| Reactive queries | dexie-react-hooks (`useLiveQuery`) |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Tailwind CSS v3 |
| Build | Vite 5 |
| PWA | vite-plugin-pwa (Workbox) |
| Deployment | Cloudflare Workers (static assets) |

All data is stored locally in IndexedDB. Nothing is sent to any server.

---

## Project Structure

```
src/
├── components/
│   ├── layout/        # AppShell, BottomNav, Header, OnboardingGuard
│   ├── ui/            # Button, Badge, Card, Modal, ReminderBanner, …
│   └── workout/       # ExerciseCard, SetRow, RestTimer, FinishModal, …
├── data/
│   ├── exercises.ts   # Exercise catalogue with muscle groups
│   ├── programs.ts    # Normal + Ramadan weekly programs
│   └── nutritionTargets.ts
├── db/
│   └── db.ts          # Dexie schema (v2) + updateSettings helper
├── hooks/
│   ├── useSettings.ts
│   ├── useTodayPlan.ts        # Gym/steps detection + start-day offset
│   ├── useAutoModeSwitch.ts   # Auto Ramadan → Normal on end date
│   └── useReminderBanners.ts  # Reactive banner list
├── pages/
│   ├── OnboardingPage.tsx
│   ├── HomePage.tsx
│   ├── WorkoutPage.tsx
│   ├── MetricsPage.tsx
│   ├── DashboardPage.tsx
│   └── SettingsPage.tsx
├── types/index.ts
└── utils/
    ├── dateUtils.ts
    ├── units.ts          # kg ↔ lbs conversion
    ├── notifications.ts  # Browser Notification API helpers
    └── backup.ts         # JSON export / import
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev

# Type-check
npx tsc --noEmit

# Production build
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment (Cloudflare Workers)

The project is deployed as a Cloudflare Worker serving static assets. SPA routing is handled by `not_found_handling: "single-page-application"` in `wrangler.jsonc` — no `_redirects` file needed.

### Manual deploy

```bash
npm run build
npx wrangler deploy
```

### CI deploy (GitHub → Cloudflare)

The Cloudflare Workers dashboard connects to GitHub. On every push to `main`:

1. Build command: `npm run build`
2. Deploy command: `npx wrangler deploy`

The live URL is `https://fitness-app.<account>.workers.dev`.

---

## PWA Installation

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap **⋮ → Add to Home screen**
3. Tap **Add**

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Tap **Add**

Once installed, the app works fully offline after the first load (Workbox precaches all assets).

---

## Data & Privacy

- All data lives in your browser's IndexedDB — never leaves your device
- Use **Settings → Backup** to export a JSON snapshot and restore it on another device
- Clearing browser data / site data will erase all logs

---

## License

MIT
