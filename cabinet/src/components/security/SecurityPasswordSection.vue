<template>
  <div class="cab-section cab-section--compact">
    <h2 class="sec-title">Смена пароля</h2>
    <div class="cab-card">
      <div class="security-head">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
        <span class="security-head__text">Введите текущий пароль и придумайте новый</span>
      </div>

      <div v-if="success" class="alert alert--success alert--mb">{{ success }}</div>
      <div v-if="error" class="alert alert--error alert--mb">{{ error }}</div>

      <form @submit.prevent="submit">
        <PasswordField v-model="oldPassword" label="Текущий пароль" required autocomplete="current-password" />
        <PasswordField v-model="newPassword" label="Новый пароль" :hint="PASSWORD_MIN_LENGTH_HINT" :placeholder="PASSWORD_MIN_LENGTH_PLACEHOLDER" required autocomplete="new-password" :minlength="PASSWORD_MIN_LENGTH" show-strength />
        <PasswordConfirmField v-model="confirmPassword" label="Повторите новый пароль" :password="form.new" :minlength="PASSWORD_MIN_LENGTH" required />
        <button class="btn btn--primary" type="submit" :disabled="isSubmitDisabled">
          <span v-if="saving" class="spinner spinner--sm spinner--ink"></span>
          <span v-else>Сменить пароль</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PasswordField from '@/components/PasswordField.vue'
import PasswordConfirmField from '@/components/PasswordConfirmField.vue'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_HINT,
  PASSWORD_MIN_LENGTH_PLACEHOLDER,
  usePasswordPolicy,
} from '@/composables/usePasswordPolicy'

type SecurityPasswordForm = {
  old: string
  new: string
  confirm: string
}

const props = defineProps<{
  form: SecurityPasswordForm
  saving: boolean
  success: string
  error: string
}>()

const emit = defineEmits<{
  'update:form': [form: SecurityPasswordForm]
  submit: []
}>()

const oldPassword = computed({
  get: () => props.form.old,
  set: (value: string) => emit('update:form', { ...props.form, old: value }),
})

const newPassword = computed({
  get: () => props.form.new,
  set: (value: string) => emit('update:form', { ...props.form, new: value }),
})

const confirmPassword = computed({
  get: () => props.form.confirm,
  set: (value: string) => emit('update:form', { ...props.form, confirm: value }),
})

const { hasMismatch } = usePasswordPolicy(() => props.form.new, () => props.form.confirm)

const isSubmitDisabled = computed(() => props.saving || hasMismatch.value)

function submit() {
  emit('submit')
}
</script>
