export function useDadata() {
  const suggestions = ref<string[]>([])
  const loading = ref(false)
  let timer: ReturnType<typeof setTimeout>

  async function suggest(query: string) {
    clearTimeout(timer)
    const normalizedQuery = query.trim()

    if (!normalizedQuery || normalizedQuery.length < 3) {
      suggestions.value = []
      return
    }

    timer = setTimeout(async () => {
      loading.value = true
      try {
        const res = await fetch('/api/dadata/address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: normalizedQuery }),
        })

        if (!res.ok) {
          throw new Error('Failed to load address suggestions')
        }

        const data = await res.json()
        suggestions.value = Array.isArray(data)
          ? data.filter((item): item is string => typeof item === 'string')
          : []
      } catch {
        suggestions.value = []
      } finally {
        loading.value = false
      }
    }, 300)
  }

  function clear() {
    clearTimeout(timer)
    suggestions.value = []
  }

  return { suggestions, loading, suggest, clear }
}
