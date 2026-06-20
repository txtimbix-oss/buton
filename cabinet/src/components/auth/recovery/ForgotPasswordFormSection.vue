<template>
  <form @submit.prevent="emit('submit')">
    <label class="field">
      <span>Email *</span>
      <input
        :value="email"
        class="input"
        type="email"
        placeholder="you@mail.ru"
        required
        autocomplete="email"
        @input="updateEmail"
      />
    </label>
    <button class="btn btn--ink btn--block btn--auth" type="submit" :disabled="loading">
      <span v-if="loading" class="spinner spinner--md spinner--light"></span>
      <span v-else>Отправить ссылку</span>
    </button>
  </form>
</template>

<script setup lang="ts">
defineProps<{
  email: string
  loading: boolean
}>()

const emit = defineEmits<{
  submit: []
  'update:email': [value: string]
}>()

function updateEmail(event: Event) {
  emit('update:email', (event.target as HTMLInputElement).value)
}
</script>
