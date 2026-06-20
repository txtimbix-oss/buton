import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

const chatIsOpen = ref(false)
const chatIsClosed = ref(false)
const chatState = {
  messages: ref([]),
  chatId: ref(null as string | null),
  isOpen: chatIsOpen,
  unread: ref(0),
  isConnected: ref(false),
  adminTyping: ref(false),
  isClosed: chatIsClosed,
  open: vi.fn(),
  close: vi.fn(),
  send: vi.fn(),
  uploadFiles: vi.fn(),
  emitTyping: vi.fn(),
  emitRate: vi.fn(),
}

const offlineState = {
  showOfflineForm: ref(false),
  offlineName: ref(''),
  offlineEmail: ref(''),
  offlineMsg: ref(''),
  offlineSending: ref(false),
  offlineSent: ref(false),
  offlineSubmitDisabled: ref(true),
  submitOffline: vi.fn(),
}

const composerState = {
  inputText: ref(''),
  pendingFiles: ref([] as Array<{ file: File; preview: string | null }>),
  sending: ref(false),
  isRecording: ref(false),
  submit: vi.fn(),
  onFileChange: vi.fn(),
  removePending: vi.fn(),
  toggleRecording: vi.fn(),
  onInput: vi.fn(),
}

vi.mock('@/composables/useChat', () => ({
  useChat: () => chatState,
}))

vi.mock('@/composables/useChatOfflineSupport', () => ({
  useChatOfflineSupport: () => offlineState,
}))

vi.mock('@/composables/useChatComposer', () => ({
  useChatComposer: () => composerState,
}))

import { useChatWidget } from '@/composables/useChatWidget'

describe('useChatWidget', () => {
  beforeEach(() => {
    chatIsOpen.value = false
    chatIsClosed.value = false
    chatState.open.mockReset()
    chatState.close.mockReset()
    chatState.emitRate.mockReset()
    chatState.emitTyping.mockReset()
    offlineState.submitOffline.mockReset()
    composerState.submit.mockReset()
  })

  it('переключает чат через open/close в зависимости от состояния', () => {
    const widget = useChatWidget()

    widget.toggle()
    expect(chatState.open).toHaveBeenCalledTimes(1)

    chatIsOpen.value = true
    widget.toggle()
    expect(chatState.close).toHaveBeenCalledTimes(1)
  })

  it('сбрасывает rating стейт при закрытии оффлайн-статуса', async () => {
    const widget = useChatWidget()
    widget.rated.value = true
    widget.hoverRating.value = 5

    chatIsClosed.value = true
    await nextTick()
    chatIsClosed.value = false
    await nextTick()

    expect(widget.rated.value).toBe(false)
    expect(widget.hoverRating.value).toBe(0)
  })

  it('rateChat() отправляет событие и включает rated флаг', () => {
    const widget = useChatWidget()
    widget.rateChat(4)

    expect(widget.rated.value).toBe(true)
    expect(widget.hoverRating.value).toBe(0)
    expect(chatState.emitRate).toHaveBeenCalledWith(4)
  })
})
