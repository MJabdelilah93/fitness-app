import { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSettings } from '../../hooks/useSettings'
import { PageSpinner } from '../ui/Spinner'

/**
 * Wraps the main app shell.
 * Redirects to /onboarding if the DB has no settings row
 * (i.e., first launch or data wipe).
 */
export function OnboardingGuard({ children }: { children: ReactNode }) {
  const { settings, isLoading } = useSettings()

  // settings is undefined (loading), null (no row), or UserSettings
  if (isLoading || settings === undefined) return <PageSpinner />

  if (settings === null || !settings.onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }

  return <>{children}</>
}
