import assert from 'node:assert/strict'

const baseUrl = process.env.SHOP_BASE_URL || 'https://butonshop.ru'

const response = await fetch(`${baseUrl}/api/user/auth/me`, {
  headers: { accept: 'application/json' },
})

assert.notEqual(response.status, 502)
assert.ok([200, 401].includes(response.status), `expected 200/401, got ${response.status}`)

console.log('nuxt-shop customer auth proxy smoke passed')
