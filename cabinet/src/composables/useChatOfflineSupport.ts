import { computed, getCurrentScope, onScopeDispose, ref, watch, type Ref } from 'vue'
import { normalizeCabinetApiError } from '@/api/errors'
import { createPublicBotGuard } from '@/utils/publicBotGuard'

export function useChatOfflineSupport(isOpen: Ref<boolean>, isConnected: Ref<boolean>) {
  const showOfflineForm = ref(false)
  const offlineName = ref('')
  const offlineEmail = ref('')
  const offlineMsg = ref('')
  const offlineSending = ref(false)
  const offlineSent = ref(false)
  const offlineError = ref('')
  const offlineBotGuard = createPublicBotGuard()
  let offlineTimer: ReturnType<typeof setTimeout> | null = null

  const offlineSubmitDisabled = computed(() => {
    return !offlineName.value.trim()
      || !isUsableEmail(offlineEmail.value)
      || !offlineMsg.value.trim()
  })

  function clearOfflineTimer() {
    if (offlineTimer) {
      clearTimeout(offlineTimer)
      offlineTimer = null
    }
  }

  function isUsableEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  }

  function resetOfflineSession() {
    showOfflineForm.value = false
    offlineSent.value = false
    offlineError.value = ''
  }

  function scheduleOfflineFallback() {
    clearOfflineTimer()
    resetOfflineSession()
    offlineTimer = setTimeout(() => {
      if (isOpen.value && !isConnected.value) showOfflineForm.value = true
    }, 5000)
  }

  watch(isOpen, (opened) => {
    clearOfflineTimer()

    if (opened) {
      if (!isConnected.value) scheduleOfflineFallback()
      return
    }

    resetOfflineSession()
  }, { immediate: true })

  watch(isConnected, (connected) => {
    if (connected) {
      showOfflineForm.value = false
      clearOfflineTimer()
      return
    }

    if (isOpen.value) scheduleOfflineFallback()
  }, { immediate: true })

  async function submitOffline() {
    if (offlineSubmitDisabled.value) return

    offlineSending.value = true
    offlineError.value = ''

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...offlineBotGuard.headers() },
        body: JSON.stringify(offlineBotGuard.withBody({
          type: 'custom',
          name: offlineName.value.trim(),
          email: offlineEmail.value.trim(),
          message: offlineMsg.value.trim(),
          source: 'chat_offline',
        })),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        offlineError.value = normalizeCabinetApiError(
          { status: response.status, data },
          'Не удалось отправить сообщение. Попробуйте чуть позже.',
        )
        return
      }

      offlineSent.value = true
    } catch (error) {
      offlineError.value = normalizeCabinetApiError(error, 'Не удалось отправить сообщение. Проверьте интернет и попробуйте ещё раз.')
    } finally {
      offlineSending.value = false
    }
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      clearOfflineTimer()
    })
  }

  return {
    showOfflineForm,
    offlineName,
    offlineEmail,
    offlineMsg,
    offlineSending,
    offlineSent,
    offlineError,
    offlineSubmitDisabled,
    submitOffline,
  }
}
