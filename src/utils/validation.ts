const DEFAULT_API_URL = 'https://api.green-api.com'

/** Returns absolute GREEN-API base URL or null if invalid. */
export function normalizeApiUrl(value: string | undefined | null): string | null {
  const trimmed = (value || '').trim().replace(/\/$/, '')
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
    if (!/(^|\.)api\.green-api\.com$/i.test(url.hostname)) {
      return null
    }
    return `${url.protocol}//${url.host}`
  } catch {
    return null
  }
}

export function validateIdInstance(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Укажите idInstance'
  if (!/^\d{6,15}$/.test(trimmed)) {
    return 'idInstance должен состоять только из цифр (обычно 10–12 знаков)'
  }
  return null
}

export function validateApiToken(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Укажите apiTokenInstance'
  if (trimmed.length < 20) {
    return 'Токен слишком короткий — проверьте копирование из кабинета GREEN-API'
  }
  if (/\s/.test(trimmed)) {
    return 'В токене не должно быть пробелов'
  }
  return null
}

export function validateApiUrl(value: string): string | null {
  if (!value.trim()) {
    return 'Укажите apiUrl из кабинета (например https://3100.api.green-api.com)'
  }
  if (!normalizeApiUrl(value)) {
    return 'apiUrl должен быть вида https://XXXX.api.green-api.com'
  }
  return null
}

export function validateMessage(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return 'Введите текст сообщения'
  if (trimmed.length > 4000) {
    return `Сообщение слишком длинное (${trimmed.length}/4000)`
  }
  return null
}

/** Turn raw GREEN-API / network errors into short Russian messages. */
export function humanizeApiError(error: unknown, fallback = 'Что-то пошло не так'): string {
  const raw = error instanceof Error ? error.message : String(error ?? '')
  if (!raw) return fallback

  const lower = raw.toLowerCase()

  if (lower.includes('not_found') || lower.includes('page could not be found') || lower.includes('arn1::')) {
    return 'Неверный apiUrl. Укажите точный адрес из кабинета, например https://3100.api.green-api.com'
  }
  if (lower.includes('failed to fetch') || lower.includes('networkerror')) {
    return 'Нет связи с сервером. Проверьте интернет и apiUrl'
  }
  if (lower.includes('unauthorized') || lower.includes('401')) {
    return 'Неверный idInstance или apiTokenInstance'
  }
  if (lower.includes('forbidden') || lower.includes('403')) {
    return 'Доступ запрещён. Проверьте idInstance и адрес apiUrl'
  }
  if (lower.includes('not authorized') || lower.includes('notauthorized')) {
    return 'Инстанс не авторизован в MAX. Отсканируйте QR в кабинете GREEN-API'
  }
  if (lower.includes('starting')) {
    return 'Инстанс запускается. Подождите несколько секунд и повторите'
  }
  if (lower.includes('webhook url')) {
    return 'Очистите webhookUrl в кабинете GREEN-API — иначе уведомления не приходят'
  }
  if (lower.includes('не найден') || lower.includes('exist')) {
    return 'Аккаунт MAX на этом номере не найден'
  }
  if (lower.includes('suspended')) {
    return 'На аккаунте временные ограничения отправки'
  }
  if (lower.includes('limit')) {
    return 'Превышен лимит запросов. Подождите и попробуйте позже'
  }

  try {
    const parsed = JSON.parse(raw) as { message?: string; error?: string; reason?: string }
    return parsed.message || parsed.error || parsed.reason || fallback
  } catch {
    // keep going
  }

  if (raw.length > 180) {
    return `${raw.slice(0, 180)}…`
  }

  return raw
}

export { DEFAULT_API_URL }
