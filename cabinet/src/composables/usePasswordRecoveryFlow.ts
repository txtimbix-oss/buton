import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '@/api'
import { getErrorMessage } from '@/composables/getErrorMessage'
import { getQueryString } from '@/composables/getQueryString'

type PasswordRecoveryMode = 'forgot' | 'reset'

interface ForgotFlow {
  email: Ref<string>
  sentEmail: Ref<string>
  error: Ref<string>
  success: Ref<boolean>
  loading: Ref<boolean>
  updateEmail: (value: string) => void
  submit: () => Promise<void>
}

interface ResetFlow {
  password: Ref<string>
  confirm: Ref<string>
  hasToken: ComputedRef<boolean>
  error: Ref<string>
  successMessage: Ref<string>
  loading: Ref<boolean>
  updatePassword: (value: string) => void
  updateConfirm: (value: string) => void
  submit: () => Promise<void>
}

export function usePasswordRecoveryFlow(mode: 'forgot'): ForgotFlow
export function usePasswordRecoveryFlow(mode: 'reset'): ResetFlow
export function usePasswordRecoveryFlow(mode: PasswordRecoveryMode) {
  const route = useRoute()

  const error = ref('')
  const loading = ref(false)

  async function runRecoveryAction(action: () => Promise<void>) {
    error.value = ''
    loading.value = true

    try {
      await action()
    } catch (submitError) {
      error.value = getErrorMessage(submitError)
    } finally {
      loading.value = false
    }
  }

  if (mode === 'forgot') {
    const email = ref('')
    const sentEmail = ref('')
    const success = ref(false)

    return {
      email,
      sentEmail,
      error,
      success,
      loading,
      updateEmail: (value: string) => {
        email.value = value
      },
      submit: () => runRecoveryAction(async () => {
        await api.forgotPassword(email.value)
        sentEmail.value = email.value
        success.value = true
      }),
    }
  }

  const token = computed(() => getQueryString(route.query.token))
  const hasToken = computed(() => !!token.value)
  const password = ref('')
  const confirm = ref('')
  const successMessage = ref('')

  return {
    password,
    confirm,
    hasToken,
    error,
    successMessage,
    loading,
    updatePassword: (value: string) => {
      password.value = value
    },
    updateConfirm: (value: string) => {
      confirm.value = value
    },
    submit: async () => {
      if (password.value !== confirm.value || !token.value) {
        return
      }

      await runRecoveryAction(async () => {
        await api.resetPassword(token.value, password.value)
        successMessage.value = 'Пароль успешно изменён! Теперь вы можете войти.'
      })
    },
  }
}
