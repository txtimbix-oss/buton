<template>
  <div class="chat-offline">
    <template v-if="!sent">
      <p class="chat-offline__title">Нет соединения. Оставьте сообщение — ответим по email.</p>
      <input
        :value="name"
        class="input chat-offline__field"
        placeholder="Ваше имя *"
        maxlength="80"
        @input="emit('update:name', ($event.target as HTMLInputElement).value)"
      />
      <input
        :value="email"
        type="email"
        class="input chat-offline__field"
        placeholder="Email *"
        maxlength="120"
        @input="emit('update:email', ($event.target as HTMLInputElement).value)"
      />
      <textarea
        :value="message"
        class="input chat-offline__field"
        placeholder="Ваш вопрос *"
        rows="3"
        maxlength="1000"
        @input="emit('update:message', ($event.target as HTMLTextAreaElement).value)"
      />
      <button
        class="btn btn--green btn--sm chat-offline__btn"
        :disabled="sending || !name.trim() || !message.trim()"
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
}>()

const emit = defineEmits<{
  'update:name': [value: string]
  'update:email': [value: string]
  'update:message': [value: string]
  submit: []
}>()
</script>
