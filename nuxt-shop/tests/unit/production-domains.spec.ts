import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const testsUnitDir = dirname(fileURLToPath(import.meta.url))

function readRepoFile(path: string): string {
  return readFileSync(resolve(testsUnitDir, '..', '..', path), 'utf8')
}

describe('production domains', () => {
  it('does not keep legacy spbapp domains in production-facing files', () => {
    expect(readRepoFile('ecosystem.config.cjs')).not.toMatch(/spbapp\.ru/)
    expect(readRepoFile('.env.example')).not.toMatch(/spbapp\.ru/)
  })

  it('uses butonshop production domains in pm2 environment', () => {
    const ecosystemConfig = readRepoFile('ecosystem.config.cjs')

    expect(ecosystemConfig).toContain("NUXT_API_BASE: 'https://api.butonshop.ru'")
    expect(ecosystemConfig).toContain("NUXT_PUBLIC_SITE_URL: 'https://butonshop.ru'")
    expect(ecosystemConfig).toContain("NUXT_PUBLIC_CABINET_URL: 'https://user.butonshop.ru'")
    expect(ecosystemConfig).toContain("NUXT_PUBLIC_API_BASE: 'https://api.butonshop.ru'")
    expect(ecosystemConfig).toContain("NUXT_PUBLIC_WS_BASE: 'https://api.butonshop.ru'")
  })

  it('declares public apiBase and wsBase runtime config keys', () => {
    const source = readRepoFile('nuxt.config.ts')

    expect(source).toMatch(/apiBase:\s*process\.env\.NUXT_API_BASE/)
    expect(source).toMatch(/public:\s*\{[\s\S]*apiBase:\s*process\.env\.NUXT_PUBLIC_API_BASE/)
    expect(source).toMatch(/wsBase:\s*process\.env\.NUXT_PUBLIC_WS_BASE/)
  })
})
