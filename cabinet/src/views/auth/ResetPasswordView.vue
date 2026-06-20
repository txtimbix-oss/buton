<template>
  <AuthShell quote="«Цветы возвращают свет даже в самый длинный день»" bloom-class="auth-bloom-cream">
    <div class="auth-card">
      <RecoveryStateBlock
        title="Новый пароль"
        lead="Придумайте надёжный пароль (минимум 8 символов)"
        :centered="false"
      />

      <div v-if="error" class="alert alert--error">{{ error }}</div>
      <div v-if="successMessage" class="alert alert--success">{{ successMessage }}</div>

      <template v-if="!hasToken">
        <div class="alert alert--error">Ссылка недействительна. Запросите сброс пароля заново.</div>
      </template>

      <ResetPasswordFormSection
        v-else-if="!successMessage"
        :password="password"
        :confirm="confirm"
        :loading="loading"
        @submit="submit"
        @update:password="updatePassword"
        @update:confirm="updateConfirm"
      />

      <p v-if="successMessage" class="auth-footer">
        <RouterLink to="/login" class="btn btn--primary auth-form-link">
          Войти
        </RouterLink>
      </p>

      <p v-else class="auth-footer">
        <RouterLink to="/login">← Ко входу</RouterLink>
      </p>
    </div>
  </AuthShell>
</template>

<style scoped>
.auth-form-link { display: inline-block; margin-top: 8px; }
</style>

<script setup lang="ts">
import AuthShell from '@/components/AuthShell.vue'
import RecoveryStateBlock from '@/components/auth/recovery/RecoveryStateBlock.vue'
import ResetPasswordFormSection from '@/components/auth/recovery/ResetPasswordFormSection.vue'
import { usePasswordRecoveryFlow } from '@/composables/usePasswordRecoveryFlow'

const {
  hasToken,
  password,
  confirm,
  error,
  successMessage,
  loading,
  updatePassword,
  updateConfirm,
  submit,
} = usePasswordRecoveryFlow('reset')
</script>
