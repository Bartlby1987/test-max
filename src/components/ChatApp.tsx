import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Credentials } from '../types'
import { useChatStore } from '../hooks/useChatStore'
import { useToast } from '../hooks/useToast'
import { Sidebar } from './Sidebar'
import { ChatWindow } from './ChatWindow'
import { NewChatModal } from './NewChatModal'

interface ChatAppProps {
  credentials: Credentials
  onLogout: () => void
}

export function ChatApp({ credentials, onLogout }: ChatAppProps) {
  const toast = useToast()
  const {
    chats,
    activeChat,
    activeChatId,
    selectChat,
    createChat,
    send,
    isReceiving,
    receiveError,
  } = useChatStore(credentials)

  const [modalOpen, setModalOpen] = useState(false)
  const lastReceiveError = useRef<string | null>(null)
  const showChatOnMobile = Boolean(activeChatId)

  useEffect(() => {
    if (receiveError && receiveError !== lastReceiveError.current) {
      toast.error('Проблема с получением сообщений', receiveError)
      lastReceiveError.current = receiveError
    }
    if (!receiveError) {
      lastReceiveError.current = null
    }
  }, [receiveError, toast])

  return (
    <motion.div
      className={`app-shell ${showChatOnMobile ? 'app-shell--chat' : 'app-shell--list'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        isReceiving={isReceiving}
        receiveError={receiveError}
        onSelect={selectChat}
        onNewChat={() => setModalOpen(true)}
        onLogout={onLogout}
        mobileOpen={!showChatOnMobile}
      />

      <ChatWindow
        chat={activeChat}
        onBack={() => selectChat(null)}
        onSend={async (text) => {
          if (!activeChat) return
          await send(activeChat.chatId, text)
        }}
        onNewChat={() => setModalOpen(true)}
      />

      <NewChatModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={async (phone) => {
          await createChat(phone)
        }}
      />
    </motion.div>
  )
}
