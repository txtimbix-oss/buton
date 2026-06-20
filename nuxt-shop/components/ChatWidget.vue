<template>
  <ClientOnly>
    <Teleport to="body">
      <!-- Панель чата -->
      <Transition name="chat-rise">
        <ChatWindow v-if="isOpen" @close="close">
          <ChatOfflineForm
            v-if="showOfflineForm"
            :name="offline.name.value"
            :email="offline.email.value"
            :message="offline.message.value"
            :sending="offline.sending.value"
            :sent="offline.sent.value"
            @update:name="offline.name.value = $event"
            @update:email="offline.email.value = $event"
            @update:message="offline.message.value = $event"
            @submit="offline.submit"
          />

          <div
            v-if="lastError && !showOfflineForm"
            class="chat-box__error"
            role="alert"
            aria-live="polite"
          >
            <span>{{ lastError }}</span>
            <button class="chat-box__error-close" type="button" aria-label="Скрыть ошибку" @click="clearError">×</button>
          </div>

          <ChatMessages
            v-if="!showOfflineForm"
            :messages="messages"
            :proactive-msg="proactiveMsg"
            :is-connected="isConnected"
            :admin-typing="adminTyping"
            :is-closed="isClosed"
            :rated="rated"
            :is-image="isImage"
            :is-audio="isAudio"
            :format-time="formatTime"
            :list-ref="setMsgListRef"
            @rate="rateChat"
          />

          <ChatComposer
            v-if="!showOfflineForm"
            :input-text="inputText"
            :is-closed="isClosed"
            :sending="sending"
            :is-recording="isRecording"
            :pending-files="pendingFiles"
            @update:input-text="inputText = $event"
            @submit="submit"
            @file-change="onFileChange"
            @toggle-recording="toggleRecording"
            @typing="onInput"
            @remove-pending="removePending"
          />
        </ChatWindow>
      </Transition>

      <!-- Кнопка-пузырь -->
      <ChatLauncher :is-open="isOpen" :unread="unread" @toggle="toggle" />
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
const {
  messages,
  isOpen,
  unread,
  isConnected,
  adminTyping,
  isClosed,
  proactiveMsg,
  lastError,
  open,
  close,
  send,
  uploadFiles,
  emitTyping,
  emitRate,
  clearError,
  reportError,
} = useChat()

const rated = ref(false)

const composer = useChatComposer({
  sendMessage: send,
  uploadFiles,
  isClosed,
  reportError,
  clearError,
})
const {
  inputText,
  pendingFiles,
  sending,
  isRecording,
  isImage,
  isAudio,
  submit,
  onFileChange,
  removePending,
  toggleRecording,
} = composer

const offline = useChatOfflineForm()

// ── Офлайн-форма: показываем при отсутствии соединения 5+ сек ──
const showOfflineForm = ref(false)
let offlineTimer: ReturnType<typeof setTimeout> | null = null

watch(isOpen, (opened) => {
  if (opened && !isConnected.value) {
    offlineTimer = setTimeout(() => {
      if (!isConnected.value) showOfflineForm.value = true
    }, 5000)
  } else if (!opened) {
    if (offlineTimer) { clearTimeout(offlineTimer); offlineTimer = null }
    showOfflineForm.value = false
  }
})

watch(isConnected, (connected) => {
  if (connected) {
    showOfflineForm.value = false
    if (offlineTimer) { clearTimeout(offlineTimer); offlineTimer = null }
  }
})

function toggle() {
  if (isOpen.value) close()
  else open()
}

function rateChat(n: number) {
  emitRate(n)
  rated.value = true
}

let typingDebounce: ReturnType<typeof setTimeout> | null = null
function onInput() {
  if (typingDebounce) clearTimeout(typingDebounce)
  typingDebounce = setTimeout(() => emitTyping(), 400)
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const msgListEl = ref<HTMLElement | null>(null)
function setMsgListRef(el: Element | null) {
  msgListEl.value = (el as HTMLElement | null)
}

watch(
  () => messages.value.length,
  () => {
    nextTick(() => {
      if (msgListEl.value) {
        msgListEl.value.scrollTop = msgListEl.value.scrollHeight
      }
    })
  }
)

onUnmounted(() => {
  composer.cleanup()
})
</script>

<style scoped>
.chat-box__error {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin: 10px 14px 0;
  padding: 10px 12px;
  border: 1px solid rgba(174, 72, 72, .22);
  border-radius: 14px;
  background: rgba(255, 241, 238, .96);
  color: #9f3434;
  font-size: 13px;
  line-height: 1.35;
  box-shadow: 0 10px 26px rgba(97, 32, 26, .08);
}

.chat-box__error-close {
  flex: 0 0 auto;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  opacity: .72;
}

.chat-box__error-close:hover {
  opacity: 1;
}
</style>
