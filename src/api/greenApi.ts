import type {
  CheckAccountResponse,
  Credentials,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from '../types'

function buildUrl(
  credentials: Credentials,
  method: string,
  extraPath = '',
  query = '',
): string {
  const base = credentials.apiUrl.replace(/\/$/, '')
  const path = `/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${extraPath}${query}`

  // Proxy default GREEN-API host via same-origin /green-api (Vite in dev, Vercel rewrites in prod)
  if (/api\.green-api\.com/i.test(base)) {
    return `/green-api${path}`
  }

  return `${base}${path}`
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    return null as T
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(text || `HTTP ${response.status}`)
  }
}

export async function sendMessage(
  credentials: Credentials,
  chatId: string,
  message: string,
): Promise<SendMessageResponse> {
  const response = await fetch(buildUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `Ошибка отправки (${response.status})`)
  }

  return parseJson<SendMessageResponse>(response)
}

export async function checkAccount(
  credentials: Credentials,
  phoneNumber: number,
): Promise<CheckAccountResponse> {
  const response = await fetch(buildUrl(credentials, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `Ошибка проверки номера (${response.status})`)
  }

  return parseJson<CheckAccountResponse>(response)
}

export async function receiveNotification(
  credentials: Credentials,
  receiveTimeout = 20,
  signal?: AbortSignal,
): Promise<ReceiveNotificationResponse | null> {
  const response = await fetch(
    buildUrl(credentials, 'receiveNotification', '', `?receiveTimeout=${receiveTimeout}`),
    { method: 'GET', signal },
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `Ошибка получения уведомлений (${response.status})`)
  }

  const text = await response.text()
  if (!text || text === 'null') {
    return null
  }

  return JSON.parse(text) as ReceiveNotificationResponse
}

export async function deleteNotification(
  credentials: Credentials,
  receiptId: number,
): Promise<void> {
  const response = await fetch(
    buildUrl(credentials, 'deleteNotification', `/${receiptId}`),
    { method: 'DELETE' },
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(errorBody || `Ошибка удаления уведомления (${response.status})`)
  }
}
