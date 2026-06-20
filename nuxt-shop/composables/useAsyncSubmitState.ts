import { ref } from 'vue'
import { normalizeApiError } from '~/lib/api/errors'

export interface UseAsyncSubmitStateOptions {
  errorMessage: string
}

export function useAsyncSubmitState(options: UseAsyncSubmitStateOptions) {
  const loading = ref(false)
  const sent = ref(false)
  const apiError = ref('')

  function clearError() {
    apiError.value = ''
  }

  function setError(message: string) {
    apiError.value = message
  }

  async function run(action: () => Promise<unknown>) {
    if (loading.value) return false

    loading.value = true
    clearError()

    try {
      await action()
      sent.value = true
      return true
    } catch (error) {
      setError(normalizeApiError(error, options.errorMessage))
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    sent,
    apiError,
    clearError,
    setError,
    run,
  }
}
