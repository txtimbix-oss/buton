import { onUnmounted, ref, type Ref } from 'vue'
import type { ChatAttachment } from '@/composables/useChat'
import { getErrorMessage } from '@/composables/getErrorMessage'
import { useVoiceRecorder } from '@/composables/chat/useVoiceRecorder'

export interface PendingChatFile {
  file: File
  preview: string | null
}

interface UseChatComposerOptions {
  isClosed: Ref<boolean>
  uploadFiles: (files: File[]) => Promise<ChatAttachment[]>
  send: (text: string, attachments?: ChatAttachment[]) => boolean
  emitTyping: () => void
}

export function useChatComposer({ isClosed, uploadFiles, send, emitTyping }: UseChatComposerOptions) {
  const inputText = ref('')
  const pendingFiles = ref<PendingChatFile[]>([])
  const sending = ref(false)
  const composerError = ref('')

  let typingDebounce: ReturnType<typeof setTimeout> | null = null
  let isDisposed = false

  function clearPendingFiles() {
    pendingFiles.value.forEach(item => {
      if (item.preview) URL.revokeObjectURL(item.preview)
    })
    pendingFiles.value = []
  }

  function addPendingFile(file: File) {
    pendingFiles.value.push({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    })
  }

  async function submit() {
    const text = inputText.value.trim()
    const hasFiles = pendingFiles.value.length > 0

    if ((!text && !hasFiles) || isClosed.value || sending.value) return

    sending.value = true
    composerError.value = ''

    try {
      let attachments: ChatAttachment[] = []

      if (hasFiles) {
        attachments = await uploadFiles(pendingFiles.value.map(item => item.file))
      }

      if (send(text, attachments)) {
        inputText.value = ''
        clearPendingFiles()
      }
    } catch (error) {
      composerError.value = getErrorMessage(error, 'Не удалось отправить сообщение. Проверьте вложения и попробуйте ещё раз.')
    } finally {
      sending.value = false
    }
  }

  function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files) return

    composerError.value = ''

    for (const file of Array.from(input.files)) {
      if (pendingFiles.value.length >= 5) {
        composerError.value = 'Можно прикрепить не больше 5 файлов за раз.'
        break
      }

      addPendingFile(file)
    }

    input.value = ''
  }

  function removePending(index: number) {
    const item = pendingFiles.value[index]
    if (item.preview) URL.revokeObjectURL(item.preview)
    pendingFiles.value.splice(index, 1)
  }

  async function sendVoiceRecording(file: File) {
    sending.value = true

    try {
      const attachments = await uploadFiles([file])
      if (!isDisposed && !send('', attachments)) {
        addPendingFile(file)
      }
    } catch (error) {
      composerError.value = getErrorMessage(error, 'Не удалось отправить голосовое сообщение. Попробуйте ещё раз.')
    } finally {
      if (!isDisposed) sending.value = false
    }
  }

  const voiceRecorder = useVoiceRecorder({
    onRecorded: sendVoiceRecording,
    onError: (message) => { composerError.value = message },
  })
  const { isRecording } = voiceRecorder

  async function toggleRecording() {
    if (isClosed.value || sending.value) return
    await voiceRecorder.toggle()
  }

  function onInput() {
    if (typingDebounce) clearTimeout(typingDebounce)
    typingDebounce = setTimeout(() => emitTyping(), 400)
  }

  onUnmounted(() => {
    isDisposed = true
    clearPendingFiles()

    if (typingDebounce) {
      clearTimeout(typingDebounce)
      typingDebounce = null
    }

    voiceRecorder.dispose()
  })

  return {
    inputText,
    pendingFiles,
    sending,
    isRecording,
    composerError,
    submit,
    onFileChange,
    removePending,
    toggleRecording,
    onInput,
  }
}
