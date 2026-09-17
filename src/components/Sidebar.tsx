import { motion } from 'framer-motion'
import type { Chat } from '../types'
import { formatPhoneDisplay } from '../utils/phone'
import { MaxLogo } from './MaxLogo'

interface SidebarProps {
  chats: Chat[]
  activeChatId: string | null
  isReceiving: boolean
  receiveError: string | null
  onSelect: (id: string) => void
  onNewChat: () => void
  onLogout: () => void
  mobileOpen: boolean
}

function formatListTime(timestamp?: number) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) {
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
  }).format(date)
}

function initials(name: string) {
  const parts = name.replace(/^\+/, '').split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export function Sidebar({
  chats,
  activeChatId,
  isReceiving,
  receiveError,
  onSelect,
  onNewChat,
  onLogout,
  mobileOpen,
}: SidebarProps) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <MaxLogo className="sidebar-logo" size={42} />
          <div>
            <strong>MAX</strong>
            <small className={isReceiving ? 'status-live' : 'status-idle'}>
              {receiveError ? 'Ошибка связи' : isReceiving ? 'В сети' : 'Подключение…'}
            </small>
          </div>
        </div>

        <div className="sidebar-actions">
          <motion.button
            type="button"
            className="icon-btn"
            onClick={onNewChat}
            whileTap={{ scale: 0.92 }}
            title="Новый чат"
            aria-label="Новый чат"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path
                fill="currentColor"
                d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z"
              />
            </svg>
          </motion.button>
          <button type="button" className="ghost-btn logout-btn" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </div>

      {receiveError && <p className="sidebar-error">{receiveError}</p>}

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="chat-list-empty">
            <p>Пока нет чатов</p>
            <button type="button" className="primary-btn" onClick={onNewChat}>
              Начать переписку
            </button>
          </div>
        ) : (
          chats.map((chat, index) => (
            <motion.button
              key={chat.id}
              type="button"
              className={`chat-list-item ${activeChatId === chat.id ? 'is-active' : ''}`}
              onClick={() => onSelect(chat.id)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.24) }}
            >
              <div className="avatar" aria-hidden>
                {initials(chat.name)}
              </div>
              <div className="chat-list-body">
                <div className="chat-list-top">
                  <span className="chat-list-name">{chat.name}</span>
                  <time>{formatListTime(chat.lastTimestamp)}</time>
                </div>
                <div className="chat-list-bottom">
                  <span className="chat-list-preview">
                    {chat.lastMessage || formatPhoneDisplay(chat.phone)}
                  </span>
                  {chat.unread > 0 && (
                    <span className="unread-badge">{chat.unread}</span>
                  )}
                </div>
              </div>
            </motion.button>
          ))
        )}
      </div>
    </aside>
  )
}
