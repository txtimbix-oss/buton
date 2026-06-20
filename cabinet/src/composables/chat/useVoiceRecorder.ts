import { ref } from 'vue'

export interface UseVoiceRecorderOptions {
  /** Вызывается, когда запись остановлена и собран готовый файл. */
  onRecorded: (file: File) => void | Promise<void>
  /** Сообщение для UI, когда доступ к микрофону не получен. */
  onError: (message: string) => void
}

const MIC_DENIED_MESSAGE = 'Не удалось получить доступ к микрофону. Проверьте разрешение в браузере.'

function pickMimeType(): string {
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/mp4'))  return 'audio/mp4'
  return ''
}

function buildVoiceFile(chunks: Blob[], recorderMime: string): File {
  const finalMime = recorderMime || 'audio/webm'
  const ext = finalMime.includes('mp4') ? '.mp4' : finalMime.includes('ogg') ? '.ogg' : '.webm'
  const blob = new Blob(chunks, { type: finalMime })
  return new File([blob], `voice${ext}`, { type: finalMime })
}

/**
 * Инкапсулирует MediaRecorder lifecycle: захват аудио, сборку файла и очистку
 * tracks. Не знает про upload/send/sending — отдаёт готовый файл через
 * `onRecorded`, а вызывающий решает, что с ним делать.
 */
export function useVoiceRecorder({ onRecorded, onError }: UseVoiceRecorderOptions) {
  const isRecording = ref(false)

  let mediaRecorder: MediaRecorder | null = null
  let recordingStream: MediaStream | null = null
  let audioChunks: Blob[] = []
  let isDisposed = false

  function stopRecordingStream() {
    if (!recordingStream) return
    recordingStream.getTracks().forEach(track => track.stop())
    recordingStream = null
  }

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (isDisposed) {
        stream.getTracks().forEach(track => track.stop())
        return
      }

      recordingStream = stream
      audioChunks = []

      const mimeType = pickMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      mediaRecorder = recorder

      recorder.ondataavailable = event => {
        if (event.data.size > 0) audioChunks.push(event.data)
      }

      recorder.onstop = async () => {
        isRecording.value = false
        stopRecordingStream()

        if (isDisposed) {
          mediaRecorder = null
          audioChunks = []
          return
        }

        const file = buildVoiceFile(audioChunks, recorder.mimeType)

        try {
          await onRecorded(file)
        } finally {
          mediaRecorder = null
          audioChunks = []
        }
      }

      recorder.start()
      isRecording.value = true
    } catch {
      onError(MIC_DENIED_MESSAGE)
    }
  }

  function stop() {
    mediaRecorder?.stop()
    isRecording.value = false
  }

  async function toggle() {
    if (isRecording.value) {
      stop()
      return
    }
    await start()
  }

  /** Останавливает запись на unmount без эмита файла и глушит tracks. */
  function dispose() {
    isDisposed = true

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = () => {
        isRecording.value = false
        stopRecordingStream()
        mediaRecorder = null
        audioChunks = []
      }
      mediaRecorder.stop()
      return
    }

    isRecording.value = false
    stopRecordingStream()
  }

  return { isRecording, toggle, dispose }
}
