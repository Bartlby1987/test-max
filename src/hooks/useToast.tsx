import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { ToastItem, ToastType } from '../types/toast'
import { ToastViewport } from '../components/ToastViewport'

interface ToastContextValue {
  push: (toast: Omit<ToastItem, 'id'> & { id?: string }) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function makeId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const push = useCallback((toast: Omit<ToastItem, 'id'> & { id?: string }) => {
    const id = toast.id ?? makeId()
    setItems((prev) => [...prev, { ...toast, id }].slice(-5))
  }, [])

  const makePusher = useCallback(
    (type: ToastType) => (title: string, message?: string) => {
      push({ type, title, message, duration: type === 'error' ? 6000 : 4000 })
    },
    [push],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      push,
      dismiss,
      success: makePusher('success'),
      error: makePusher('error'),
      warning: makePusher('warning'),
      info: makePusher('info'),
    }),
    [push, dismiss, makePusher],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}
