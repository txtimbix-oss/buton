import { computed, reactive, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getErrorMessage } from '@/composables/getErrorMessage'
import { getQueryString } from '@/composables/getQueryString'

type AuthEntryMode = 'login' | 'register'

interface LoginForm {
  email: string
  password: string
}

interface RegisterForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  confirm: string
}

interface LoginFlow {
  form: LoginForm
  error: Ref<string>
  loading: Ref<boolean>
  submit: () => Promise<void>
}

interface RegisterFlow {
  form: RegisterForm
  error: Ref<string>
  loading: Ref<boolean>
  hasPasswordMismatch: ComputedRef<boolean>
  submit: () => Promise<void>
}

export function useAuthEntryFlow(mode: 'login'): LoginFlow
export function useAuthEntryFlow(mode: 'register'): RegisterFlow
export function useAuthEntryFlow(mode: AuthEntryMode) {
  const router = useRouter()
  const route = useRoute()
  const auth = useAuthStore()

  const error = ref('')
  const loading = ref(false)
  const redirect = computed(() => getQueryString(route.query.redirect) || '/dashboard')
  const referralCode = computed(() => getQueryString(route.query.ref) || undefined)

  async function runEntryAction(action: () => Promise<void>) {
    error.value = ''
    loading.value = true

    try {
      await action()
      await router.push(redirect.value)
    } catch (submitError) {
      error.value = getErrorMessage(submitError)
    } finally {
      loading.value = false
    }
  }

  if (mode === 'login') {
    const form = reactive<LoginForm>({
      email: '',
      password: '',
    })

    return {
      form,
      error,
      loading,
      submit: () => runEntryAction(() => auth.login(form.email, form.password)),
    }
  }

  const form = reactive<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })

  const hasPasswordMismatch = computed(() => !!form.confirm && form.confirm !== form.password)

  return {
    form,
    error,
    loading,
    hasPasswordMismatch,
    submit: async () => {
      if (hasPasswordMismatch.value) {
        return
      }

      await runEntryAction(() => auth.register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        referralCode: referralCode.value,
      }))
    },
  }
}
