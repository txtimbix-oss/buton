import { effectScope, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'

import { useProductLightbox } from '~/composables/useProductLightbox'

function createWindowMock() {
  const listeners = new Map<string, Set<(event: KeyboardEvent) => void>>()

  return {
    addEventListener: vi.fn((type: string, listener: (event: KeyboardEvent) => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set())
      listeners.get(type)?.add(listener)
    }),
    removeEventListener: vi.fn((type: string, listener: (event: KeyboardEvent) => void) => {
      listeners.get(type)?.delete(listener)
    }),
    dispatch(type: string, event: KeyboardEvent) {
      listeners.get(type)?.forEach(listener => listener(event))
    },
  }
}

function createDocumentMock() {
  return {
    body: {
      classList: {
        classes: new Set<string>(),
        add: vi.fn(function (klass: string) {
          this.classes.add(klass)
        }),
        remove: vi.fn(function (klass: string) {
          this.classes.delete(klass)
        }),
        toggle: vi.fn(function (klass: string, value?: boolean) {
          if (value === undefined) {
            if (this.classes.has(klass)) {
              this.classes.delete(klass)
              return false
            }
            this.classes.add(klass)
            return true
          }
          if (value) this.classes.add(klass)
          else this.classes.delete(klass)
          return value ?? false
        }),
      },
    },
  }
}

describe('useProductLightbox', () => {
  it('opens at a requested index, steps through images, and syncs body overflow', () => {
    const scope = effectScope()
    const imageCount = ref(4)
    const windowMock = createWindowMock()
    const documentMock = createDocumentMock()

    const lightbox = scope.run(() =>
      useProductLightbox({
        imageCount,
        window: windowMock,
        document: documentMock,
      }),
    )

    expect(lightbox).toBeTruthy()

    lightbox!.open(2)
    expect(lightbox!.isOpen.value).toBe(true)
    expect(lightbox!.index.value).toBe(2)
    expect(documentMock.body.classList.classes.has('lightbox-scroll-lock')).toBe(true)

    lightbox!.step(1)
    expect(lightbox!.index.value).toBe(3)

    lightbox!.step(1)
    expect(lightbox!.index.value).toBe(0)

    lightbox!.close()
    expect(lightbox!.isOpen.value).toBe(false)
    expect(documentMock.body.classList.classes.has('lightbox-scroll-lock')).toBe(false)

    scope.stop()
  })

  it('reacts to keyboard navigation only while the lightbox is open', () => {
    const scope = effectScope()
    const imageCount = ref(3)
    const windowMock = createWindowMock()
    const documentMock = createDocumentMock()

    const lightbox = scope.run(() =>
      useProductLightbox({
        imageCount,
        window: windowMock,
        document: documentMock,
      }),
    )!

    windowMock.dispatch('keydown', { key: 'ArrowRight' } as KeyboardEvent)
    expect(lightbox.index.value).toBe(0)
    expect(lightbox.isOpen.value).toBe(false)

    lightbox.open(1)
    windowMock.dispatch('keydown', { key: 'ArrowLeft' } as KeyboardEvent)
    expect(lightbox.index.value).toBe(0)

    windowMock.dispatch('keydown', { key: 'ArrowRight' } as KeyboardEvent)
    expect(lightbox.index.value).toBe(1)

    windowMock.dispatch('keydown', { key: 'Escape' } as KeyboardEvent)
    expect(lightbox.isOpen.value).toBe(false)
    expect(documentMock.body.classList.classes.has('lightbox-scroll-lock')).toBe(false)

    scope.stop()
  })

  it('registers a keydown listener once and removes it with overflow cleanup on dispose', () => {
    const scope = effectScope()
    const imageCount = ref(2)
    const windowMock = createWindowMock()
    const documentMock = createDocumentMock()

    const lightbox = scope.run(() =>
      useProductLightbox({
        imageCount,
        window: windowMock,
        document: documentMock,
      }),
    )!

    expect(windowMock.addEventListener).toHaveBeenCalledTimes(1)
    expect(windowMock.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))

    lightbox.open(0)
    expect(documentMock.body.classList.classes.has('lightbox-scroll-lock')).toBe(true)

    scope.stop()

    expect(windowMock.removeEventListener).toHaveBeenCalledTimes(1)
    expect(windowMock.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(documentMock.body.classList.classes.has('lightbox-scroll-lock')).toBe(false)
  })
})
