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
  return `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${extraPath}${query}`
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

async function readError(response: Response, fallback: string): Promise<string> {
  const errorBody = await response.text()
  return errorBody || `${fallback} (${response.status})`
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
    throw new Error(await readError(response, 'Ошибка отправки'))
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
    throw new Error(await readError(response, 'Ошибка проверки номера'))
  }

  return parseJson<CheckAccountResponse>(response)
}

/** Enable HTTP API receiving: empty webhookUrl + incoming messages. */
export async function enableIncomingHttpApi(credentials: Credentials): Promise<void> {
  const response = await fetch(buildUrl(credentials, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl: '',
      webhookUrlToken: '',
      incomingWebhook: 'yes',
    }),
  })

  if (!response.ok) {
    throw new Error(await readError(response, 'Не удалось включить входящие уведомления'))
  }
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
    throw new Error(await readError(response, 'Ошибка получения уведомлений'))
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
    throw new Error(await readError(response, 'Ошибка удаления уведомления'))
  }
}
