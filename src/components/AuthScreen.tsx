import { useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { Credentials } from '../types'
import { MaxLogo } from './MaxLogo'

interface AuthScreenProps {
  onSubmit: (credentials: Credentials) => void
}

const DEFAULT_API_URL = 'https://api.green-api.com'

export function AuthScreen({ onSubmit }: AuthScreenProps) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError('Заполните idInstance и apiTokenInstance из личного кабинета GREEN-API')
      return
    }

    onSubmit({
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: (apiUrl.trim() || DEFAULT_API_URL).replace(/\/$/, ''),
    })
  }

  return (
    <div className="auth-screen">
      <div className="auth-orb auth-orb--one" aria-hidden />
      <div className="auth-orb auth-orb--two" aria-hidden />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.div
          className="auth-brand"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
        >
          <MaxLogo className="auth-logo" size={64} />
          <h1>MAX</h1>
          <p>Чат через GREEN-API — отправка и получение текстовых сообщений</p>
        </motion.div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>idInstance</span>
            <input
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              placeholder="Например, 1101000000"
              autoComplete="username"
              inputMode="numeric"
            />
          </label>

          <label className="field">
            <span>apiTokenInstance</span>
            <input
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              placeholder="Токен из личного кабинета"
              autoComplete="current-password"
              type="password"
            />
          </label>

          <button
            type="button"
            className="link-btn"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? 'Скрыть apiUrl' : 'Дополнительно: apiUrl'}
          </button>

          {showAdvanced && (
            <motion.label
              className="field"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <span>apiUrl</span>
              <input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder={DEFAULT_API_URL}
              />
            </motion.label>
          )}

          {error && <p className="form-error">{error}</p>}

          <motion.button
            className="primary-btn auth-submit"
            type="submit"
            whileTap={{ scale: 0.98 }}
            whileHover={{ y: -1 }}
          >
            Войти в чат
          </motion.button>
        </form>

        <p className="auth-hint">
          Данные инстанса берутся из{' '}
          <a href="https://green-api.com/max" target="_blank" rel="noreferrer">
            личного кабинета GREEN-API
          </a>
        </p>
      </motion.div>
    </div>
  )
}
