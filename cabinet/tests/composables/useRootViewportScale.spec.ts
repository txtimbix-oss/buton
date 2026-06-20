import { createApp, nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'

function setGetBoundingRect(width: number) {
  return vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return {
      x: 0,
      y: 0,
      width,
      height: 0,
      top: 0,
      right: width,
      bottom: 0,
      left: 0,
      toJSON: () => ({}),
    }
  } as DOMRect)
}

async function loadComposable() {
  vi.resetModules()
  return import('@/composables/useRootViewportScale')
}

describe('useRootViewportScale', () => {
  it('применяет scale-трансформацию для десктопов и сбрасывает стили при unmount', async () => {
    const rectSpy = setGetBoundingRect(100)
    const { useRootViewportScale } = await loadComposable()
    const root = document.documentElement
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    window.innerWidth = 1500
    const app = createApp({
      setup() {
        useRootViewportScale()
        return {}
      },
      template: '<div/>',
    })
    const container = document.createElement('div')
    document.body.append(container)
    app.mount(container)
    await nextTick()

    expect(root.classList.contains('cb-root-scale')).toBe(true)
    expect(root.classList.contains('cb-root-scale--transform')).toBe(true)
    expect(root.classList.contains('cb-root-scale--zoom')).toBe(false)

    app.unmount()
    await nextTick()

    expect(root.classList.value).toBe('')
    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function))

    addSpy.mockRestore()
    removeSpy.mockRestore()
    rectSpy.mockRestore()
  })

  it('не трогает логику скейла на узких экранах и очищает классы после unmount', async () => {
    const rectSpy = setGetBoundingRect(100)
    const { useRootViewportScale } = await loadComposable()
    const root = document.documentElement

    window.innerWidth = 1100
    const app = createApp({
      setup() {
        useRootViewportScale()
        return {}
      },
      template: '<div/>',
    })
    const container = document.createElement('div')
    document.body.append(container)
    app.mount(container)
    await nextTick()

    expect(root.classList.value).toBe('')

    app.unmount()
    await nextTick()
    expect(root.classList.value).toBe('')

    rectSpy.mockRestore()
  })
})
