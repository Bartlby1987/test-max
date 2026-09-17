import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { formatPhoneDisplay } from '../api/greenApi'

interface NewChatModalProps {
  open: boolean
  onClose: () => void
  onCreate: (phone: string) => Promise<void>
}

export function NewChatModal({ open, onClose, onCreate }: NewChatModalProps) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setPhone('')
      setError(null)
      setLoading(false)
    }
  }, [open])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onCreate(phone)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать чат')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-chat-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="new-chat-title">Новый чат</h2>
            <p className="modal-subtitle">
              Введите номер телефона получателя в международном формате (РФ или РБ)
            </p>

            <form onSubmit={handleSubmit}>
              <label className="field">
                <span>Номер телефона</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="79991234567"
                  inputMode="tel"
                  autoFocus
                />
              </label>

              {phone && (
                <p className="modal-preview">{formatPhoneDisplay(phone)}</p>
              )}

              {error && <p className="form-error">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={onClose}>
                  Отмена
                </button>
                <button type="submit" className="primary-btn" disabled={loading}>
                  {loading ? 'Создание…' : 'Создать чат'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
