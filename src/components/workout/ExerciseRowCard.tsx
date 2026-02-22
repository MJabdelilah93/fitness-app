import { useState, useEffect, useRef, useCallback } from 'react'
import { ExternalLink, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'

import { db, upsertRowLog } from '../../db/db'
import { parseExercise, isLoggableRow, type ProgramRow } from '../../data/programData'
import { cn } from '../../utils/cn'
import type { TrainingMode, RowLog } from '../../types'

interface Props {
  row:      ProgramRow
  date:     string        // 'YYYY-MM-DD'
  mode:     TrainingMode
  readOnly?: boolean      // true when browsing a different day (future)
}

export function ExerciseRowCard({ row, date, mode, readOnly = false }: Props) {
  const { main, alt } = parseExercise(row)
  const loggable = isLoggableRow(row)

  const [useAlt,   setUseAlt]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  const active = useAlt && alt ? alt : main

  // ── DB reads ──────────────────────────────────────────────────────

  const existingLog = useLiveQuery(
    (): Promise<RowLog | undefined> =>
      db.rowLogs
        .where('date').equals(date)
        .filter(l => l.exerciseKey === active.key)
        .first(),
    [date, active.key],
  )

  const history = useLiveQuery(
    async (): Promise<RowLog[]> => {
      const all = await db.rowLogs
        .where('exerciseKey').equals(active.key)
        .filter(l => l.date < date && l.completed)
        .toArray()
      return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
    },
    [active.key, date],
  )

  // ── Local state (inputs) ──────────────────────────────────────────

  const [setsDone,  setSetsDone]  = useState(row.sets)
  const [repsDone,  setRepsDone]  = useState(row.reps)
  const [weightKg,  setWeightKg]  = useState('')
  const [notes,     setNotes]     = useState('')
  const [completed, setCompleted] = useState(false)

  // Initialise from DB once (not on every reactive update)
  const initialized = useRef(false)
  useEffect(() => {
    if (initialized.current || existingLog === undefined) return
    initialized.current = true
    if (existingLog) {
      setUseAlt(existingLog.useAlt)
      setSetsDone(existingLog.setsDone || row.sets)
      setRepsDone(existingLog.repsDone || row.reps)
      setWeightKg(existingLog.weightKg)
      setNotes(existingLog.notes)
      setCompleted(existingLog.completed)
    }
  }, [existingLog, row.sets, row.reps])

  // Reset init flag when date changes
  useEffect(() => {
    initialized.current = false
    setSetsDone(row.sets)
    setRepsDone(row.reps)
    setWeightKg('')
    setNotes('')
    setCompleted(false)
    setUseAlt(false)
  }, [date, row.sets, row.reps])

  // ── Save ──────────────────────────────────────────────────────────

  const save = useCallback(async (patch?: Partial<RowLog>) => {
    await upsertRowLog(date, mode, active.key, {
      useAlt,
      setsDone,
      repsDone,
      weightKg,
      completed,
      notes,
      ...patch,
    })
  }, [date, mode, active.key, useAlt, setsDone, repsDone, weightKg, completed, notes])

  const handleCheck = async (checked: boolean) => {
    setCompleted(checked)
    await save({ completed: checked })
  }

  const handleAltToggle = async () => {
    const next = !useAlt
    setUseAlt(next)
    await save({ useAlt: next })
  }

  const copyPlan = () => {
    setSetsDone(row.sets)
    setRepsDone(row.reps)
  }

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className={cn(
      'rounded-xl border transition-colors',
      completed
        ? 'bg-green-500/5 border-green-500/20'
        : 'bg-surface-900 border-surface-700',
    )}>
      {/* ── Row header ── */}
      <div className="flex items-start gap-2 p-3">

        {/* Completion checkbox */}
        <input
          type="checkbox"
          checked={completed}
          onChange={e => handleCheck(e.target.checked)}
          disabled={readOnly}
          className="mt-0.5 w-4 h-4 rounded accent-accent-500 shrink-0 cursor-pointer"
          aria-label={`Mark ${active.name} as done`}
        />

        {/* Exercise name (YouTube link) */}
        <a
          href={active.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex-1 text-sm font-medium leading-snug flex items-start gap-1',
            completed ? 'text-zinc-400 line-through' : 'text-zinc-100',
          )}
        >
          {active.name}
          <ExternalLink size={11} className="mt-0.5 shrink-0 text-zinc-600" />
        </a>

        {/* Alt toggle */}
        {alt && !readOnly && (
          <button
            type="button"
            onClick={handleAltToggle}
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full border shrink-0',
              useAlt
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-surface-800 text-zinc-500 border-surface-600',
            )}
          >
            {useAlt ? 'ALT ✓' : 'ALT'}
          </button>
        )}

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="p-0.5 text-zinc-600 hover:text-zinc-300 transition-colors shrink-0"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
      </div>

      {/* ── Plan label + inline logging ── */}
      <div className="px-3 pb-3 space-y-2">
        <p className="text-[11px] text-zinc-600 ml-6">
          {row.part}
          {row.sets && ` · ${row.sets} sets × ${row.reps}`}
        </p>

        {loggable && !readOnly && (
          <div className="ml-6 flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 bg-surface-800 rounded-lg px-2 py-1">
              <input
                type="text"
                inputMode="numeric"
                value={setsDone}
                onChange={e => setSetsDone(e.target.value)}
                onBlur={() => save()}
                placeholder={row.sets || 'sets'}
                className="w-8 bg-transparent text-center text-sm text-zinc-100 outline-none"
                aria-label="Sets done"
              />
              <span className="text-zinc-600 text-xs">×</span>
              <input
                type="text"
                inputMode="numeric"
                value={repsDone}
                onChange={e => setRepsDone(e.target.value)}
                onBlur={() => save()}
                placeholder={row.reps || 'reps'}
                className="w-12 bg-transparent text-center text-sm text-zinc-100 outline-none"
                aria-label="Reps done"
              />
            </div>

            <div className="flex items-center gap-1 bg-surface-800 rounded-lg px-2 py-1">
              <input
                type="text"
                inputMode="decimal"
                value={weightKg}
                onChange={e => setWeightKg(e.target.value)}
                onBlur={() => save()}
                placeholder="kg"
                className="w-12 bg-transparent text-center text-sm text-zinc-100 outline-none"
                aria-label="Weight in kg"
              />
            </div>

            <button
              type="button"
              onClick={copyPlan}
              title="Copy planned values"
              className="p-1.5 rounded-lg bg-surface-800 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        )}
      </div>

      {/* ── Expanded: notes + history ── */}
      {expanded && (
        <div className="border-t border-surface-700 px-3 py-3 ml-6 space-y-3">
          {!readOnly && (
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onBlur={() => save()}
              placeholder="Notes (optional)…"
              className="w-full bg-surface-800 rounded-lg px-3 py-1.5 text-sm text-zinc-200 placeholder-zinc-600 outline-none border border-surface-600 focus:border-accent-500/50"
            />
          )}

          {history && history.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600 mb-1.5">
                Last {history.length} logs
              </p>
              <div className="space-y-1">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="text-zinc-600 shrink-0">{h.date}</span>
                    <span>
                      {h.setsDone && h.repsDone ? `${h.setsDone} × ${h.repsDone}` : '—'}
                      {h.weightKg ? ` @ ${h.weightKg} kg` : ''}
                    </span>
                    {h.notes && <span className="text-zinc-600 truncate">· {h.notes}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {history?.length === 0 && (
            <p className="text-xs text-zinc-600">No previous logs for this exercise.</p>
          )}
        </div>
      )}
    </div>
  )
}
