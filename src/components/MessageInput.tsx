import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'

interface MessageInputProps {
  disabled?: boolean
  onSend: (text: string) => Promise<void>
}

export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    if (!text.trim() || sending || disabled) return
    setSending(true)
    setError(null)
    const value = text
    setText('')
    try {
      await onSend(value)
    } catch (err) {
      setText(value)
      setError(err instanceof Error ? err.message : 'Не удалось отправить')
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
    <form className="composer" onSubmit={handleSubmit}>
      {error && <p className="composer-error">{error}</p>}
      <div className="composer-row">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Напишите сообщение…"
          rows={1}
          disabled={disabled || sending}
        />
        <motion.button
          type="submit"
          className="send-btn"
          disabled={disabled || sending || !text.trim()}
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
