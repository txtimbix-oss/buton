import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Open/close state и outside-click для поповера датапикера.
 * `rootRef` нужно повесить на корневой элемент компонента — клик вне него
 * закрывает поповер. Регистрация document-listener живёт здесь, чтобы
 * `AppDatePicker.vue` остался про разметку.
 */
export function useDatePickerPopover() {
  const open = ref(false)
  const rootRef = ref<HTMLElement | null>(null)

  function toggleOpen() {
    open.value = !open.value
  }

  function close() {
    open.value = false
  }

  function onDocClick(event: MouseEvent) {
    if (!rootRef.value || !(event.target instanceof Node)) return
    if (!rootRef.value.contains(event.target)) open.value = false
  }

  onMounted(() => document.addEventListener('mousedown', onDocClick))
  onUnmounted(() => document.removeEventListener('mousedown', onDocClick))

  return { open, rootRef, toggleOpen, close, onDocClick }
}
