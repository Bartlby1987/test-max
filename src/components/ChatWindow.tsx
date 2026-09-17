import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Chat } from '../types'
import { formatPhoneDisplay } from '../utils/phone'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { MaxLogo } from './MaxLogo'

interface ChatWindowProps {
  chat: Chat | null
  onBack: () => void
  onSend: (text: string) => Promise<void>
  onNewChat: () => void
}

export function ChatWindow({ chat, onBack, onSend, onNewChat }: ChatWindowProps) {
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages.length, chat?.id])

  if (!chat) {
    return (
      <section className="chat-window chat-window--empty">
        <motion.div
          className="empty-state"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="empty-illustration" aria-hidden>
            <MaxLogo size={72} />
          </div>
          <h2>Выберите чат</h2>
          <p>Или создайте новый диалог по номеру телефона получателя в MAX</p>
          <button type="button" className="primary-btn" onClick={onNewChat}>
            Новый чат
          </button>
        </motion.div>
      </section>
    )
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <button
          type="button"
          className="icon-btn back-btn"
          onClick={onBack}
          aria-label="Назад к списку чатов"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path
              fill="currentColor"
              d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
            />
          </svg>
        </button>
        <div className="avatar avatar--sm" aria-hidden>
          {chat.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="chat-header-info">
          <strong>{chat.name}</strong>
          <small>{formatPhoneDisplay(chat.phone)}</small>
        </div>
      </header>

      <div className="messages-pane">
        <div className="messages-wallpaper" aria-hidden />
        <AnimatePresence initial={false}>
          {chat.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      <MessageInput onSend={onSend} />
    </section>
  )
}
