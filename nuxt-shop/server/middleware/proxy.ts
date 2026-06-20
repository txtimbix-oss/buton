import { proxyRequest } from 'h3'

export default defineEventHandler(async (event) => {
  const path = event.path
  if (!path.startsWith('/api/') && !path.startsWith('/uploads/')) return

  const { apiBase } = useRuntimeConfig(event)
  const cookie = getRequestHeader(event, 'cookie')

  return proxyRequest(event, `${apiBase}${path}`, {
    headers: cookie ? { cookie } : undefined,
  })
})
