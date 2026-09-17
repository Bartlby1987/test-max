import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { motion } from 'framer-motion'
import type { Credentials } from '../types'
import { MaxLogo } from './MaxLogo'
import {
  DEFAULT_API_URL,
  validateApiToken,
  validateApiUrl,
  validateIdInstance,
} from '../utils/validation'
import { useToast } from '../hooks/useToast'

interface AuthScreenProps {
  onSubmit: (credentials: Credentials) => void
}

export function AuthScreen({ onSubmit }: AuthScreenProps) {
  const toast = useToast()
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [touched, setTouched] = useState({
    id: false,
    token: false,
    url: false,
  })

  const idError = useMemo(() => validateIdInstance(idInstance), [idInstance])
  const tokenError = useMemo(() => validateApiToken(apiTokenInstance), [apiTokenInstance])
  const urlError = useMemo(() => validateApiUrl(apiUrl), [apiUrl])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    setTouched({ id: true, token: true, url: true })

    if (idError || tokenError || urlError) {
      toast.error(
        'Проверьте данные входа',
        idError || tokenError || urlError || 'Заполните обязательные поля',
      )
      return
    }

    onSubmit({
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: (apiUrl.trim() || DEFAULT_API_URL).replace(/\/$/, ''),
    })
    toast.success('Вход выполнен', 'Подключаемся к GREEN-API')
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

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className={`field ${touched.id && idError ? 'is-invalid' : ''}`}>
            <span>idInstance</span>
            <input
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value.replace(/\D/g, ''))}
              onBlur={() => setTouched((t) => ({ ...t, id: true }))}
              placeholder="Например, 1101000000"
              autoComplete="username"
              inputMode="numeric"
              aria-invalid={touched.id && Boolean(idError)}
            />
            {touched.id && idError && <span className="field-hint field-hint--error">{idError}</span>}
          </label>

          <label className={`field ${touched.token && tokenError ? 'is-invalid' : ''}`}>
            <span>apiTokenInstance</span>
            <div className="input-with-action">
              <input
                value={apiTokenInstance}
                onChange={(e) => setApiTokenInstance(e.target.value.trim())}
                onBlur={() => setTouched((t) => ({ ...t, token: true }))}
                placeholder="Токен из личного кабинета"
                autoComplete="current-password"
                type={showToken ? 'text' : 'password'}
                aria-invalid={touched.token && Boolean(tokenError)}
              />
              <button
                type="button"
                className="input-action"
                onClick={() => setShowToken((v) => !v)}
              >
                {showToken ? 'Скрыть' : 'Показать'}
              </button>
            </div>
            {touched.token && tokenError && (
              <span className="field-hint field-hint--error">{tokenError}</span>
            )}
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
              className={`field ${touched.url && urlError ? 'is-invalid' : ''}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <span>apiUrl</span>
              <input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, url: true }))}
                placeholder={DEFAULT_API_URL}
                aria-invalid={touched.url && Boolean(urlError)}
              />
              {touched.url && urlError && (
                <span className="field-hint field-hint--error">{urlError}</span>
              )}
            </motion.label>
          )}

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
