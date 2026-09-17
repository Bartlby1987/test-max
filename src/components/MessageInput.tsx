import { useMemo, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { humanizeApiError, validateMessage } from '../utils/validation'
import { useToast } from '../hooks/useToast'

interface MessageInputProps {
  disabled?: boolean
  onSend: (text: string) => Promise<void>
}

export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const toast = useToast()
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const messageError = useMemo(() => validateMessage(text), [text])
  const tooLong = text.trim().length > 4000

  const submit = async () => {
    if (sending || disabled) return

    const error = validateMessage(text)
    if (error) {
      toast.warning('Сообщение не отправлено', error)
      return
    }

    setSending(true)
    const value = text
    setText('')
    try {
      await onSend(value)
    } catch (err) {
      setText(value)
      toast.error('Ошибка отправки', humanizeApiError(err, 'Не удалось отправить сообщение'))
    } finally {
      setSending(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submit()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void submit()
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit} noValidate>
      <div className="composer-row">
        <div className="composer-field">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите сообщение…"
            rows={1}
            disabled={disabled || sending}
            aria-invalid={tooLong}
            maxLength={4200}
          />
          <span className={`composer-counter ${tooLong ? 'is-over' : ''}`}>
            {text.trim().length}/4000
          </span>
        </div>
        <motion.button
          type="submit"
          className="send-btn"
          disabled={disabled || sending || Boolean(messageError)}
          whileTap={{ scale: 0.92 }}
          aria-label="Отправить"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path
              fill="currentColor"
              d="M3.4 20.6 21 12 3.4 3.4l-.1 6.7L15 12 3.3 13.9z"
            />
          </svg>
        </motion.button>
      </div>
    </form>
  )
}
