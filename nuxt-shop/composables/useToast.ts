export function useToast() {
  const message = useState('toast-msg', () => '')
  const visible = useState('toast-visible', () => false)
  let timer: ReturnType<typeof setTimeout>

  function show(msg: string) {
    message.value = msg
    visible.value = true
    clearTimeout(timer)
    timer = setTimeout(() => { visible.value = false }, 2800)
  }

  return { message, visible, show }
}
