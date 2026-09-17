import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ToastItem } from '../types/toast'

interface ToastViewportProps {
  items: ToastItem[]
  onDismiss: (id: string) => void
}

const ICONS: Record<ToastItem['type'], string> = {
  success: '✓',
  error: '!',
  warning: '⚠',
  info: 'i',
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem
  onDismiss: (id: string) => void
}) {
  useEffect(() => {
    const ms = item.duration ?? 4000
    const timer = window.setTimeout(() => onDismiss(item.id), ms)
    return () => window.clearTimeout(timer)
  }, [item, onDismiss])

  return (
    <motion.div
      layout
      className={`toast toast--${item.type}`}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
    >
      <span className="toast-icon" aria-hidden>
        {ICONS[item.type]}
      </span>
      <div className="toast-body">
        <strong>{item.title}</strong>
        {item.message && <p>{item.message}</p>}
      </div>
      <button
        type="button"
        className="toast-close"
        aria-label="Закрыть"
        onClick={() => onDismiss(item.id)}
      >
        ×
      </button>
    </motion.div>
  )
}

export function ToastViewport({ items, onDismiss }: ToastViewportProps) {
  return (
    <div className="toast-viewport" aria-live="polite" aria-relevant="additions">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}
