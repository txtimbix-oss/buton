import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ChatMessage } from '@/features/chat/messages'

/**
 * Реактивное состояние чата. Socket и динамический импорт `socket.io-client`
 * живут в `useChat()` как implementation detail — сюда попадает только то,
 * что отражается в UI.
 */
export const useChatStore = defineStore('chat', () => {
  const messages    = ref<ChatMessage[]>([])
  const chatId      = ref<string | null>(null)
  const isOpen      = ref(false)
  const unread      = ref(0)
  const isConnected = ref(false)
  const adminTyping = ref(false)
  const isClosed    = ref(false)
  const lastError   = ref('')

  function clearUnread() {
    unread.value = 0
  }

  function openChat() {
    isOpen.value = true
    clearUnread()
  }

  function closeChat() {
    isOpen.value = false
  }

  function setReady(id: string, msgs: ChatMessage[]) {
    const firstInit = !chatId.value
    chatId.value = id
    if (firstInit) messages.value = msgs
  }

  function appendMessage(message: ChatMessage) {
    messages.value = [...messages.value, message]
    if (message.sender === 'admin' && !isOpen.value) {
      unread.value++
    }
  }

  function setConnected(value: boolean) {
    isConnected.value = value
    if (value) {
      lastError.value = ''
    } else {
      chatId.value = null
    }
  }

  function setAdminTyping(value: boolean) {
    adminTyping.value = value
  }

  function setError(message: string) {
    lastError.value = message
  }

  function markClosed() {
    isClosed.value = true
  }

  function resetChat() {
    messages.value    = []
    chatId.value      = null
    isOpen.value      = false
    unread.value      = 0
    isConnected.value = false
    adminTyping.value = false
    isClosed.value    = false
    lastError.value   = ''
  }

  return {
    messages, chatId, isOpen, unread, isConnected, adminTyping, isClosed, lastError,
    openChat, closeChat, setReady, appendMessage, setConnected,
    setAdminTyping, setError, markClosed, clearUnread, resetChat,
  }
})
