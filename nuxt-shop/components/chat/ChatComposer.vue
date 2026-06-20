<template>
  <div>
    <!-- Превью выбранных файлов -->
    <div v-if="pendingFiles.length" class="chat-box__previews">
      <div v-for="(p, i) in pendingFiles" :key="i" class="chat-preview-item">
        <img v-if="p.preview" :src="p.preview" class="chat-preview-img" :alt="p.file.name" />
        <span v-else class="chat-preview-name">{{ p.file.name }}</span>
        <button class="chat-preview-rm" @click="emit('removePending', i)" aria-label="Убрать">×</button>
      </div>
    </div>

    <div class="chat-box__foot">
      <!-- Прикрепить файл -->
      <button
        class="chat-box__attach iconbtn"
        :disabled="isClosed || sending"
        aria-label="Прикрепить файл"
        @click="fileInputEl?.click()"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
        </svg>
      </button>
      <input
        ref="fileInputEl"
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx"
        class="chat-box__file-input"
        @change="emit('fileChange', $event)"
      />

      <!-- Кнопка микрофона -->
      <button
        class="chat-box__attach iconbtn"
        :class="{ 'chat-box__mic--active': isRecording }"
        :disabled="isClosed"
        :title="isRecording ? 'Остановить запись' : 'Голосовое сообщение'"
        aria-label="Голосовое сообщение"
        @click="emit('toggleRecording')"
      >
        <svg v-if="!isRecording" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        <svg v-else viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
          <rect x="4" y="4" width="16" height="16" rx="2"/>
        </svg>
      </button>

      <input
        :value="inputText"
        class="chat-box__input input"
        placeholder="Ваш вопрос…"
        :disabled="isClosed || sending"
        maxlength="1000"
        @input="emit('update:inputText', ($event.target as HTMLInputElement).value); emit('typing')"
        @keydown.enter.prevent="emit('submit')"
      />
      <button
        class="chat-box__send btn btn--green"
        :disabled="(!inputText.trim() && !pendingFiles.length) || isClosed || sending"
        aria-label="Отправить"
        @click="emit('submit')"
      >
        <span v-if="sending" class="chat-send-spin" />
        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface PendingFile {
  file: File
  preview: string | null
}

defineProps<{
  inputText: string
  isClosed: boolean
  sending: boolean
  isRecording: boolean
  pendingFiles: PendingFile[]
}>()

const emit = defineEmits<{
  'update:inputText': [value: string]
  submit: []
  fileChange: [event: Event]
  toggleRecording: []
  typing: []
  removePending: [index: number]
}>()

const fileInputEl = ref<HTMLInputElement | null>(null)
</script>

<style scoped>
.chat-box__file-input {
  display: none;
}
</style>
