import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useVoiceRecorder } from '@/composables/chat/useVoiceRecorder'

type RecorderInstance = FakeMediaRecorder

let lastRecorder: RecorderInstance | null = null

class FakeMediaRecorder {
  static isTypeSupported = vi.fn(() => true)

  state: 'inactive' | 'recording' = 'inactive'
  mimeType: string
  ondataavailable: ((event: { data: Blob }) => void) | null = null
  onstop: (() => void | Promise<void>) | null = null

  constructor(_stream: MediaStream, options?: { mimeType?: string }) {
    this.mimeType = options?.mimeType ?? ''
    lastRecorder = this
  }

  start() {
    this.state = 'recording'
  }

  stop() {
    this.state = 'inactive'
    this.ondataavailable?.({ data: new Blob(['audio-bytes'], { type: this.mimeType }) })
    void this.onstop?.()
  }
}

function makeStream() {
  const track = { stop: vi.fn() }
  const stream = { getTracks: () => [track] } as unknown as MediaStream
  return { stream, track }
}

let getUserMedia: ReturnType<typeof vi.fn>

beforeEach(() => {
  lastRecorder = null
  FakeMediaRecorder.isTypeSupported.mockReturnValue(true)
  getUserMedia = vi.fn()
  vi.stubGlobal('MediaRecorder', FakeMediaRecorder)
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia },
    configurable: true,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('useVoiceRecorder', () => {
  it('start: запрашивает микрофон и переходит в состояние записи', async () => {
    const { stream } = makeStream()
    getUserMedia.mockResolvedValue(stream)

    const recorder = useVoiceRecorder({ onRecorded: vi.fn(), onError: vi.fn() })
    await recorder.toggle()

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(recorder.isRecording.value).toBe(true)
    expect(lastRecorder?.state).toBe('recording')
  })

  it('stop: останавливает запись и отдаёт собранный File через onRecorded', async () => {
    const { stream, track } = makeStream()
    getUserMedia.mockResolvedValue(stream)
    const onRecorded = vi.fn()

    const recorder = useVoiceRecorder({ onRecorded, onError: vi.fn() })
    await recorder.toggle()
    await recorder.toggle()
    await flush()

    expect(recorder.isRecording.value).toBe(false)
    expect(track.stop).toHaveBeenCalled()
    expect(onRecorded).toHaveBeenCalledTimes(1)

    const file = onRecorded.mock.calls[0][0] as File
    expect(file).toBeInstanceOf(File)
    expect(file.name).toBe('voice.webm')
    expect(file.type).toBe('audio/webm')
  })

  it('dispose: глушит tracks и не эмитит файл при размонтировании во время записи', async () => {
    const { stream, track } = makeStream()
    getUserMedia.mockResolvedValue(stream)
    const onRecorded = vi.fn()

    const recorder = useVoiceRecorder({ onRecorded, onError: vi.fn() })
    await recorder.toggle()

    recorder.dispose()
    await flush()

    expect(track.stop).toHaveBeenCalled()
    expect(recorder.isRecording.value).toBe(false)
    expect(onRecorded).not.toHaveBeenCalled()
  })

  it('denied microphone: ошибка маппится в читаемое сообщение, запись не стартует', async () => {
    getUserMedia.mockRejectedValue(new DOMException('denied', 'NotAllowedError'))
    const onError = vi.fn()

    const recorder = useVoiceRecorder({ onRecorded: vi.fn(), onError })
    await recorder.toggle()

    expect(onError).toHaveBeenCalledWith('Не удалось получить доступ к микрофону. Проверьте разрешение в браузере.')
    expect(recorder.isRecording.value).toBe(false)
  })
})
