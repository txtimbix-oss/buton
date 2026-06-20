<template>
  <div class="chat-offline">
    <template v-if="!sent">
      <p class="chat-offline__title">Нет соединения. Оставьте сообщение — ответим по email.</p>
      <input
        :value="name"
        class="input chat-offline__field"
        placeholder="Ваше имя *"
        maxlength="80"
        @input="onNameInput"
      />
      <input
        :value="email"
        type="email"
        class="input chat-offline__field"
        placeholder="Email *"
        maxlength="120"
        @input="onEmailInput"
      />
      <textarea
        :value="message"
        class="input chat-offline__field"
        placeholder="Ваш вопрос *"
        rows="3"
        maxlength="1000"
        @input="onMessageInput"
      />
      <p v-if="error" class="chat-offline__error">{{ error }}</p>
      <button
        class="btn btn--primary btn--sm chat-offline__btn"
        :disabled="sending || submitDisabled"
        @click="emit('submit')"
      >{{ sending ? 'Отправка…' : 'Отправить' }}</button>
    </template>
    <p v-else class="chat-offline__thanks">Спасибо! Мы свяжемся с вами в ближайшее время.</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string
  email: string
  message: string
  sending: boolean
  sent: boolean
  error?: string
  submitDisabled: boolean
}>()

const emit = defineEmits<{
  submit: []
  'update:name': [value: string]
  'update:email': [value: string]
  'update:message': [value: string]
}>()

function onNameInput(event: Event) {
  emit('update:name', (event.target as HTMLInputElement).value)
}

function onEmailInput(event: Event) {
  emit('update:email', (event.target as HTMLInputElement).value)
}

function onMessageInput(event: Event) {
  emit('update:message', (event.target as HTMLTextAreaElement).value)
}
</script>
