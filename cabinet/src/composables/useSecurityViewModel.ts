import { ref } from 'vue'
import { api } from '@/api'
import { getErrorMessage } from '@/composables/getErrorMessage'
import { useAuthStore } from '@/stores/auth'

type SecurityPasswordForm = {
  old: string
  new: string
  confirm: string
}

const EMPTY_FORM: SecurityPasswordForm = {
  old: '',
  new: '',
  confirm: '',
}

export function useSecurityViewModel() {
  const auth = useAuthStore()
  const form = ref<SecurityPasswordForm>({ ...EMPTY_FORM })
  const saving = ref(false)
  const success = ref('')
  const error = ref('')

  async function save() {
    if (form.value.new !== form.value.confirm) return

    saving.value = true
    success.value = ''
    error.value = ''
    try {
      await api.changePassword(form.value.old, form.value.new)
      success.value = 'Пароль успешно изменён'
      form.value = { ...EMPTY_FORM }
    } catch (cause: unknown) {
      error.value = getErrorMessage(cause, 'Не удалось изменить пароль. Проверьте данные и попробуйте ещё раз.')
    } finally {
      saving.value = false
    }
  }

  function logout() {
    auth.logout()
  }

  return {
    error,
    form,
    logout,
    save,
    saving,
    success,
  }
}
