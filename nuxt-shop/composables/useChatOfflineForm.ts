import { ref } from 'vue'

import { usePublicBotGuard } from '~/composables/usePublicBotGuard'

type ChatOfflineInquiryPayload = {
  type: 'custom'
  name: string
  email: string
  message: string
  source: 'chat_offline'
  _botGuard: ReturnType<ReturnType<typeof usePublicBotGuard>['payload']>
}

export interface UseChatOfflineFormDeps {
  submit?: (payload: ChatOfflineInquiryPayload) => Promise<unknown>
  botGuard?: ReturnType<typeof usePublicBotGuard>
}

export function useChatOfflineForm(deps: UseChatOfflineFormDeps = {}) {
  const name = ref('')
  const email = ref('')
  const message = ref('')
  const sending = ref(false)
  const sent = ref(false)
  const botGuard = deps.botGuard ?? usePublicBotGuard()

  function defaultSubmit(payload: ChatOfflineInquiryPayload) {
    return fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...botGuard.headers() },
      body: JSON.stringify(payload),
    })
  }

  async function submit() {
    const trimmedName = name.value.trim()
    const trimmedMessage = message.value.trim()
    if (sending.value || sent.value || !trimmedName || !trimmedMessage) return
    sending.value = true
    try {
      await (deps.submit ?? defaultSubmit)(botGuard.withBody({
        type: 'custom',
        name: trimmedName,
        email: email.value.trim(),
        message: trimmedMessage,
        source: 'chat_offline',
      }))
      sent.value = true
    } finally {
      sending.value = false
    }
  }

  return { name, email, message, sending, sent, botGuard, submit }
}
