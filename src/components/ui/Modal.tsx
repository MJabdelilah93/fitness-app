import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

// ─── Base Modal ───────────────────────────────────────────────────────────────

interface ModalProps {
  open:        boolean
  onClose:     () => void
  title:       string
  description?: string
  children?:   ReactNode
  actions?:    ReactNode
  /** Default: 'sheet' (slides from bottom on mobile). 'center' for desktop-style. */
  variant?:    'sheet' | 'center'
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
  variant = 'sheet',
}: ModalProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    /* Portal-style overlay */
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative w-full bg-surface-900 border border-surface-700 animate-slide-up',
          variant === 'sheet'
            ? 'rounded-t-3xl sm:rounded-3xl sm:max-w-sm'
            : 'rounded-3xl max-w-sm mx-auto',
          'p-5 shadow-2xl',
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-1">
          <h2 id="modal-title" className="font-bold text-zinc-100 text-lg leading-tight pr-4">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0 -mt-0.5"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {description && (
          <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{description}</p>
        )}

        {children}

        {actions && (
          <div className="flex gap-3 mt-5">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  open:           boolean
  onClose:        () => void
  onConfirm:      () => void
  title:          string
  description:    string
  confirmLabel?:  string
  cancelLabel?:   string
  danger?:        boolean
  loading?:       boolean
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  danger       = false,
  loading      = false,
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      actions={
        <>
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            fullWidth
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
