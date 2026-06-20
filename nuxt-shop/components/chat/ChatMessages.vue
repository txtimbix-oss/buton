<template>
  <div :ref="listRef" class="chat-box__msgs">
    <!-- Проактивное сообщение от бота -->
    <div v-if="proactiveMsg && messages.length === 0" class="chat-msg chat-msg--admin chat-msg--proactive">
      <div class="chat-msg__bubble">{{ proactiveMsg }}</div>
    </div>

    <p v-else-if="messages.length === 0 && !isConnected" class="chat-box__hint">
      Здравствуйте! Напишите нам — ответим в ближайшее время.
    </p>
    <p v-else-if="messages.length === 0 && isConnected" class="chat-box__hint">
      Мы здесь. Напишите ваш вопрос.
    </p>

    <div
      v-for="msg in messages"
      :key="msg._id"
      class="chat-msg"
      :class="msg.sender === 'user' ? 'chat-msg--user' : 'chat-msg--admin'"
    >
      <div class="chat-msg__bubble">
        <span v-if="msg.text">{{ msg.text }}</span>
        <!-- Вложения -->
        <div v-if="msg.attachments?.length" class="chat-msg__atts">
          <template v-for="att in msg.attachments" :key="att.url">
            <a
              v-if="isImage(att.mimeType)"
              :href="att.url"
              target="_blank"
              rel="noopener"
              class="chat-att-img"
            >
              <img :src="att.url" :alt="att.name" />
            </a>
            <audio
              v-else-if="isAudio(att.mimeType)"
              :src="att.url"
              controls
              class="chat-audio"
            />
            <a
              v-else
              :href="att.url"
              target="_blank"
              rel="noopener"
              class="chat-att-file"
              download
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="13" height="13">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <span>{{ att.name || 'Файл' }}</span>
            </a>
          </template>
        </div>
      </div>
      <div class="chat-msg__time">{{ formatTime(msg.createdAt) }}</div>
    </div>

    <!-- Печатает... -->
    <div v-if="adminTyping" class="chat-msg chat-msg--admin">
      <div class="chat-msg__bubble chat-typing">
        <span/><span/><span/>
      </div>
    </div>

    <!-- Оценка поддержки после закрытия -->
    <ChatRating v-if="isClosed" :rated="rated" @rate="emit('rate', $event)" />
  </div>
</template>

<script setup lang="ts">
import type { ChatMessage } from '~/composables/useChat'

defineProps<{
  messages: ChatMessage[]
  proactiveMsg: string
  isConnected: boolean
  adminTyping: boolean
  isClosed: boolean
  rated: boolean
  isImage: (mimeType: string) => boolean
  isAudio: (mimeType: string) => boolean
  formatTime: (iso: string) => string
  listRef: (el: Element | null) => void
}>()

const emit = defineEmits<{
  rate: [value: number]
}>()
</script>
