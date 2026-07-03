import assert from 'node:assert/strict'

const apiBase = process.env.API_BASE_URL || 'https://api.butonshop.ru'
const origin = process.env.CABINET_BASE_URL || 'https://user.butonshop.ru'

const response = await fetch(`${apiBase}/api/user/auth/me`, {
  headers: {
    origin,
    accept: 'application/json',
  },
})

assert.notEqual(response.status, 502)
assert.equal(response.headers.get('access-control-allow-origin'), origin)
assert.ok([200, 401].includes(response.status), `expected 200/401, got ${response.status}`)

console.log('cabinet customer auth API smoke passed')
