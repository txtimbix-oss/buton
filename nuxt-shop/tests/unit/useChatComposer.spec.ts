import { describe, expect, it, vi } from 'vitest'

import { useChatComposer, type UseChatComposerDeps } from '~/composables/useChatComposer'

function makeFile(name: string, type: string) {
  return new File(['x'], name, { type })
}

function baseDeps(overrides: Partial<UseChatComposerDeps> = {}): UseChatComposerDeps {
  return {
    sendMessage: vi.fn(async () => true),
    uploadFiles: vi.fn(async () => [{ url: '/u/1', name: 'f', mimeType: 'image/png' } as never]),
    createObjectURL: vi.fn(() => 'blob:preview'),
    revokeObjectURL: vi.fn(),
    reportError: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  }
}

describe('useChatComposer', () => {
  it('does not send when there is no text and no files', async () => {
    const deps = baseDeps()
    const composer = useChatComposer(deps)

    await composer.submit()

    expect(deps.sendMessage).not.toHaveBeenCalled()
  })

  it('does not send when the chat is closed', async () => {
    const deps = baseDeps({ isClosed: true })
    const composer = useChatComposer(deps)
    composer.inputText.value = 'привет'

    await composer.submit()

    expect(deps.sendMessage).not.toHaveBeenCalled()
  })

  it('sends text, then clears input and pending files on success', async () => {
    const deps = baseDeps()
    const composer = useChatComposer(deps)
    composer.inputText.value = '  привет  '

    await composer.submit()

    expect(deps.clearError).toHaveBeenCalled()
    expect(deps.sendMessage).toHaveBeenCalledWith('привет', [])
    expect(composer.inputText.value).toBe('')
    expect(composer.sending.value).toBe(false)
  })

  it('uploads pending files before sending and revokes their previews', async () => {
    const deps = baseDeps()
    const composer = useChatComposer(deps)
    composer.inputText.value = 'фото'
    composer.onFileChange({ target: { files: [makeFile('a.png', 'image/png')], value: '' } } as unknown as Event)

    expect(composer.pendingFiles.value).toHaveLength(1)
    expect(deps.createObjectURL).toHaveBeenCalledTimes(1)

    await composer.submit()

    expect(deps.uploadFiles).toHaveBeenCalledTimes(1)
    expect(composer.pendingFiles.value).toHaveLength(0)
    expect(deps.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
  })

  it('caps pending files at 5 and reports an overflow error', () => {
    const deps = baseDeps()
    const composer = useChatComposer(deps)
    const files = Array.from({ length: 7 }, (_, i) => makeFile(`f${i}.pdf`, 'application/pdf'))

    composer.onFileChange({ target: { files, value: '' } } as unknown as Event)

    expect(composer.pendingFiles.value).toHaveLength(5)
    expect(deps.reportError).toHaveBeenCalledTimes(1)
  })

  it('removePending revokes the preview of the removed file', () => {
    const deps = baseDeps()
    const composer = useChatComposer(deps)
    composer.onFileChange({ target: { files: [makeFile('a.png', 'image/png')], value: '' } } as unknown as Event)

    composer.removePending(0)

    expect(deps.revokeObjectURL).toHaveBeenCalledWith('blob:preview')
    expect(composer.pendingFiles.value).toHaveLength(0)
  })

  it('classifies image and audio mime types', () => {
    const composer = useChatComposer(baseDeps())
    expect(composer.isImage('image/jpeg')).toBe(true)
    expect(composer.isImage('audio/webm')).toBe(false)
    expect(composer.isAudio('audio/webm')).toBe(true)
    expect(composer.isAudio('image/png')).toBe(false)
  })

  it('records voice and uploads the result on stop', async () => {
    let onstop: (() => void) | null = null
    class FakeRecorder {
      static isTypeSupported() { return true }
      mimeType = 'audio/webm'
      ondataavailable: ((e: { data: { size: number } }) => void) | null = null
      onstop: (() => void) | null = null
      start = vi.fn()
      stop = vi.fn(() => { onstop = this.onstop; this.onstop?.() })
      constructor(public stream: unknown, public opts?: unknown) {}
    }
    const stream = { getTracks: () => [{ stop: vi.fn() }] }
    const deps = baseDeps({
      getUserMedia: vi.fn(async () => stream as unknown as MediaStream),
      MediaRecorderCtor: FakeRecorder as unknown as typeof MediaRecorder,
      uploadFiles: vi.fn(async () => [{ url: '/u/voice', name: 'voice', mimeType: 'audio/webm' } as never]),
    })
    const composer = useChatComposer(deps)

    await composer.toggleRecording()
    expect(composer.isRecording.value).toBe(true)

    await composer.toggleRecording()
    // allow the async onstop handler to resolve
    await Promise.resolve()
    await Promise.resolve()

    expect(deps.uploadFiles).toHaveBeenCalledTimes(1)
    expect(deps.sendMessage).toHaveBeenCalledWith('', expect.any(Array))
    expect(composer.isRecording.value).toBe(false)
  })
})
