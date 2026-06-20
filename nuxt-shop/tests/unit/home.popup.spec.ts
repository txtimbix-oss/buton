import { describe, expect, it } from 'vitest'

import {
  HOME_POPUP_DELAY_MS,
  HOME_POPUP_SESSION_KEY,
  HOME_POPUP_TITLE_ID,
  getPopupFocusableElements,
  getPromoCopyMessage,
  hasSeenHomePopup,
  markHomePopupSeen,
  resolveHomePopupKeydown,
  shouldShowHomePopup,
} from '~/lib/home/popup'

function makeFocusable(name: string) {
  return {
    name,
    focus: vi.fn(),
  }
}

describe('home popup helpers', () => {
  it('exposes stable popup constants for session orchestration', () => {
    expect(HOME_POPUP_SESSION_KEY).toBe('spb_popup_seen')
    expect(HOME_POPUP_TITLE_ID).toBe('home-popup-title')
    expect(HOME_POPUP_DELAY_MS).toBe(1500)
  })

  it('shows popup only when banner exists and session flag is not set', () => {
    expect(shouldShowHomePopup({ _id: 'popup-1' }, false)).toBe(true)
    expect(shouldShowHomePopup({ _id: 'popup-1' }, true)).toBe(false)
    expect(shouldShowHomePopup(null, false)).toBe(false)
  })

  it('reads and writes popup seen state through storage wrapper', () => {
    const storage = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    }

    expect(hasSeenHomePopup(storage)).toBe(false)

    storage.getItem.mockReturnValue('1')
    expect(hasSeenHomePopup(storage)).toBe(true)

    markHomePopupSeen(storage)
    expect(storage.setItem).toHaveBeenCalledWith('spb_popup_seen', '1')
  })

  it('collects focusable elements from popup dialog in stable order', () => {
    const first = makeFocusable('first')
    const second = makeFocusable('second')
    const dialog = {
      querySelectorAll: vi.fn(() => [first, second]),
    }

    expect(getPopupFocusableElements(dialog)).toEqual([first, second])
  })

  it('requests closing on Escape', () => {
    expect(resolveHomePopupKeydown({
      key: 'Escape',
      shiftKey: false,
      dialog: null,
      activeElement: null,
    })).toEqual({
      preventDefault: true,
      shouldClose: true,
      focusTarget: null,
    })
  })

  it('keeps focus on the dialog when no focusable elements are present', () => {
    const dialog = {
      querySelectorAll: vi.fn(() => []),
    }

    expect(resolveHomePopupKeydown({
      key: 'Tab',
      shiftKey: false,
      dialog,
      activeElement: null,
    })).toEqual({
      preventDefault: true,
      shouldClose: false,
      focusTarget: 'dialog',
    })
  })

  it('wraps focus backward from the first element and forward from the last element', () => {
    const first = makeFocusable('first')
    const middle = makeFocusable('middle')
    const last = makeFocusable('last')
    const dialog = {
      querySelectorAll: vi.fn(() => [first, middle, last]),
    }

    expect(resolveHomePopupKeydown({
      key: 'Tab',
      shiftKey: true,
      dialog,
      activeElement: first,
    })).toEqual({
      preventDefault: true,
      shouldClose: false,
      focusTarget: last,
    })

    expect(resolveHomePopupKeydown({
      key: 'Tab',
      shiftKey: false,
      dialog,
      activeElement: last,
    })).toEqual({
      preventDefault: true,
      shouldClose: false,
      focusTarget: first,
    })
  })

  it('leaves regular tabbing untouched when focus does not need wrapping', () => {
    const first = makeFocusable('first')
    const middle = makeFocusable('middle')
    const last = makeFocusable('last')
    const dialog = {
      querySelectorAll: vi.fn(() => [first, middle, last]),
    }

    expect(resolveHomePopupKeydown({
      key: 'Tab',
      shiftKey: false,
      dialog,
      activeElement: middle,
    })).toEqual({
      preventDefault: false,
      shouldClose: false,
      focusTarget: null,
    })

    expect(resolveHomePopupKeydown({
      key: 'Enter',
      shiftKey: false,
      dialog,
      activeElement: middle,
    })).toEqual({
      preventDefault: false,
      shouldClose: false,
      focusTarget: null,
    })
  })

  it('builds promo copy messages without duplicating messaging in the page', () => {
    expect(getPromoCopyMessage('MAY', true)).toBe('Промокод MAY скопирован')
    expect(getPromoCopyMessage('MAY', false)).toBe('Не удалось скопировать промокод')
  })
})
