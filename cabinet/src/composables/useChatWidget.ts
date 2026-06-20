import { ref, watch } from 'vue'
import { useChat } from '@/composables/useChat'
import { useChatComposer } from '@/composables/useChatComposer'
import { useChatOfflineSupport } from '@/composables/useChatOfflineSupport'

export function useChatWidget() {
  const chat = useChat()
  const rated = ref(false)
  const hoverRating = ref(0)

  function resetRating() {
    rated.value = false
    hoverRating.value = 0
  }

  function rateChat(rating: number) {
    chat.emitRate(rating)
    rated.value = true
    hoverRating.value = 0
  }

  function toggle() {
    if (chat.isOpen.value) chat.close()
    else chat.open()
  }

  watch(chat.isClosed, (closed) => {
    if (!closed) resetRating()
  })

  const offlineSupport = useChatOfflineSupport(chat.isOpen, chat.isConnected)
  const composer = useChatComposer({
    isClosed: chat.isClosed,
    uploadFiles: chat.uploadFiles,
    send: chat.send,
    emitTyping: chat.emitTyping,
  })

  return {
    ...chat,
    ...offlineSupport,
    ...composer,
    rated,
    hoverRating,
    rateChat,
    toggle,
  }
}
