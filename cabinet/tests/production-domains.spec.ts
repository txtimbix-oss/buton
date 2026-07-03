import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const testsDir = dirname(fileURLToPath(import.meta.url))

function readRepoFile(path: string): string {
  return readFileSync(resolve(testsDir, '..', path), 'utf8')
}

describe('production domains', () => {
  it('does not keep legacy spbapp domains in env example', () => {
    expect(readRepoFile('.env.example')).not.toMatch(/spbapp\.ru/)
  })

  it('documents butonshop production endpoints', () => {
    const envExample = readRepoFile('.env.example')

    expect(envExample).toContain('VITE_API_BASE=https://api.butonshop.ru')
    expect(envExample).toContain('VITE_SHOP_URL=https://butonshop.ru')
    expect(envExample).toContain('VITE_WS_URL=https://api.butonshop.ru')
  })
})
