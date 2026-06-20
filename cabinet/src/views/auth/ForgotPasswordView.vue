<template>
  <AuthShell quote="«Каждый букет — это маленькое письмо»" bloom-class="auth-bloom-lav">
    <div class="auth-card" id="forgotCard">
      <RecoveryStateBlock
        v-if="!success"
        title="Восстановление пароля"
        lead="Введите email — пришлём ссылку для сброса"
      >
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="5"/><path d="M11.5 11.5L21 21M17 17l3-3M15 19l2-2"/></svg>
        </template>
      </RecoveryStateBlock>

      <RecoveryStateBlock v-if="success" success title="Письмо отправлено">
        <template #icon>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
        </template>
        Проверьте {{ sentEmail }} — там ссылка для входа
      </RecoveryStateBlock>

      <div v-if="error" class="alert-err">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        {{ error }}
      </div>

      <ForgotPasswordFormSection
        v-if="!success"
        :email="email"
        :loading="loading"
        @submit="submit"
        @update:email="updateEmail"
      />
    </div>

    <template #below>
      <RouterLink to="/login" class="link-clay">← Назад к входу</RouterLink>
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import AuthShell from '@/components/AuthShell.vue'
import ForgotPasswordFormSection from '@/components/auth/recovery/ForgotPasswordFormSection.vue'
import RecoveryStateBlock from '@/components/auth/recovery/RecoveryStateBlock.vue'
import { usePasswordRecoveryFlow } from '@/composables/usePasswordRecoveryFlow'

const { email, sentEmail, error, success, loading, updateEmail, submit } = usePasswordRecoveryFlow('forgot')
</script>
