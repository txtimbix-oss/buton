import { createApp, nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDatePickerPopover } from '@/composables/useDatePickerPopover'

type Popover = ReturnType<typeof useDatePickerPopover>

/** Монтирует компонент с composable и возвращает его API + cleanup. */
function mountPopover() {
  let popover!: Popover
  const app = createApp({
    setup() {
      popover = useDatePickerPopover()
      return () => null
    },
  })
  const container = document.createElement('div')
  document.body.append(container)
  app.mount(container)
  return {
    popover,
    unmount: () => {
      app.unmount()
      container.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useDatePickerPopover', () => {
  it('toggleOpen переключает open, close закрывает', () => {
    const { popover, unmount } = mountPopover()

    expect(popover.open.value).toBe(false)
    popover.toggleOpen()
    expect(popover.open.value).toBe(true)
    popover.toggleOpen()
    expect(popover.open.value).toBe(false)

    popover.open.value = true
    popover.close()
    expect(popover.open.value).toBe(false)

    unmount()
  })

  it('onDocClick закрывает при клике вне rootRef и не трогает при клике внутри', () => {
    const { popover, unmount } = mountPopover()

    const root = document.createElement('div')
    const inside = document.createElement('span')
    root.append(inside)
    const outside = document.createElement('div')
    document.body.append(root, outside)
    popover.rootRef.value = root

    popover.open.value = true
    popover.onDocClick({ target: inside } as unknown as MouseEvent)
    expect(popover.open.value).toBe(true)

    popover.onDocClick({ target: outside } as unknown as MouseEvent)
    expect(popover.open.value).toBe(false)

    unmount()
  })

  it('регистрирует и снимает mousedown-listener по lifecycle', async () => {
    const addSpy = vi.spyOn(document, 'addEventListener')
    const removeSpy = vi.spyOn(document, 'removeEventListener')

    const { unmount } = mountPopover()
    await nextTick()
    expect(addSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))

    unmount()
    await nextTick()
    expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('реальный mousedown вне корня закрывает поповер', async () => {
    const { popover, unmount } = mountPopover()
    await nextTick()

    const root = document.createElement('div')
    const outside = document.createElement('button')
    document.body.append(root, outside)
    popover.rootRef.value = root
    popover.open.value = true

    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))
    expect(popover.open.value).toBe(false)

    unmount()
  })
})
