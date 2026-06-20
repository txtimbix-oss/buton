import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let next = 0

  function show(message: string, type: Toast['type'] = 'info') {
    const id = ++next
    toasts.value.push({ id, message, type })
    setTimeout(() => remove(id), 3500)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, show, remove }
})
