import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PhoneInput } from './PhoneInput'
import { getCountryMeta, type PhoneCountry } from '../utils/phone'
import { humanizeApiError } from '../utils/validation'
import { useToast } from '../hooks/useToast'

interface NewChatModalProps {
  open: boolean
  onClose: () => void
  onCreate: (phone: string) => Promise<void>
}

export function NewChatModal({ open, onClose, onCreate }: NewChatModalProps) {
  const toast = useToast()
  const [country, setCountry] = useState<PhoneCountry>('ru')
  const [national, setNational] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)

  const e164 = useMemo(
    () => `${getCountryMeta(country).code}${national}`,
    [country, national],
  )

  const meta = getCountryMeta(country)
  const canSubmit = national.length === meta.nationalLength && !loading

  useEffect(() => {
    if (!open) {
      setCountry('ru')
      setNational('')
      setError(null)
      setLoading(false)
      setTouched(false)
    }
  }, [open])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)

    if (national.length !== meta.nationalLength) {
      const message =
        country === 'by'
          ? 'Введите полный номер Беларуси: 9 цифр после +375'
          : 'Введите полный номер России: 10 цифр после +7'
      setError(message)
      toast.warning('Проверьте номер', message)
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onCreate(e164)
      toast.success('Чат создан', 'Можно писать сообщение')
      onClose()
    } catch (err) {
      const message = humanizeApiError(err, 'Не удалось создать чат')
      setError(message)
      toast.error('Не удалось создать чат', message)
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
              Укажите номер получателя в MAX. Можно вставить номер целиком из буфера.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <label className="field" htmlFor="new-chat-phone">
                <span>Номер телефона</span>
              </label>

              <PhoneInput
                id="new-chat-phone"
                country={country}
                national={national}
                onCountryChange={(next) => {
                  setCountry(next)
                  setError(null)
                }}
                onNationalChange={(next) => {
                  setNational(next)
                  setError(null)
                  setTouched(true)
                }}
                disabled={loading}
                autoFocus
              />

              {touched && error && <p className="form-error">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={onClose} disabled={loading}>
                  Отмена
                </button>
                <button type="submit" className="primary-btn" disabled={!canSubmit}>
                  {loading ? 'Проверяем номер…' : 'Создать чат'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
