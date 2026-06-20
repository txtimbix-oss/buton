import { ref, toValue, type MaybeRefOrGetter } from 'vue'

import type { ChatAttachment } from '~/composables/useChat'

interface PendingFile {
  file: File
  preview: string | null
}

export interface UseChatComposerDeps {
  sendMessage: (text: string, attachments?: ChatAttachment[]) => boolean | Promise<boolean>
  uploadFiles: (files: File[]) => Promise<ChatAttachment[]>
  isClosed?: MaybeRefOrGetter<boolean>
  reportError?: (error: unknown) => void
  clearError?: () => void
  getUserMedia?: typeof navigator.mediaDevices.getUserMedia
  createObjectURL?: typeof URL.createObjectURL
  revokeObjectURL?: typeof URL.revokeObjectURL
  MediaRecorderCtor?: typeof MediaRecorder
}

const MAX_PENDING_FILES = 5

export function useChatComposer(deps: UseChatComposerDeps) {
  const inputText = ref('')
  const pendingFiles = ref<PendingFile[]>([])
  const sending = ref(false)
  const isRecording = ref(false)

  const isClosed = () => Boolean(toValue(deps.isClosed))
  const reportError = deps.reportError ?? (() => {})
  const clearError = deps.clearError ?? (() => {})
  const createObjectURL = deps.createObjectURL ?? ((blob: Blob | MediaSource) => URL.createObjectURL(blob))
  const revokeObjectURL = deps.revokeObjectURL ?? ((url: string) => URL.revokeObjectURL(url))
  const getUserMedia = deps.getUserMedia
    ?? ((constraints: MediaStreamConstraints) => navigator.mediaDevices.getUserMedia(constraints))
  const RecorderCtor = deps.MediaRecorderCtor
    ?? (typeof MediaRecorder !== 'undefined' ? MediaRecorder : undefined)

  function isImage(mimeType: string): boolean {
    return mimeType?.startsWith('image/')
  }

  function isAudio(mimeType: string): boolean {
    return mimeType?.startsWith('audio/')
  }

  async function submit() {
    const text = inputText.value.trim()
    const hasFiles = pendingFiles.value.length > 0
    if ((!text && !hasFiles) || isClosed() || sending.value) return

    clearError()
    sending.value = true
    try {
      let attachments: ChatAttachment[] = []
      if (hasFiles) {
        attachments = await deps.uploadFiles(pendingFiles.value.map(p => p.file))
      }
      if (await deps.sendMessage(text, attachments)) {
        inputText.value = ''
        pendingFiles.value.forEach(p => { if (p.preview) revokeObjectURL(p.preview) })
        pendingFiles.value = []
      }
    } catch (error) {
      reportError(error)
    } finally {
      sending.value = false
    }
  }

  function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files) return
    clearError()

    const files = Array.from(input.files)
    let skippedByLimit = false

    for (const file of files) {
      if (pendingFiles.value.length >= MAX_PENDING_FILES) {
        skippedByLimit = true
        continue
      }
      const preview = file.type.startsWith('image/') ? createObjectURL(file) : null
      pendingFiles.value.push({ file, preview })
    }

    if (skippedByLimit) {
      reportError(new Error('Можно прикрепить не более 5 файлов к одному сообщению.'))
    }

    input.value = ''
  }

  function removePending(index: number) {
    const item = pendingFiles.value[index]
    if (item?.preview) revokeObjectURL(item.preview)
    pendingFiles.value.splice(index, 1)
  }

  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []

  async function toggleRecording() {
    if (isClosed() || sending.value) return
    if (isRecording.value) {
      mediaRecorder?.stop()
      isRecording.value = false
      return
    }
    if (!RecorderCtor) {
      reportError(new Error('Запись голоса не поддерживается этим браузером.'))
      return
    }
    try {
      const stream = await getUserMedia({ audio: true })
      audioChunks = []
      const mimeType = RecorderCtor.isTypeSupported('audio/webm') ? 'audio/webm'
                     : RecorderCtor.isTypeSupported('audio/mp4') ? 'audio/mp4'
                     : ''
      mediaRecorder = mimeType ? new RecorderCtor(stream, { mimeType }) : new RecorderCtor(stream)
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data) }
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        const finalMime = mediaRecorder!.mimeType || 'audio/webm'
        const ext = finalMime.includes('mp4') ? '.mp4' : finalMime.includes('ogg') ? '.ogg' : '.webm'
        const blob = new Blob(audioChunks, { type: finalMime })
        const file = new File([blob], `voice${ext}`, { type: finalMime })
        sending.value = true
        try {
          const attachments = await deps.uploadFiles([file])
          await deps.sendMessage('', attachments)
        } catch (error) {
          reportError(error)
        } finally {
          sending.value = false
        }
      }
      mediaRecorder.start()
      isRecording.value = true
    } catch {
      reportError(new Error('Не удалось получить доступ к микрофону. Проверьте разрешения браузера.'))
    }
  }

  function cleanup() {
    pendingFiles.value.forEach(p => { if (p.preview) revokeObjectURL(p.preview) })
  }

  return {
    inputText,
    pendingFiles,
    sending,
    isRecording,
    isImage,
    isAudio,
    submit,
    onFileChange,
    removePending,
    toggleRecording,
    cleanup,
  }
}
