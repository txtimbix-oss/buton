<template>
  <form @submit.prevent="emit('submit')">
    <PasswordField
      :model-value="password"
      label="Новый пароль"
      required
      autocomplete="new-password"
      :minlength="PASSWORD_MIN_LENGTH"
      show-strength
      @update:model-value="emit('update:password', $event)"
    />
    <PasswordConfirmField
      :model-value="confirm"
      label="Повторите пароль"
      :password="password"
      :minlength="PASSWORD_MIN_LENGTH"
      required
      placeholder="••••••••"
      @update:model-value="emit('update:confirm', $event)"
    />

    <button class="btn btn--primary btn--full btn--lg" type="submit" :disabled="loading || hasMismatch">
      <span v-if="loading" class="spinner"></span>
      <span v-else>Сохранить пароль</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import PasswordField from '@/components/PasswordField.vue'
import PasswordConfirmField from '@/components/PasswordConfirmField.vue'
import { PASSWORD_MIN_LENGTH, usePasswordPolicy } from '@/composables/usePasswordPolicy'

const props = defineProps<{
  password: string
  confirm: string
  loading: boolean
}>()

const emit = defineEmits<{
  submit: []
  'update:password': [value: string]
  'update:confirm': [value: string]
}>()

const { hasMismatch } = usePasswordPolicy(() => props.password, () => props.confirm)
</script>
