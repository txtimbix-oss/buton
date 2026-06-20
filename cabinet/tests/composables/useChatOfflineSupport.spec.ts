import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useChatOfflineSupport } from '@/composables/useChatOfflineSupport'

describe('useChatOfflineSupport', () => {
  it('показывает форму через 5 секунд после открытия без подключения', async () => {
    vi.useFakeTimers()

    const isOpen = ref(false)
    const isConnected = ref(true)

    const {
      showOfflineForm,
      offlineName,
      offlineEmail,
      offlineMsg,
      offlineSubmitDisabled,
      offlineSent,
      submitOffline,
    } = useChatOfflineSupport(isOpen, isConnected)

    isOpen.value = true
    isConnected.value = false
    await nextTick()

    expect(showOfflineForm.value).toBe(false)
    vi.advanceTimersByTime(5000)
    expect(showOfflineForm.value).toBe(true)

    offlineName.value = 'John'
    offlineEmail.value = 'john@example.com'
    offlineMsg.value = 'Помогите'

    const fetchMock = vi.fn(async () => ({ ok: true } as Response))
    vi.stubGlobal('fetch', fetchMock)
    await submitOffline()
    expect(offlineSent.value).toBe(true)

    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('не отправляет форму, если поля невалидны', async () => {
    vi.useFakeTimers()

    const isOpen = ref(false)
    const isConnected = ref(true)

    const {
      offlineSubmitDisabled,
      offlineName,
      offlineEmail,
      offlineMsg,
      submitOffline,
    } = useChatOfflineSupport(isOpen, isConnected)

    offlineName.value = ''
    offlineEmail.value = 'bad-email'
    offlineMsg.value = ''

    expect(offlineSubmitDisabled.value).toBe(true)

    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    await submitOffline()
    expect(fetchMock).not.toHaveBeenCalled()
    vi.unstubAllGlobals()

    vi.useRealTimers()
  })

  it('скрывает форму и сбрасывает таймер при подключении', async () => {
    vi.useFakeTimers()

    const isOpen = ref(true)
    const isConnected = ref(false)

    const { showOfflineForm } = useChatOfflineSupport(isOpen, isConnected)

    vi.advanceTimersByTime(5000)
    await nextTick()
    expect(showOfflineForm.value).toBe(true)

    isConnected.value = true
    await nextTick()
    expect(showOfflineForm.value).toBe(false)

    vi.unstubAllGlobals()
    vi.useRealTimers()
  })
})
