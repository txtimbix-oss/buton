<template>
  <AuthShell quote="«Цветы говорят то, что слова не могут»" bloom-class="auth-bloom-cream">
    <div class="auth-card">
      <AuthIntroBlock
        title="Войти в кабинет"
        lead="Управляйте заказами, бонусами и адресами"
      />

      <AuthErrorBlock v-if="error" :message="error" />

      <form @submit.prevent="submit">
        <label class="field">
          <span>Email</span>
          <input v-model="form.email" class="input" type="email" placeholder="you@mail.ru" autocomplete="email" required />
        </label>
        <PasswordField v-model="form.password" label="Пароль" placeholder="Ваш пароль" autocomplete="current-password" required />

        <div class="auth-forgot-action">
          <RouterLink to="/forgot-password" class="link-clay">Забыли пароль? →</RouterLink>
        </div>

        <button class="btn btn--ink btn--block btn--auth" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner spinner--md spinner--light"></span>
          <span v-else>Войти</span>
        </button>
      </form>
    </div>

    <template #below>
      <AuthBelowLink text="Нет аккаунта? " to="/register" link-text="Зарегистрироваться →" />
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import AuthShell from '@/components/AuthShell.vue'
import AuthBelowLink from '@/components/auth/login-register/AuthBelowLink.vue'
import AuthErrorBlock from '@/components/auth/login-register/AuthErrorBlock.vue'
import AuthIntroBlock from '@/components/auth/login-register/AuthIntroBlock.vue'
import PasswordField from '@/components/PasswordField.vue'
import { useAuthEntryFlow } from '@/composables/useAuthEntryFlow'

const { form, error, loading, submit } = useAuthEntryFlow('login')
</script>

<style scoped>
.auth-forgot-action { text-align: right; margin-bottom: 16px; }
</style>
