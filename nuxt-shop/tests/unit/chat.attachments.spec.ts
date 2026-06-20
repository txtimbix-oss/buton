import { describe, expect, it, vi } from 'vitest'

import { uploadChatFiles } from '~/lib/chat/attachments'

describe('uploadChatFiles', () => {
  it('валидирует размер и тип файла до отправки', async () => {
    const fetchFn = vi.fn()
    const valid = new File(['payload'], 'good.jpg', { type: 'image/jpeg' })
    const invalidType = new File(['payload'], 'script.js', { type: 'application/javascript' })

    await expect(uploadChatFiles([valid, invalidType], { fetchFn: fetchFn as typeof fetch })).rejects
      .toThrow('Недопустимый формат файла')
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('валидирует лимит размера файла перед отправкой', async () => {
    const fetchFn = vi.fn()
    const tooBig = new File([new Uint8Array(6 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' })

    await expect(uploadChatFiles([tooBig], { fetchFn: fetchFn as typeof fetch })).rejects
      .toThrow('Файл слишком большой')
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('при частичном успехе возвращает только успешно загруженные вложения', async () => {
    const response = {
      ok: true,
      json: vi.fn(async () => ({
        files: [
          {
            url: '/uploads/first.jpg',
            name: 'first.jpg',
            mimeType: 'image/jpeg',
          },
        ],
        errors: [
          {
            name: 'bad.txt',
            error: 'Недопустимый тип',
          },
        ],
      })),
    }

    const fetchFn = vi.fn(async () => response)
    const files = [
      new File(['payload'], 'first.jpg', { type: 'image/jpeg' }),
      new File(['payload'], 'second.jpg', { type: 'image/jpeg' }),
    ] as File[]

    const uploaded = await uploadChatFiles(files, {
      fetchFn: fetchFn as typeof fetch,
      endpoint: '/api/chats/upload',
    })

    expect(fetchFn).toHaveBeenCalledWith('/api/chats/upload', expect.objectContaining({
      method: 'POST',
      body: expect.any(FormData),
    }))
    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(uploaded).toEqual([
      {
        url: '/uploads/first.jpg',
        name: 'first.jpg',
        mimeType: 'image/jpeg',
      },
    ])
  })

  it('возвращает пустой список если сервер вернул пустой payload', async () => {
    const response = {
      ok: true,
      json: vi.fn(async () => ({})),
    }
    const fetchFn = vi.fn(async () => response)

    const uploaded = await uploadChatFiles([new File(['payload'], 'first.jpg', { type: 'image/jpeg' })], {
      fetchFn: fetchFn as typeof fetch,
    })

    expect(uploaded).toEqual([])
  })
})
