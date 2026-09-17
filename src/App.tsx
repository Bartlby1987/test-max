import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Credentials } from './types'
import { AuthScreen } from './components/AuthScreen'
import { ChatApp } from './components/ChatApp'
import { ToastProvider } from './hooks/useToast'
import { normalizeApiUrl, validateApiToken, validateIdInstance } from './utils/validation'

const CREDENTIALS_KEY = 'max-green-api-credentials'

function sanitizeCredentials(raw: unknown): Credentials | null {
  if (!raw || typeof raw !== 'object') return null
  const data = raw as Partial<Credentials>
  const idInstance = String(data.idInstance || '').trim()
  const apiTokenInstance = String(data.apiTokenInstance || '').trim()
  const apiUrl = normalizeApiUrl(data.apiUrl)

  if (validateIdInstance(idInstance) || validateApiToken(apiTokenInstance) || !apiUrl) {
    return null
  }

  return { idInstance, apiTokenInstance, apiUrl }
}

function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY)
    if (!raw) return null
    const parsed = sanitizeCredentials(JSON.parse(raw))
    if (!parsed) {
      localStorage.removeItem(CREDENTIALS_KEY)
      return null
    }
    // Re-save normalized absolute apiUrl
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(parsed))
    return parsed
  } catch {
    localStorage.removeItem(CREDENTIALS_KEY)
    return null
  }
}

export default function App() {
  const [credentials, setCredentials] = useState<Credentials | null>(loadCredentials)

  const handleLogin = (next: Credentials) => {
    const normalized = sanitizeCredentials(next)
    if (!normalized) return
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(normalized))
    // Force re-run of incoming settings on each fresh login
    sessionStorage.removeItem(`max-incoming-enabled:${normalized.idInstance}`)
    setCredentials(normalized)
  }

  const handleLogout = () => {
    if (credentials) {
      sessionStorage.removeItem(`max-incoming-enabled:${credentials.idInstance}`)
    }
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
