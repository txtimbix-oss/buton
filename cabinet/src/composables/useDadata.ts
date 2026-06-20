import { ref } from 'vue'

const DADATA_PROVIDER_DEFAULTS = {
  endpoint: 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
  token: '390774c945d1010e3c0b639312339f671357e8ba',
  suggestionCount: 6,
  debounceMs: 300,
  minQueryLength: 3,
} as const

const DADATA_PROVIDER_ENV_KEYS = {
  endpoint: 'VITE_DADATA_SUGGEST_URL',
  token: 'VITE_DADATA_TOKEN',
  suggestionCount: 'VITE_DADATA_SUGGEST_COUNT',
  debounceMs: 'VITE_DADATA_SUGGEST_DEBOUNCE_MS',
  minQueryLength: 'VITE_DADATA_SUGGEST_MIN_QUERY_LENGTH',
} as const

type DadataEnvKey = (typeof DADATA_PROVIDER_ENV_KEYS)[keyof typeof DADATA_PROVIDER_ENV_KEYS]
type DadataEnv = Partial<Record<DadataEnvKey, string>>

interface DadataSuggestionItem {
  value: string
}

interface DadataSuggestResponse {
  suggestions?: DadataSuggestionItem[]
}

const dadataEnv = (import.meta as ImportMeta & { env?: DadataEnv }).env ?? {}

function readEnvString(key: DadataEnvKey, fallback: string) {
  const value = dadataEnv[key]
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback
}

function readEnvPositiveInt(key: DadataEnvKey, fallback: number) {
  const value = dadataEnv[key]
  const parsed = Number.parseInt(value ?? '', 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

const DADATA_PROVIDER_CONFIG = {
  endpoint: readEnvString(DADATA_PROVIDER_ENV_KEYS.endpoint, DADATA_PROVIDER_DEFAULTS.endpoint),
  token: readEnvString(DADATA_PROVIDER_ENV_KEYS.token, DADATA_PROVIDER_DEFAULTS.token),
  suggestionCount: readEnvPositiveInt(DADATA_PROVIDER_ENV_KEYS.suggestionCount, DADATA_PROVIDER_DEFAULTS.suggestionCount),
  debounceMs: readEnvPositiveInt(DADATA_PROVIDER_ENV_KEYS.debounceMs, DADATA_PROVIDER_DEFAULTS.debounceMs),
  minQueryLength: readEnvPositiveInt(DADATA_PROVIDER_ENV_KEYS.minQueryLength, DADATA_PROVIDER_DEFAULTS.minQueryLength),
} as const

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

async function fetchAddressSuggestions(query: string, signal: AbortSignal) {
  const res = await fetch(DADATA_PROVIDER_CONFIG.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Token ${DADATA_PROVIDER_CONFIG.token}`,
    },
    body: JSON.stringify({
      query,
      count: DADATA_PROVIDER_CONFIG.suggestionCount,
    }),
    signal,
  })

  const data = (await res.json()) as DadataSuggestResponse
  return data.suggestions?.map(({ value }) => value) ?? []
}

export function useDadata() {
  const suggestions = ref<string[]>([])
  const loading = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null
  let requestController: AbortController | null = null
  let requestVersion = 0

  function cancelPendingRequest() {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }

    if (requestController) {
      requestController.abort()
      requestController = null
    }
  }

  async function suggest(query: string) {
    cancelPendingRequest()

    if (!query || query.length < DADATA_PROVIDER_CONFIG.minQueryLength) {
      requestVersion += 1
      suggestions.value = []
      loading.value = false
      return
    }

    const currentRequestVersion = ++requestVersion

    timer = setTimeout(async () => {
      timer = null
      const controller = new AbortController()
      requestController = controller
      loading.value = true

      try {
        const nextSuggestions = await fetchAddressSuggestions(query, controller.signal)

        if (currentRequestVersion !== requestVersion) {
          return
        }

        suggestions.value = nextSuggestions
      } catch (error) {
        if (isAbortError(error)) {
          return
        }

        if (currentRequestVersion === requestVersion) {
          suggestions.value = []
        }
      } finally {
        if (currentRequestVersion === requestVersion) {
          loading.value = false
        }

        if (requestController === controller) {
          requestController = null
        }
      }
    }, DADATA_PROVIDER_CONFIG.debounceMs)
  }

  function clear() {
    requestVersion += 1
    cancelPendingRequest()
    suggestions.value = []
    loading.value = false
  }

  return { suggestions, loading, suggest, clear }
}
