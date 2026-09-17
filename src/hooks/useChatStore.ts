import { useCallback, useEffect, useRef, useState } from 'react'
import {
  checkAccount,
  deleteNotification,
  enableIncomingHttpApi,
  receiveNotification,
  sendMessage,
} from '../api/greenApi'
import {
  formatPhoneDisplay,
  normalizePhone,
  toChatIdFromPhone,
  validatePhone,
} from '../utils/phone'
import { humanizeApiError } from '../utils/validation'
import type { Chat, ChatMessage, Credentials } from '../types'

const STORAGE_KEY = 'max-chat-state-v1'

interface StoredState {
  chats: Chat[]
  activeChatId: string | null
}

function loadStored(credentials: Credentials): StoredState {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${credentials.idInstance}`)
    if (!raw) return { chats: [], activeChatId: null }
    return JSON.parse(raw) as StoredState
  } catch {
    return { chats: [], activeChatId: null }
  }
}

function persist(credentials: Credentials, chats: Chat[], activeChatId: string | null) {
  localStorage.setItem(
    `${STORAGE_KEY}:${credentials.idInstance}`,
    JSON.stringify({ chats, activeChatId }),
  )
}

function extractText(body: {
  messageData?: {
    typeMessage: string
    textMessageData?: { textMessage: string }
    extendedTextMessageData?: { text: string }
  }
}): string | null {
  const data = body.messageData
  if (!data) return null
  if (data.typeMessage === 'textMessage') {
    return data.textMessageData?.textMessage ?? null
  }
  if (data.typeMessage === 'extendedTextMessage') {
    return data.extendedTextMessageData?.text ?? null
  }
  return null
}

export function useChatStore(credentials: Credentials) {
  const initial = loadStored(credentials)
  const [chats, setChats] = useState<Chat[]>(initial.chats)
  const [activeChatId, setActiveChatId] = useState<string | null>(initial.activeChatId)
  const [isReceiving, setIsReceiving] = useState(false)
  const [receiveError, setReceiveError] = useState<string | null>(null)
  const chatsRef = useRef(chats)

  useEffect(() => {
    chatsRef.current = chats
    persist(credentials, chats, activeChatId)
  }, [chats, activeChatId, credentials])

  const upsertIncoming = useCallback((message: ChatMessage, meta: {
    chatId: string
    name?: string
    phone?: string
  }) => {
    setChats((prev) => {
      const existingIndex = prev.findIndex(
        (chat) =>
          chat.chatId === meta.chatId ||
          (meta.phone && normalizePhone(chat.phone) === normalizePhone(meta.phone)),
      )

      if (existingIndex === -1) {
        const phone = meta.phone || meta.chatId
        const newChat: Chat = {
          id: meta.chatId,
          chatId: meta.chatId,
          phone,
          name: meta.name || formatPhoneDisplay(phone),
          lastMessage: message.text,
          lastTimestamp: message.timestamp,
          unread: activeChatId === meta.chatId ? 0 : 1,
          messages: [message],
        }
        return [newChat, ...prev]
      }

      const next = [...prev]
      const chat = { ...next[existingIndex] }
      if (chat.messages.some((m) => m.id === message.id)) {
        return prev
      }

      chat.messages = [...chat.messages, message]
      chat.lastMessage = message.text
      chat.lastTimestamp = message.timestamp
      chat.chatId = meta.chatId
      if (meta.name) chat.name = meta.name
      if (meta.phone) chat.phone = meta.phone
      if (activeChatId !== chat.id) {
        chat.unread += 1
      }
      next.splice(existingIndex, 1)
      return [chat, ...next]
    })
  }, [activeChatId])

  useEffect(() => {
    const controller = new AbortController()
    let cancelled = false

    const isAbort = (error: unknown) =>
      (error instanceof DOMException && error.name === 'AbortError') ||
      (error instanceof Error && error.name === 'AbortError')

    const poll = async () => {
      setIsReceiving(true)

      try {
        const settingsKey = `max-incoming-enabled:${credentials.idInstance}`
        if (!sessionStorage.getItem(settingsKey)) {
          await enableIncomingHttpApi(credentials)
          sessionStorage.setItem(settingsKey, '1')
        }
      } catch (error) {
        if (!cancelled && !isAbort(error)) {
          setReceiveError(
            humanizeApiError(
              error,
              'Не удалось включить входящие уведомления. Включите их вручную в кабинете GREEN-API',
            ),
          )
        }
      }

      while (!cancelled) {
        try {
          const notification = await receiveNotification(
            credentials,
            20,
            controller.signal,
          )

          if (cancelled) break

          if (!notification) {
            setReceiveError(null)
            continue
          }

          const { receiptId, body } = notification

          if (body.typeWebhook === 'incomingMessageReceived') {
            const text = extractText(body)
            if (text && body.senderData?.chatId) {
              const phone = body.senderData.senderPhoneNumber
                ? String(body.senderData.senderPhoneNumber)
                : undefined

              upsertIncoming(
                {
                  id: body.idMessage,
                  chatId: body.senderData.chatId,
                  text,
                  timestamp: body.timestamp * 1000,
                  direction: 'incoming',
                },
                {
                  chatId: body.senderData.chatId,
                  name:
                    body.senderData.senderContactName ||
                    body.senderData.senderName ||
                    body.senderData.chatName,
                  phone,
                },
              )
            }
          }

          await deleteNotification(credentials, receiptId)
          setReceiveError(null)
        } catch (error) {
          if (cancelled || isAbort(error)) {
            break
          }
          setReceiveError(humanizeApiError(error, 'Ошибка получения'))
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
      setIsReceiving(false)
    }

    void poll()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [credentials, upsertIncoming])

  const createChat = useCallback(async (phoneInput: string) => {
    const phone = normalizePhone(phoneInput)
    const phoneError = validatePhone(phone)
    if (phoneError) {
      throw new Error(phoneError)
    }

    const existing = chatsRef.current.find(
      (chat) => normalizePhone(chat.phone) === phone,
    )
    if (existing) {
      setActiveChatId(existing.id)
      return existing
    }

    let chatId = toChatIdFromPhone(phone)
    const name = formatPhoneDisplay(phone)

    try {
      const result = await checkAccount(credentials, Number(phone))
      if (result.status === false) {
        throw new Error(result.reason || 'Инстанс не готов к работе')
      }
      if (result.exist === false) {
        throw new Error('Аккаунт MAX на этом номере не найден')
      }
      if (result.chatId) {
        chatId = result.chatId
      }
    } catch (error) {
      const original = error instanceof Error ? error.message : ''
      if (
        original.includes('не найден') ||
        original.includes('не готов') ||
        original.includes('Аккаунт MAX')
      ) {
        throw new Error(humanizeApiError(error, original))
      }
      // Soft-fail on transient checkAccount issues: still open chat by phone@c.us
    }

    const chat: Chat = {
      id: chatId,
      chatId,
      phone,
      name,
      unread: 0,
      messages: [],
    }

    setChats((prev) => [chat, ...prev])
    setActiveChatId(chat.id)
    return chat
  }, [credentials])

  const send = useCallback(async (chatId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const tempId = `local-${Date.now()}`
    const optimistic: ChatMessage = {
      id: tempId,
      chatId,
      text: trimmed,
      timestamp: Date.now(),
      direction: 'outgoing',
      status: 'sending',
    }

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.chatId !== chatId && chat.id !== chatId) return chat
        return {
          ...chat,
          lastMessage: trimmed,
          lastTimestamp: optimistic.timestamp,
          messages: [...chat.messages, optimistic],
        }
      }),
    )

    try {
      const target = chatsRef.current.find(
        (chat) => chat.chatId === chatId || chat.id === chatId,
      )
      if (!target) throw new Error('Чат не найден')

      const result = await sendMessage(credentials, target.chatId, trimmed)

      setChats((prev) =>
        prev
          .map((chat) => {
            if (chat.id !== target.id) return chat
            return {
              ...chat,
              lastMessage: trimmed,
              lastTimestamp: optimistic.timestamp,
              messages: chat.messages.map((message) =>
                message.id === tempId
                  ? { ...message, id: result.idMessage, status: 'sent' as const }
                  : message,
              ),
            }
          })
          .sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0)),
      )
    } catch (error) {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.chatId !== chatId && chat.id !== chatId) return chat
          return {
            ...chat,
            messages: chat.messages.map((message) =>
              message.id === tempId
                ? { ...message, status: 'failed' as const }
                : message,
            ),
          }
        }),
      )
      throw error
    }
  }, [credentials])

  const selectChat = useCallback((id: string | null) => {
    setActiveChatId(id)
    if (!id) return
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, unread: 0 } : chat)),
    )
  }, [])

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null

  return {
    chats,
    activeChat,
    activeChatId,
    selectChat,
    createChat,
    send,
    isReceiving,
    receiveError,
  }
}
