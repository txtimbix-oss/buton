<template>
  <AuthShell quote="«Дарите цветы без повода — повод найдётся сам»" bloom-class="auth-bloom-rose">
    <div class="auth-card">
      <AuthIntroBlock
        eyebrow="300 бонусов за первый заказ"
        title="Создать аккаунт"
        lead="Регистрация займёт меньше минуты"
      />

      <AuthErrorBlock v-if="error" :message="error" />

      <form @submit.prevent="submit">
        <div class="row-2">
          <label class="field"><span>Имя *</span><input v-model="form.firstName" class="input" type="text" placeholder="Анна" required autocomplete="given-name" /></label>
          <label class="field"><span>Фамилия *</span><input v-model="form.lastName" class="input" type="text" placeholder="Петрова" required autocomplete="family-name" /></label>
        </div>

        <label class="field"><span>Email *</span><input v-model="form.email" class="input" type="email" placeholder="you@mail.ru" required autocomplete="email" /></label>
        <label class="field"><span>Телефон</span><input v-model="form.phone" class="input" type="tel" placeholder="+7 (___) ___-__-__" autocomplete="tel" /></label>

        <PasswordField v-model="form.password" label="Пароль *" :hint="PASSWORD_MIN_LENGTH_HINT" :placeholder="PASSWORD_MIN_LENGTH_PLACEHOLDER" autocomplete="new-password" :minlength="PASSWORD_MIN_LENGTH" required show-strength />
        <PasswordConfirmField v-model="form.confirm" label="Повторите пароль *" :password="form.password" :minlength="PASSWORD_MIN_LENGTH" required />

        <button class="btn btn--clay-solid btn--block btn--auth btn--spaced" type="submit" :disabled="loading || hasPasswordMismatch">
          <span v-if="loading" class="spinner spinner--md spinner--light"></span>
          <span v-else>Создать аккаунт</span>
        </button>
        <p class="fineprint">Создавая аккаунт, вы принимаете условия использования и политику конфиденциальности</p>
      </form>
    </div>

    <template #below>
      <AuthBelowLink text="Уже есть аккаунт? " to="/login" link-text="Войти →" />
    </template>
  </AuthShell>
</template>

<script setup lang="ts">
import AuthShell from '@/components/AuthShell.vue'
import AuthBelowLink from '@/components/auth/login-register/AuthBelowLink.vue'
import AuthErrorBlock from '@/components/auth/login-register/AuthErrorBlock.vue'
import AuthIntroBlock from '@/components/auth/login-register/AuthIntroBlock.vue'
import PasswordField from '@/components/PasswordField.vue'
import PasswordConfirmField from '@/components/PasswordConfirmField.vue'
import { useAuthEntryFlow } from '@/composables/useAuthEntryFlow'
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_MIN_LENGTH_HINT,
  PASSWORD_MIN_LENGTH_PLACEHOLDER,
} from '@/composables/usePasswordPolicy'

const { form, error, loading, hasPasswordMismatch, submit } = useAuthEntryFlow('register')
</script>

<style scoped>
.btn--spaced { margin-top: 14px; }
.fineprint { font-size: 11px; color: var(--muted); margin-top: 12px; text-align: center; line-height: 1.5; }
</style>
