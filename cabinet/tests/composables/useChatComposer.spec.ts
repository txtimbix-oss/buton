import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useChatComposer } from '@/composables/useChatComposer'

function mockChatFile(name = 'a.png', type = 'image/png') {
  return new File(['hello'], name, { type })
}

describe('useChatComposer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.useFakeTimers()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob://preview')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('submit() игнорирует отправку при пустом тексте и закрытом чате', async () => {
    const isClosed = ref(true)
    const uploadFiles = vi.fn()
    const send = vi.fn()
    const emitTyping = vi.fn()

    const composer = useChatComposer({ isClosed, uploadFiles, send, emitTyping })
    composer.inputText.value = ''
    composer.pendingFiles.value = []

    await composer.submit()
    expect(uploadFiles).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
    expect(composer.sending.value).toBe(false)
  })

  it('submit() загружает файлы и очищает очередь после удачной отправки', async () => {
    const isClosed = ref(false)
    const uploadFiles = vi.fn(async () => [{
      url: '/files/a.png',
      name: 'a.png',
      mimeType: 'image/png',
    }])
    const send = vi.fn(() => true)
    const emitTyping = vi.fn()
    const composer = useChatComposer({ isClosed, uploadFiles, send, emitTyping })
    const event = {
      target: {
        files: [mockChatFile()],
        value: '',
      },
    } as unknown as Event

    composer.onFileChange(event)
    await nextTick()
    expect(composer.pendingFiles.value).toHaveLength(1)
    expect(composer.pendingFiles.value[0].preview).toBe('blob://preview')

    await composer.submit()
    expect(uploadFiles).toHaveBeenCalledTimes(1)
    expect(send).toHaveBeenCalledWith('', [{ url: '/files/a.png', name: 'a.png', mimeType: 'image/png' }])
    expect(composer.pendingFiles.value).toHaveLength(0)
  })

  it('submit() не дублирует отправки при состоянии sending', async () => {
    const isClosed = ref(false)
    const uploadFiles = vi.fn(async () => [])
    const send = vi.fn(() => true)
    const emitTyping = vi.fn()
    const composer = useChatComposer({ isClosed, uploadFiles, send, emitTyping })

    composer.inputText.value = 'hello'
    composer.sending.value = true

    await composer.submit()
    expect(uploadFiles).not.toHaveBeenCalled()
    expect(send).not.toHaveBeenCalled()
  })

  it('onInput() пишет isDebounce', () => {
    const isClosed = ref(false)
    const uploadFiles = vi.fn()
    const send = vi.fn()
    const emitTyping = vi.fn()
    const composer = useChatComposer({ isClosed, uploadFiles, send, emitTyping })

    composer.inputText.value = 'привет'
    composer.onInput()
    vi.advanceTimersByTime(399)
    expect(emitTyping).not.toHaveBeenCalled()
    vi.advanceTimersByTime(2)
    expect(emitTyping).toHaveBeenCalledTimes(1)
  })
})
