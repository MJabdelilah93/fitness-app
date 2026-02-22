import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell }        from './components/layout/AppShell'
import { OnboardingGuard } from './components/layout/OnboardingGuard'
import { OnboardingPage }  from './pages/OnboardingPage'
import { HomePage }        from './pages/HomePage'
import { WorkoutPage }     from './pages/WorkoutPage'
import { MetricsPage }     from './pages/MetricsPage'
import { DashboardPage }   from './pages/DashboardPage'
import { SettingsPage }    from './pages/SettingsPage'

const router = createBrowserRouter([
  // ── Onboarding (no shell, no guard) ─────────────────────────────
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },

  // ── Main app (guarded — redirects to /onboarding if needed) ─────
  {
    path: '/',
    element: (
      <OnboardingGuard>
        <AppShell />
      </OnboardingGuard>
    ),
    children: [
      { index: true,       element: <HomePage />      },
      { path: 'workout',   element: <WorkoutPage />   },
      { path: 'metrics',   element: <MetricsPage />   },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'settings',  element: <SettingsPage />  },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
