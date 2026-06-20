import type { H3Event } from 'h3'

const DADATA_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'

type DaDataResponse = {
  suggestions?: Array<{
    value?: string | null
  }>
}

function getDadataToken(event: H3Event) {
  const config = useRuntimeConfig(event)

  return (
    (typeof config.dadataToken === 'string' ? config.dadataToken : '') ||
    process.env.NUXT_DADATA_TOKEN ||
    process.env.DADATA_TOKEN ||
    ''
  )
}

export default defineEventHandler(async (event) => {
  const body = await readBody<{ query?: string }>(event)
  const query = body?.query?.trim() ?? ''

  if (query.length < 3) {
    return []
  }

  const token = getDadataToken(event)
  if (!token) {
    return []
  }

  try {
    const response = await $fetch<DaDataResponse>(DADATA_URL, {
      method: 'POST',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: { query, count: 6 },
    })

    return Array.isArray(response?.suggestions)
      ? response.suggestions
          .map(item => item.value)
          .filter((item): item is string => typeof item === 'string' && item.length > 0)
      : []
  } catch {
    return []
  }
})
