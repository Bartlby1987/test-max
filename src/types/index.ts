export interface Credentials {
  idInstance: string
  apiTokenInstance: string
  apiUrl: string
}

export type MessageStatus = 'sending' | 'sent' | 'failed'

export interface ChatMessage {
  id: string
  chatId: string
  text: string
  timestamp: number
  direction: 'outgoing' | 'incoming'
  status?: MessageStatus
}

export interface Chat {
  id: string
  chatId: string
  phone: string
  name: string
  lastMessage?: string
  lastTimestamp?: number
  unread: number
  messages: ChatMessage[]
}

export interface SendMessageResponse {
  idMessage: string
}

export interface CheckAccountResponse {
  exist?: boolean
  chatId?: string
  fromCache?: boolean
  status?: boolean
  reason?: string
}

export interface NotificationBody {
  typeWebhook: string
  timestamp: number
  idMessage: string
  senderData?: {
    chatId: string
    chatName?: string
    sender?: string
    senderName?: string
    senderContactName?: string
    senderPhoneNumber?: number | string
  }
  messageData?: {
    typeMessage: string
    textMessageData?: {
      textMessage: string
    }
    extendedTextMessageData?: {
      text: string
    }
  }
}

export interface ReceiveNotificationResponse {
  receiptId: number
  body: NotificationBody
}
