import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Credentials } from './types'
import { AuthScreen } from './components/AuthScreen'
import { ChatApp } from './components/ChatApp'
import { ToastProvider } from './hooks/useToast'

const CREDENTIALS_KEY = 'max-green-api-credentials'

function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY)
    return raw ? (JSON.parse(raw) as Credentials) : null
  } catch {
    return null
  }
}

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials)

  const handleLogin = (next: Credentials) => {
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(next))
    setCredentials(next)
  }

  const handleLogout = () => {
    localStorage.removeItem(CREDENTIALS_KEY)
    setCredentials(null)
  }

  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        {credentials ? (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ height: '100%' }}
          >
            <ChatApp credentials={credentials} onLogout={handleLogout} />
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ height: '100%' }}
          >
            <AuthScreen onSubmit={handleLogin} />
          </motion.div>
        )}
      </AnimatePresence>
    </ToastProvider>
  )
}
