import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick as flushVueTick, ref } from 'vue'

import { useHomePopup } from '~/composables/useHomePopup'
import {
  HOME_POPUP_DELAY_MS,
  HOME_POPUP_SESSION_KEY,
  HOME_POPUP_TITLE_ID,
} from '~/lib/home/popup'

interface FocusableMock {
  focus: ReturnType<typeof vi.fn>
}

function createFocusable(): FocusableMock {
  return {
    focus: vi.fn(),
  }
}

function createStorageMock(initialValue: string | null = null) {
  let value = initialValue

  return {
    getItem: vi.fn((key: string) => (key === HOME_POPUP_SESSION_KEY ? value : null)),
    setItem: vi.fn((key: string, nextValue: string) => {
      if (key === HOME_POPUP_SESSION_KEY) {
        value = nextValue
      }
    }),
  }
}

function createMountedHook() {
  let callback: (() => void) | undefined

  return {
    onMounted(fn: () => void) {
      callback = fn
    },
    runMounted() {
      callback?.()
    },
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('useHomePopup', () => {
  it('opens the popup after the mount delay when the banner is eligible', () => {
    vi.useFakeTimers()

    const mounted = createMountedHook()
    const storage = createStorageMock()
    const scope = effectScope()
    const popup = scope.run(() =>
      useHomePopup({
        popupBanner: ref({ _id: 'banner-1' }),
        storage,
        onMounted: mounted.onMounted,
        setTimeout,
        nextTick: vi.fn().mockResolvedValue(undefined),
      }),
    )

    expect(popup).toBeTruthy()
    expect(popup!.popupTitleId).toBe(HOME_POPUP_TITLE_ID)

    mounted.runMounted()

    expect(popup!.popupVisible.value).toBe(false)

    vi.advanceTimersByTime(HOME_POPUP_DELAY_MS - 1)
    expect(popup!.popupVisible.value).toBe(false)

    vi.advanceTimersByTime(1)
    expect(popup!.popupVisible.value).toBe(true)

    scope.stop()
  })

  it('does not schedule the popup when the session was already marked as seen', () => {
    vi.useFakeTimers()

    const mounted = createMountedHook()
    const storage = createStorageMock('1')
    const scope = effectScope()
    const popup = scope.run(() =>
      useHomePopup({
        popupBanner: ref({ _id: 'banner-1' }),
        storage,
        onMounted: mounted.onMounted,
        setTimeout,
        nextTick: vi.fn().mockResolvedValue(undefined),
      }),
    )

    mounted.runMounted()
    vi.runAllTimers()

    expect(storage.getItem).toHaveBeenCalledWith(HOME_POPUP_SESSION_KEY)
    expect(popup!.popupVisible.value).toBe(false)

    scope.stop()
  })

  it('focuses the close button on open and restores the previous focus on close', async () => {
    const mounted = createMountedHook()
    const storage = createStorageMock()
    const previousFocus = createFocusable()
    const closeButton = createFocusable()
    const documentMock = {
      activeElement: previousFocus,
    }
    let resolveInjectedTick: (() => void) | undefined
    const nextTickMock = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveInjectedTick = resolve
        }),
    )

    const scope = effectScope()
    const popup = scope.run(() =>
      useHomePopup({
        popupBanner: ref({ _id: 'banner-1' }),
        storage,
        document: documentMock,
        onMounted: mounted.onMounted,
        nextTick: nextTickMock,
      }),
    )

    expect(popup).toBeTruthy()

    popup!.popupCloseButton.value = closeButton as never
    popup!.popupVisible.value = true

    await flushVueTick()
    expect(nextTickMock).toHaveBeenCalledTimes(1)
    expect(closeButton.focus).not.toHaveBeenCalled()

    resolveInjectedTick?.()
    await flushVueTick()

    expect(closeButton.focus).toHaveBeenCalledTimes(1)

    documentMock.activeElement = closeButton
    popup!.closePopup()
    await flushVueTick()

    expect(storage.setItem).toHaveBeenCalledWith(HOME_POPUP_SESSION_KEY, '1')
    expect(previousFocus.focus).toHaveBeenCalledTimes(1)

    scope.stop()
  })

  it('wraps focus on Tab and closes the popup on Escape', async () => {
    const storage = createStorageMock()
    const firstButton = createFocusable()
    const lastButton = createFocusable()
    const documentMock = {
      activeElement: lastButton,
    }
    const dialog = {
      focus: vi.fn(),
      querySelectorAll: vi.fn(() => [firstButton, lastButton]),
    }

    const scope = effectScope()
    const popup = scope.run(() =>
      useHomePopup({
        popupBanner: ref({ _id: 'banner-1' }),
        storage,
        document: documentMock,
        onMounted: () => {},
        nextTick: vi.fn().mockResolvedValue(undefined),
      }),
    )

    expect(popup).toBeTruthy()

    popup!.popupDialog.value = dialog as never
    popup!.popupVisible.value = true
    await flushVueTick()

    const tabEvent = {
      key: 'Tab',
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent

    popup!.handlePopupKeydown(tabEvent)

    expect(tabEvent.preventDefault).toHaveBeenCalledTimes(1)
    expect(firstButton.focus).toHaveBeenCalledTimes(1)

    const escapeEvent = {
      key: 'Escape',
      shiftKey: false,
      preventDefault: vi.fn(),
    } as unknown as KeyboardEvent

    popup!.handlePopupKeydown(escapeEvent)
    await flushVueTick()

    expect(escapeEvent.preventDefault).toHaveBeenCalledTimes(1)
    expect(popup!.popupVisible.value).toBe(false)
    expect(storage.setItem).toHaveBeenCalledWith(HOME_POPUP_SESSION_KEY, '1')

    scope.stop()
  })
})
