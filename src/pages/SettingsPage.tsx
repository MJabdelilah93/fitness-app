import { useState, useEffect } from 'react'
import {
  Moon, Sun, Footprints, User, Scale,
  Download, Upload, Trash2, ChevronDown, ChevronUp,
  Bell, BellOff,
} from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { ConfirmModal } from '../components/ui/Modal'
import { PageSpinner } from '../components/ui/Spinner'
import { cn } from '../utils/cn'
import { downloadBackup, pickJsonFile, restoreBackup, BackupValidationError } from '../utils/backup'
import { clearAllData } from '../db/db'
import { requestPermission, notificationsSupported } from '../utils/notifications'
import type { WeightUnit, DayOfWeek } from '../types'

const DOW_SHORT: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
const DOW_LABEL: Record<DayOfWeek, string> = {
  MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun',
}

export function SettingsPage() {
  const { settings, updateSettings, isLoading } = useSettings()

  // Local controlled state (avoids live-query flickering on every keystroke)
  const [name,            setName]           = useState('')
  const [stepGoal,        setStepGoal]       = useState('10000')
  const [ramadanEnd,      setRamadanEnd]     = useState('2025-03-20')
  const [workoutTime,     setWorkoutTime]    = useState('18:00')
  const [stepsTime,       setStepsTime]      = useState('20:00')
  const [notifBlocked,    setNotifBlocked]   = useState(false)

  // Modal states
  const [showWipe,      setShowWipe]      = useState(false)
  const [showImport,    setShowImport]    = useState(false)
  const [importFile,    setImportFile]    = useState<string | null>(null)
  const [importError,   setImportError]   = useState<string | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [dangerOpen,    setDangerOpen]    = useState(false)

  useEffect(() => {
    if (!settings) return
    setName(settings.displayName ?? '')
    setStepGoal(String(settings.stepGoalPerDay ?? 10_000))
    setRamadanEnd(settings.ramadanEndDate)
    setWorkoutTime(settings.notifyWorkoutTime ?? '18:00')
    setStepsTime(settings.notifyStepsTime ?? '20:00')
  }, [settings])

  if (isLoading) return <PageSpinner />
  if (!settings)  return null

  // ── Save helpers ────────────────────────────────────────────────

  const saveName       = () => updateSettings({ displayName:    name.trim() })
  const saveStepGoal   = () => {
    const n = parseInt(stepGoal, 10)
    if (!isNaN(n) && n >= 100) updateSettings({ stepGoalPerDay: n })
  }
  const saveRamadanEnd  = () => { if (ramadanEnd) updateSettings({ ramadanEndDate: ramadanEnd }) }
  const saveWorkoutTime = () => { if (workoutTime) updateSettings({ notifyWorkoutTime: workoutTime }) }
  const saveStepsTime   = () => { if (stepsTime) updateSettings({ notifyStepsTime: stepsTime }) }

  // ── Notifications toggle ─────────────────────────────────────────

  const handleNotifToggle = async () => {
    if (settings.notificationsEnabled) {
      // Turn off
      updateSettings({ notificationsEnabled: false })
      setNotifBlocked(false)
      return
    }
    if (!notificationsSupported()) {
      setNotifBlocked(true)
      return
    }
    const result = await requestPermission()
    if (result === 'granted') {
      updateSettings({ notificationsEnabled: true })
      setNotifBlocked(false)
    } else {
      setNotifBlocked(true)
    }
  }

  // ── Export ──────────────────────────────────────────────────────

  const handleExport = async () => {
    setExportLoading(true)
    try { await downloadBackup() }
    finally { setExportLoading(false) }
  }

  // ── Import ──────────────────────────────────────────────────────

  const handlePickImport = async () => {
    setImportError(null)
    try {
      const text = await pickJsonFile()
      setImportFile(text)
      setShowImport(true)
    } catch (e: unknown) {
      if (e instanceof Error && e.message !== 'Cancelled.') {
        setImportError('Could not read file.')
      }
    }
  }

  const handleConfirmImport = async () => {
    if (!importFile) return
    setImportLoading(true)
    try {
      await restoreBackup(importFile)
      window.location.reload()
    } catch (e: unknown) {
      setImportError(
        e instanceof BackupValidationError ? e.message : 'Import failed. See console.',
      )
      console.error(e)
    } finally {
      setImportLoading(false)
      setShowImport(false)
    }
  }

  // ── Wipe ────────────────────────────────────────────────────────

  const handleWipe = async () => {
    await clearAllData()
    window.location.href = '/onboarding'
  }

  // ── Render ──────────────────────────────────────────────────────

  const gymStartDay  = settings.gymStartDay  ?? 'MON'
  const weighInDay   = settings.notifyWeighInDay ?? 'MON'

  return (
    <div className="px-4 pt-4 pb-8 space-y-6 animate-fade-in">
      <h1 className="text-xl font-extrabold text-zinc-100">Settings</h1>

      {/* ── Training mode ──────────────────────────────── */}
      <Section label="Training Mode">
        <div className="grid grid-cols-2 gap-3">
          <ModeButton
            active={settings.mode === 'normal'}
            icon={<Sun size={17} />}
            label="Normal"
            sub="Push · Pull · Legs · 5×/week"
            accent="accent"
            onClick={() => updateSettings({ mode: 'normal' })}
          />
          <ModeButton
            active={settings.mode === 'ramadan'}
            icon={<Moon size={17} />}
            label="Ramadan"
            sub="Upper · Lower · 4×/week"
            accent="amber"
            onClick={() => updateSettings({ mode: 'ramadan' })}
          />
        </div>

        {/* Gym start day */}
        <div className="mt-3 space-y-1.5">
          <p className="text-xs text-zinc-500">Week starts on</p>
          <div className="flex gap-1">
            {DOW_SHORT.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => updateSettings({ gymStartDay: d })}
                className={cn(
                  'flex-1 h-8 text-xs font-semibold rounded-lg border transition-colors',
                  gymStartDay === d
                    ? 'bg-accent-500/20 border-accent-500/50 text-accent-300'
                    : 'bg-surface-900 border-surface-700 text-zinc-500',
                )}
              >
                {DOW_LABEL[d]}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-zinc-600">
            Shifts the session rotation so your program cycle starts on this day.
          </p>
        </div>
      </Section>

      {/* ── Ramadan end date ───────────────────────────── */}
      {settings.mode === 'ramadan' && (
        <Section label="Ramadan End Date">
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-amber-400 shrink-0" />
              <input
                type="date"
                aria-label="Ramadan end date"
                value={ramadanEnd}
                onChange={(e) => setRamadanEnd(e.target.value)}
                onBlur={saveRamadanEnd}
                className="flex-1 bg-transparent text-zinc-100 text-sm focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-zinc-600 mt-1.5 pl-7">
              App automatically switches to Normal mode on this date.
            </p>
          </Card>
        </Section>
      )}

      {/* ── Name ──────────────────────────────────────── */}
      <Section label="Your Name">
        <Input
          prefix={<User size={15} className="text-zinc-500" />}
          placeholder="Optional display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={saveName}
          autoComplete="given-name"
        />
      </Section>

      {/* ── Step goal ─────────────────────────────────── */}
      <Section label="Daily Step Goal">
        <Input
          type="number"
          inputMode="numeric"
          prefix={<Footprints size={15} className="text-green-400" />}
          suffix="steps"
          value={stepGoal}
          onChange={(e) => setStepGoal(e.target.value)}
          onBlur={saveStepGoal}
          hint="Recommended: 8,000 – 12,000"
        />
      </Section>

      {/* ── Weight unit ───────────────────────────────── */}
      <Section label="Weight Unit">
        <div className="flex gap-3">
          {(['kg', 'lbs'] as WeightUnit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => updateSettings({ weightUnit: u })}
              className={cn(
                'flex-1 h-11 flex items-center justify-center gap-2',
                'rounded-xl border font-semibold text-sm transition-colors',
                settings.weightUnit === u
                  ? 'bg-accent-500/15 border-accent-500/50 text-accent-400'
                  : 'bg-surface-900 border-surface-700 text-zinc-400',
              )}
            >
              <Scale size={15} />
              {u}
            </button>
          ))}
        </div>
      </Section>

      {/* ── Reminders ─────────────────────────────────── */}
      <Section label="Reminders">
        <Card padding="none">
          {/* Master toggle */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              {settings.notificationsEnabled
                ? <Bell size={16} className="text-accent-400" />
                : <BellOff size={16} className="text-zinc-500" />
              }
              <span className="text-sm font-semibold text-zinc-200">
                Workout &amp; Step Reminders
              </span>
            </div>
            <button
              type="button"
              onClick={handleNotifToggle}
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors',
                settings.notificationsEnabled ? 'bg-accent-500' : 'bg-surface-700',
              )}
              aria-label="Toggle reminders"
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform',
                  settings.notificationsEnabled && 'translate-x-5',
                )}
              />
            </button>
          </div>

          {/* Blocked message */}
          {notifBlocked && (
            <p className="px-4 pb-3 text-xs text-red-400">
              Notifications are blocked in your browser. Enable them in browser settings, then try again.
            </p>
          )}

          {/* Detailed options (only when enabled) */}
          {settings.notificationsEnabled && (
            <div className="border-t border-surface-800 divide-y divide-surface-800">

              {/* Workout time */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-zinc-300">Workout reminder</p>
                  <p className="text-xs text-zinc-600">Shown on gym days if no session logged</p>
                </div>
                <input
                  type="time"
                  aria-label="Workout reminder time"
                  value={workoutTime}
                  onChange={(e) => setWorkoutTime(e.target.value)}
                  onBlur={saveWorkoutTime}
                  className="bg-surface-800 text-zinc-200 text-sm rounded-lg px-2 py-1 border border-surface-700 focus:outline-none focus:border-accent-500"
                />
              </div>

              {/* Steps time */}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-zinc-300">Steps reminder</p>
                  <p className="text-xs text-zinc-600">Shown when step goal not yet met</p>
                </div>
                <input
                  type="time"
                  aria-label="Steps reminder time"
                  value={stepsTime}
                  onChange={(e) => setStepsTime(e.target.value)}
                  onBlur={saveStepsTime}
                  className="bg-surface-800 text-zinc-200 text-sm rounded-lg px-2 py-1 border border-surface-700 focus:outline-none focus:border-accent-500"
                />
              </div>

              {/* Weigh-in day */}
              <div className="px-4 py-3 space-y-2">
                <div>
                  <p className="text-sm text-zinc-300">Weekly weigh-in day</p>
                  <p className="text-xs text-zinc-600">Shown when no body log exists that day</p>
                </div>
                <div className="flex gap-1">
                  {DOW_SHORT.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => updateSettings({ notifyWeighInDay: d })}
                      className={cn(
                        'flex-1 h-7 text-[11px] font-semibold rounded-lg border transition-colors',
                        weighInDay === d
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                          : 'bg-surface-900 border-surface-700 text-zinc-500',
                      )}
                    >
                      {DOW_LABEL[d]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-4 py-3">
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  In-app banners always appear when conditions are met, regardless of browser permission.
                  Browser push notifications fire while the app is open at the configured time.
                </p>
              </div>
            </div>
          )}
        </Card>
      </Section>

      {/* ── Backup ────────────────────────────────────── */}
      <Section label="Data Backup">
        <div className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            icon={<Download size={16} />}
            loading={exportLoading}
            onClick={handleExport}
          >
            Export JSON Backup
          </Button>

          <Button
            variant="secondary"
            fullWidth
            icon={<Upload size={16} />}
            onClick={handlePickImport}
          >
            Import JSON Backup
          </Button>

          {importError && (
            <p className="text-xs text-red-400 px-1">{importError}</p>
          )}
        </div>
      </Section>

      {/* ── Danger zone ───────────────────────────────── */}
      <Section label="Danger Zone">
        <div className="border border-red-900/50 rounded-2xl overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-red-400 font-semibold"
            onClick={() => setDangerOpen((o) => !o)}
          >
            <span>Wipe all data</span>
            {dangerOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {dangerOpen && (
            <div className="px-4 pb-4 space-y-3 bg-red-950/20">
              <p className="text-xs text-zinc-500">
                Deletes all workouts, metrics, steps, and nutrition logs from this device.
                Export a backup first!
              </p>
              <Button
                variant="danger"
                fullWidth
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => setShowWipe(true)}
              >
                Wipe Everything
              </Button>
            </div>
          )}
        </div>
      </Section>

      {/* ── Version ───────────────────────────────────── */}
      <p className="text-center text-xs text-zinc-700">
        FitTrack v1.0.0 · Local-first · Free forever
      </p>

      {/* ── Modals ────────────────────────────────────── */}
      <ConfirmModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onConfirm={handleConfirmImport}
        title="Import backup?"
        description="This will REPLACE all current data with the backup file. Make sure to export a backup first if you have data you want to keep."
        confirmLabel="Yes, import"
        cancelLabel="Cancel"
        loading={importLoading}
      />

      <ConfirmModal
        open={showWipe}
        onClose={() => setShowWipe(false)}
        onConfirm={handleWipe}
        title="Wipe all data?"
        description="This permanently deletes every workout, metric, and log on this device. There is no undo. Export a backup first."
        confirmLabel="Wipe everything"
        cancelLabel="Keep my data"
        danger
      />
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 px-0.5">
        {label}
      </p>
      {children}
    </section>
  )
}

interface ModeButtonProps {
  active:  boolean
  icon:    React.ReactNode
  label:   string
  sub:     string
  accent:  'accent' | 'amber'
  onClick: () => void
}

function ModeButton({ active, icon, label, sub, accent, onClick }: ModeButtonProps) {
  const activeStyle =
    accent === 'accent'
      ? 'bg-accent-500/10 border-accent-500/50'
      : 'bg-amber-500/10 border-amber-500/50'
  const iconStyle =
    active
      ? accent === 'accent' ? 'text-accent-400' : 'text-amber-400'
      : 'text-zinc-600'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1.5 p-3 rounded-2xl border text-left transition-colors',
        active ? activeStyle : 'bg-surface-900 border-surface-700',
      )}
    >
      <span className={iconStyle}>{icon}</span>
      <span className={cn('font-bold text-sm', active ? 'text-zinc-100' : 'text-zinc-400')}>
        {label}
      </span>
      <span className="text-[11px] text-zinc-600">{sub}</span>
    </button>
  )
}

