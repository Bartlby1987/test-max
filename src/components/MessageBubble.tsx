import { motion } from 'framer-motion'
import type { ChatMessage } from '../types'

interface MessageBubbleProps {
  message: ChatMessage
}

function formatTime(timestamp: number) {
  return new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const outgoing = message.direction === 'outgoing'

  return (
    <motion.div
      className={`bubble-row ${outgoing ? 'bubble-row--out' : 'bubble-row--in'}`}
      initial={{ opacity: 0, y: 10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <div className={`bubble ${outgoing ? 'bubble--out' : 'bubble--in'}`}>
        <p className="bubble-text">{message.text}</p>
        <div className="bubble-meta">
          <time>{formatTime(message.timestamp)}</time>
          {outgoing && (
            <span className={`bubble-status bubble-status--${message.status || 'sent'}`}>
              {message.status === 'sending' && '…'}
              {message.status === 'failed' && '!'}
              {(message.status === 'sent' || !message.status) && '✓'}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
