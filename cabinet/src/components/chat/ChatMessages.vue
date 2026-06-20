<template>
  <div ref="msgListEl" class="chat-box__msgs">
    <p v-if="messages.length === 0 && !isConnected" class="chat-box__hint">
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

    <div v-if="adminTyping" class="chat-msg chat-msg--admin">
      <div class="chat-msg__bubble chat-typing">
        <span/><span/><span/>
      </div>
    </div>

    <div v-if="isClosed" class="chat-rating">
      <template v-if="!rated">
        <p class="chat-box__hint">Оцените нашу поддержку:</p>
        <div class="chat-rating__stars">
          <button
            v-for="n in 5"
            :key="n"
            class="chat-star"
            :class="{ 'is-on': n <= hoverRating }"
            @mouseenter="emit('update:hoverRating', n)"
            @mouseleave="emit('update:hoverRating', 0)"
            @click="emit('rate', n)"
          >★</button>
        </div>
      </template>
      <p v-else class="chat-box__hint chat-box__hint--closed">Спасибо за оценку!</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

interface ChatMessageAttachment {
  url: string
  name?: string
  mimeType: string
}

interface ChatMessageItem {
  _id: string
  sender: 'user' | 'admin'
  text?: string
  attachments?: ChatMessageAttachment[]
  createdAt: string
}

const props = defineProps<{
  messages: ChatMessageItem[]
  isConnected: boolean
  adminTyping: boolean
  isClosed: boolean
  rated: boolean
  hoverRating: number
}>()

const emit = defineEmits<{
  rate: [value: number]
  'update:hoverRating': [value: number]
}>()

const msgListEl = ref<HTMLElement | null>(null)

function isImage(mimeType: string): boolean {
  return mimeType?.startsWith('image/')
}

function isAudio(mimeType: string): boolean {
  return mimeType?.startsWith('audio/')
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      if (msgListEl.value) {
        msgListEl.value.scrollTop = msgListEl.value.scrollHeight
      }
    })
  }
)
</script>
